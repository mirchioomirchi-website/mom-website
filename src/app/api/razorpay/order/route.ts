import { NextResponse } from "next/server";
import { createOrder, razorpayServerConfigured } from "@/lib/razorpay";
import { computeGrandTotal } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderItem = { slug: string; qty: number };

type OrderBody = {
  items?: OrderItem[];
  // Legacy single-amount path for the RazorpayCheckout standalone widget.
  // Only used when items is absent. Bounded server-side to prevent tampering.
  amount?: number;
  receipt?: string;
  notes?: Record<string, string>;
};

// Cap notes values + count to satisfy Razorpay's limits.
// Razorpay: max 15 keys, max 256 chars per value, key length 1-256.
function sanitizeNotes(
  input: Record<string, string> | undefined
): Record<string, string> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string> = {};
  let count = 0;
  for (const [key, raw] of Object.entries(input)) {
    if (count >= 15) break;
    if (typeof key !== "string" || !key.length || key.length > 256) continue;
    const value = typeof raw === "string" ? raw : String(raw ?? "");
    out[key] = value.slice(0, 256);
    count += 1;
  }
  return out;
}

// Razorpay receipt: max 40 chars. Strip anything outside [A-Za-z0-9_-].
function sanitizeReceipt(raw: string | undefined): string {
  const base = (raw || `mom-${Date.now()}`).replace(/[^A-Za-z0-9_\-]/g, "").slice(0, 40);
  return base.length > 0 ? base : `mom-${Date.now()}`.slice(0, 40);
}

export async function POST(req: Request) {
  if (!razorpayServerConfigured) {
    return NextResponse.json(
      { error: "Razorpay is not configured on the server" },
      { status: 503 }
    );
  }

  let body: OrderBody = {};
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // --- Server-side amount derivation (PRIMARY path) --------------------------
  // When `items` is provided, we IGNORE any client-supplied `amount` and
  // compute the authoritative total from the product catalogue. This prevents
  // a malicious client from POSTing `{amount: 1}` and getting a ₹1 order.
  let rupees: number;
  let derivedNotes: Record<string, string> = {};

  if (Array.isArray(body.items) && body.items.length > 0) {
    if (body.items.length > 20) {
      return NextResponse.json(
        { error: "Too many line items" },
        { status: 400 }
      );
    }
    const safeItems = body.items
      .filter(
        (it): it is OrderItem =>
          !!it && typeof it.slug === "string" && typeof it.qty === "number"
      )
      .map((it) => ({ slug: it.slug, qty: it.qty }));

    const { subtotal, discount, itemsTotal, shipping, grandTotal, lineCount } =
      computeGrandTotal(safeItems);

    if (lineCount === 0 || grandTotal <= 0) {
      return NextResponse.json(
        { error: "Cart is empty or all items are invalid" },
        { status: 400 }
      );
    }
    rupees = grandTotal;
    derivedNotes = {
      subtotal: String(subtotal),
      discount: String(discount),
      items_total: String(itemsTotal),
      shipping: String(shipping),
      total: String(grandTotal),
      items: safeItems
        .map((it) => `${it.slug}:${it.qty}`)
        .join(";")
        .slice(0, 256),
    };
  } else {
    // --- Legacy single-amount path (RazorpayCheckout standalone widget) -----
    const n = Number(body.amount);
    if (!Number.isFinite(n) || n < 1 || n > 5_00_000) {
      return NextResponse.json(
        {
          error:
            "Provide items: [{slug, qty}] or a valid amount between 1 and 500000",
        },
        { status: 400 }
      );
    }
    rupees = n;
  }

  const amountInPaise = Math.round(rupees * 100);
  const receipt = sanitizeReceipt(body.receipt);
  const notes = sanitizeNotes({ ...derivedNotes, ...body.notes });

  try {
    const order = await createOrder({
      amountInPaise,
      receipt,
      notes,
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[razorpay] order create failed", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 502 });
  }
}
