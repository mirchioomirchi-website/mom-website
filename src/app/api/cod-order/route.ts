import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createPendingOrder,
  hasUsedCoupon,
  shopifyAdminConfigured,
  type AdminOrderLineInput,
} from "@/lib/shopify-admin";
import { PRODUCTS, getProduct } from "@/lib/products";
import { computeGrandTotal, SHIPPING_FREE_THRESHOLD, COD_MAX_ORDER_RUPEES } from "@/lib/discounts";
import { getUnavailableSlugs } from "@/lib/products-source";
import { sendCriticalAlert } from "@/lib/email";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { isMumbaiPincode, OUTSIDE_MUMBAI_MESSAGE } from "@/lib/shiprocket";
import { tryReserveCoupon, releaseCouponReservation, couponLockKeyFor } from "@/lib/coupon-lock";

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
  couponCode?: string;
};

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

  const ip = getClientIp(req);

  if (isRateLimited(`cod-order:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 })) {
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

  // Server-authoritative stock check — same reasoning as the Razorpay order
  // route: any client-side "sold out" state can be stale, this is the check
  // that actually stops an unfulfillable COD order from being created.
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

  const totals = computeGrandTotal(safeItems, body.couponCode);
  if (totals.lineCount === 0 || totals.grandTotal <= 0) {
    return NextResponse.json(
      { error: "Cart is empty or all items are invalid" },
      { status: 400 }
    );
  }
  // COD carries no payment-verification step at all, so it's capped lower
  // than the Razorpay ceiling — see the constant's comment in discounts.ts.
  if (totals.grandTotal > COD_MAX_ORDER_RUPEES) {
    return NextResponse.json(
      { error: "This order is too large for cash on delivery. Please use online payment or contact us." },
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
  // Server-side re-check — the checkout UI already blocks non-Mumbai
  // pincodes live, but that's client-side and can be raced or bypassed by a
  // direct API call, so this is the check that actually matters.
  if (!isMumbaiPincode(pincode)) {
    return NextResponse.json({ error: OUTSIDE_MUMBAI_MESSAGE }, { status: 400 });
  }

  // Per-customer coupon cap — single-use codes like SIGNUP5 are honour-system
  // at the point of entry (anyone can type the code), so this is the actual
  // enforcement: reject if this email or phone already has an order tagged
  // with this coupon. Checked here rather than left to the client so it
  // can't be bypassed by simply not showing the "already used" state.
  //
  // Also grabs the same short-lived reservation used by the Razorpay-order
  // route (src/lib/coupon-lock.ts) so a concurrent Razorpay checkout with
  // the same code+customer can't slip through in the gap between this check
  // and the order actually being created below — COD's own gap is already
  // narrow (synchronous, same request), but the code is shared across
  // channels so the lock needs to be too.
  let couponLockKey: string | undefined;
  if (totals.couponCode) {
    const alreadyUsed = await hasUsedCoupon({ email, phone, code: totals.couponCode });
    if (alreadyUsed) {
      return NextResponse.json(
        { error: `You've already used ${totals.couponCode}. It's valid once per customer.` },
        { status: 400 }
      );
    }
    couponLockKey = couponLockKeyFor(totals.couponCode, email, phone);
    if (!tryReserveCoupon(couponLockKey, 2 * 60 * 1000)) {
      return NextResponse.json(
        { error: `You've already used ${totals.couponCode}. It's valid once per customer.` },
        { status: 400 }
      );
    }
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
        ? `Free shipping (orders over ₹${SHIPPING_FREE_THRESHOLD})`
        : "Standard shipping",
    shippingPriceRupees: totals.shipping,
    discountRupees: totals.discount,
    discountLabel: totals.discountLabel,
    appliedCouponCode: totals.couponCode,
    totalRupees: totals.grandTotal,
    codReference,
  });

  // COD creates the order synchronously in this same request (unlike
  // Razorpay, which waits on payment) — nothing after this point can still
  // race on this coupon, so release the reservation immediately rather than
  // holding it the full 2 minutes and blocking a legitimate retry.
  if (couponLockKey) releaseCouponReservation(couponLockKey);

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
