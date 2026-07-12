import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createPendingOrder,
  shopifyAdminConfigured,
  type AdminOrderLineInput,
} from "@/lib/shopify-admin";
import { PRODUCTS, computeGrandTotal } from "@/lib/products";
import { sendCriticalAlert } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Shipping = {
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type CodOrderBody = {
  items?: Array<{ slug: string; qty: number }>;
  shipping?: Shipping;
  idempotencyKey?: string;
};

// Same IP rate limit pattern used in /api/contact.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > MAX_REQUESTS;
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "." };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function expandLines(
  items: Array<{ slug: string; qty: number }>
): AdminOrderLineInput[] {
  const out: AdminOrderLineInput[] = [];
  for (const it of items) {
    const p = PRODUCTS.find((pr) => pr.slug === it.slug);
    if (!p) continue;
    out.push({
      title: p.isCombo ? `${p.name} — ${p.weight}` : `${p.name} (${p.weight})`,
      priceRupees: p.price,
      quantity: it.qty,
      sku: p.slug,
      gramsPerUnit: 250,
    });
  }
  return out;
}

export async function POST(req: Request) {
  if (!shopifyAdminConfigured) {
    return NextResponse.json(
      { error: "Order processing is not configured. Please use online payment or contact us." },
      { status: 503 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in an hour." },
      { status: 429 }
    );
  }

  let body: CodOrderBody = {};
  try {
    body = (await req.json()) as CodOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Server-authoritative item + total derivation.
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (body.items.length > 20) {
    return NextResponse.json({ error: "Too many line items" }, { status: 400 });
  }
  const safeItems = body.items
    .filter(
      (it): it is { slug: string; qty: number } =>
        !!it && typeof it.slug === "string" && typeof it.qty === "number"
    )
    .map((it) => ({ slug: it.slug, qty: it.qty }));

  const totals = computeGrandTotal(safeItems);
  if (totals.lineCount === 0 || totals.grandTotal <= 0) {
    return NextResponse.json(
      { error: "Cart is empty or all items are invalid" },
      { status: 400 }
    );
  }

  const s = body.shipping || {};
  const name = (s.name || "").trim().slice(0, 100);
  const email = (s.email || "").trim().slice(0, 150);
  const phone = (s.phone || "").trim().slice(0, 32);
  const address1 = (s.address1 || "").trim().slice(0, 255);
  const address2 = (s.address2 || "").trim().slice(0, 255);
  const city = (s.city || "").trim().slice(0, 100);
  const state = (s.state || "").trim().slice(0, 100);
  const pincode = (s.pincode || "").trim().slice(0, 16);

  if (
    !name ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !/^[6-9]\d{9}$/.test(phone) ||
    !address1 ||
    !city ||
    !state ||
    !/^\d{6}$/.test(pincode)
  ) {
    return NextResponse.json(
      { error: "Please fill in all shipping fields correctly." },
      { status: 400 }
    );
  }

  // Deterministic idempotency key. Same items + same address + same hour →
  // same key. Prevents accidental double-orders from a double-click.
  const codReference = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        items: safeItems
          .map((it) => `${it.slug}:${it.qty}`)
          .sort()
          .join("|"),
        email,
        phone,
        pincode,
        address1,
        // Round to the hour so the same request inside 60min is dedup'd.
        bucket: Math.floor(Date.now() / (60 * 60 * 1000)),
      })
    )
    .digest("hex")
    .slice(0, 32);

  const result = await createPendingOrder({
    email,
    phone,
    shipping: {
      ...splitName(name),
      address1,
      address2,
      city,
      province: state,
      zip: pincode,
      country: "India",
      phone,
    },
    lines: expandLines(safeItems),
    shippingTitle:
      totals.shipping === 0
        ? "Free shipping (orders over ₹999)"
        : "Standard shipping",
    shippingPriceRupees: totals.shipping,
    discountRupees: totals.discount,
    discountLabel: totals.discount > 0 ? "Auto 10% off" : undefined,
    totalRupees: totals.grandTotal,
    codReference,
  });

  if (!result.ok) {
    console.error("[cod-order] failed", result.reason);
    // COD shoppers will see the friendly error below and (hopefully) retry,
    // but we still want the founder to know if the Shopify push errored —
    // recurring failures point to a token/scope/network issue.
    await sendCriticalAlert({
      subject: `COD order create FAILED for ₹${totals.grandTotal}`,
      bodyText: `A COD checkout submitted but the Shopify order push errored. Customer saw the retry message and may or may not try again. If you see multiple of these in a row, the Shopify Admin token / scopes may be wrong.\n\nReason: ${result.reason}`,
      notes: {
        codReference,
        email,
        phone,
        name,
        address: `${address1}${address2 ? `, ${address2}` : ""}`,
        city,
        state,
        pincode,
        items: safeItems.map((it) => `${it.slug}:${it.qty}`).join(";"),
        total: String(totals.grandTotal),
      },
    });
    return NextResponse.json(
      { error: "Couldn't create your order. Please try again or use online payment." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    orderName: result.orderName,
    statusPageUrl: result.statusPageUrl,
    total: totals.grandTotal,
  });
}
