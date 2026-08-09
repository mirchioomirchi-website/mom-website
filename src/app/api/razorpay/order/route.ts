import { NextResponse } from "next/server";
import { createOrder, razorpayServerConfigured } from "@/lib/razorpay";
import { computeGrandTotal, RAZORPAY_MAX_ORDER_RUPEES } from "@/lib/discounts";
import { getUnavailableSlugs } from "@/lib/products-source";
import { getProduct } from "@/lib/products";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { isMumbaiPincode, OUTSIDE_MUMBAI_MESSAGE } from "@/lib/shiprocket";
import { hasUsedCoupon } from "@/lib/shopify-admin";
import { tryReserveCoupon, releaseCouponReservation, couponLockKeyFor } from "@/lib/coupon-lock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderItem = { slug: string; qty: number };

type OrderBody = {
  items?: OrderItem[];
  // Optional coupon code entered at checkout (e.g. "SIGNUP5"). Re-validated
  // here from scratch — the client's discount preview is never trusted.
  couponCode?: string;
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

  const ip = getClientIp(req);
  if (isRateLimited(`razorpay-order:${ip}`, { windowMs: 60 * 60 * 1000, max: 20 })) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in an hour." },
      { status: 429 }
    );
  }

  let body: OrderBody = {};
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Items are required — the only real caller (the checkout page) always
  // sends them, so we compute the authoritative total from the product
  // catalogue rather than ever trusting a client-supplied amount. (A legacy
  // path that accepted a bare `amount` used to exist for a standalone widget
  // component; that component isn't part of the live site anymore, and an
  // unauthenticated "create a Razorpay order for any amount I say" endpoint
  // isn't something worth keeping around, so it's been removed.)
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty or invalid" },
      { status: 400 }
    );
  }
  if (body.items.length > 20) {
    return NextResponse.json(
      { error: "Too many line items" },
      { status: 400 }
    );
  }

  // Server-side re-check — the checkout UI already blocks non-Mumbai
  // pincodes live via /api/pincode, but that's client-side and can be raced
  // or bypassed by a direct API call. The checkout page always sends the
  // shipping pincode through in `notes.pincode` as part of the same request
  // that carries `items`, so — unlike the old legacy path — there's no
  // longer a legitimate reason for it to be missing. Fail closed: no
  // pincode, no order.
  const notedPincode = body.notes?.pincode;
  if (typeof notedPincode !== "string" || !notedPincode) {
    return NextResponse.json(
      { error: "Missing shipping pincode." },
      { status: 400 }
    );
  }
  if (!isMumbaiPincode(notedPincode)) {
    return NextResponse.json({ error: OUTSIDE_MUMBAI_MESSAGE }, { status: 400 });
  }

  const safeItems = body.items
    .filter(
      (it): it is OrderItem =>
        !!it && typeof it.slug === "string" && typeof it.qty === "number"
    )
    .map((it) => ({ slug: it.slug, qty: it.qty }));

  // Server-authoritative stock check, right before we ask Razorpay for an
  // order. Any client-side "sold out" state can be stale (a second tab, a
  // cart built up before a flavor sold out) — this is the check that
  // actually stops a customer from paying for something that isn't
  // fulfillable.
  const unavailable = await getUnavailableSlugs(safeItems);
  if (unavailable.length > 0) {
    const names = unavailable
      .map((slug) => getProduct(slug)?.name ?? slug)
      .join(", ");
    return NextResponse.json(
      {
        error: `Sorry, this just sold out: ${names}. Please remove it from your cart and try again.`,
      },
      { status: 409 }
    );
  }

  const {
    subtotal,
    discount,
    discountType,
    discountLabel,
    couponCode: appliedCouponCode,
    shipping,
    grandTotal,
    lineCount,
  } = computeGrandTotal(safeItems, body.couponCode);

  if (lineCount === 0 || grandTotal <= 0) {
    return NextResponse.json(
      { error: "Cart is empty or all items are invalid" },
      { status: 400 }
    );
  }
  if (grandTotal > RAZORPAY_MAX_ORDER_RUPEES) {
    return NextResponse.json(
      { error: "Order total exceeds what we can process online. Please contact us to place this order." },
      { status: 400 }
    );
  }

  // Per-customer coupon cap — same reasoning and mechanism as the COD
  // route's check: single-use codes like SIGNUP5 are honour-system at
  // entry, this is the actual server-side enforcement, checked before we
  // even ask Razorpay for an order so a repeat use never gets that far.
  //
  // hasUsedCoupon() alone only protects against a customer who has already
  // COMPLETED a paid order with this code — it can't see an order that's
  // mid-payment right now in a different tab/request. So we also grab a
  // short-lived reservation (see src/lib/coupon-lock.ts) that's held until
  // the Shopify order is actually written in order-bridge.ts, which is the
  // real close of this race window given payment can take minutes.
  let couponLockKey: string | undefined;
  if (appliedCouponCode) {
    const alreadyUsed = await hasUsedCoupon({
      email: body.notes?.email,
      phone: body.notes?.phone,
      code: appliedCouponCode,
    });
    if (alreadyUsed) {
      return NextResponse.json(
        { error: `You've already used ${appliedCouponCode}. It's valid once per customer.` },
        { status: 400 }
      );
    }

    couponLockKey = couponLockKeyFor(appliedCouponCode, body.notes?.email, body.notes?.phone);
    if (!tryReserveCoupon(couponLockKey, 30 * 60 * 1000)) {
      return NextResponse.json(
        { error: `You've already used ${appliedCouponCode}. It's valid once per customer.` },
        { status: 400 }
      );
    }
  }

  const rupees = grandTotal;
  // Kept compact — Razorpay caps notes at 15 keys total, and the shipping
  // contact fields (name/email/phone/address/city/state/pincode) plus
  // coupon_code sent from the client need the remaining slots. `itemsTotal`
  // (subtotal − discount) isn't stored separately since it's trivially
  // derivable from subtotal + discount.
  const derivedNotes: Record<string, string> = {
    subtotal: String(subtotal),
    discount: String(discount),
    discount_type: discountType,
    ...(discountLabel ? { discount_label: discountLabel } : {}),
    shipping: String(shipping),
    total: String(grandTotal),
    items: safeItems
      .map((it) => `${it.slug}:${it.qty}`)
      .join(";")
      .slice(0, 256),
  };

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
    // Razorpay order creation itself failed — release the coupon reservation
    // so this customer isn't locked out of a code they never actually got to
    // use, in case they retry.
    if (couponLockKey) releaseCouponReservation(couponLockKey);
    console.error("[razorpay] order create failed", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 502 });
  }
}
