// Single source of truth for every discount/shipping rule on the site.
// Edit the numbers below to change a promo — checkout, the Razorpay order
// endpoint, the COD/Shopify order push, the mini-cart banner and the /cart
// page all compute totals through the functions in this file, so nothing
// can drift out of sync between what a customer sees and what they're
// actually charged.

import { PRODUCTS } from "@/lib/products";

// ── Automatic cart discount ────────────────────────────────────────────────
// Applied automatically once the pre-discount item subtotal reaches the
// threshold — no code needed. Change either number to launch a different
// promo (e.g. 15% off ₹1500) with no other file needing to change.
export const CART_DISCOUNT_THRESHOLD = 1000;
export const CART_DISCOUNT_PCT = 10;

// ── Coupon codes ────────────────────────────────────────────────────────────
// Hand-entered at checkout. Add a new entry here to launch a new code — every
// place that applies/validates a coupon reads from this object, so adding a
// row is the only change needed to add a new promo code to the site.
//
// NOTE ON "WHATSAPP5": the website has no way to verify someone actually
// joined the WhatsApp community (that would require WhatsApp Business
// Platform / Cloud API automation, which is a separate integration outside
// this codebase) — so this is an honour-system code, shown directly on the
// CtaBanner once someone clicks through. That's the same model most small
// D2C brands use for a "join our list" code.
export const COUPONS: Record<string, { pct: number; label: string }> = {
  WHATSAPP5: { pct: 5, label: "WhatsApp community" },
};

// ── Shipping ────────────────────────────────────────────────────────────────
export const SHIPPING_FREE_THRESHOLD = 999;
export const SHIPPING_FLAT_RATE = 70;

export type DiscountType = "auto" | "coupon" | "none";

export type CartTotal = {
  subtotal: number;
  autoDiscount: number;
  couponDiscount: number;
  // The discount that actually applies — always the larger of the two above,
  // never both stacked, so a customer can't combine the auto threshold
  // discount with a coupon for more than either gives alone.
  discount: number;
  discountType: DiscountType;
  discountLabel?: string;
  // False only when a code was supplied and it doesn't match anything in
  // COUPONS — lets the UI show "code not recognized" without blocking
  // checkout (an unrecognized code is simply treated as no coupon).
  couponValid: boolean;
  total: number;
  lineCount: number;
};

export function computeCartTotal(
  items: Array<{ slug: string; qty: number }>,
  couponCode?: string
): CartTotal {
  let subtotal = 0;
  let lineCount = 0;
  for (const line of items) {
    const p = PRODUCTS.find((pr) => pr.slug === line.slug);
    if (!p) continue;
    const qty = Math.max(0, Math.min(99, Math.floor(line.qty)));
    if (qty === 0) continue;
    subtotal += p.price * qty;
    lineCount += qty;
  }

  const autoDiscount =
    subtotal >= CART_DISCOUNT_THRESHOLD
      ? Math.round(subtotal * (CART_DISCOUNT_PCT / 100))
      : 0;

  // `couponCode` ultimately comes from untrusted request JSON at the API
  // routes, so guard against a non-string value (e.g. a malicious client
  // sending `couponCode: 123`) rather than letting `.trim()` throw.
  const normalizedCode =
    typeof couponCode === "string" && couponCode.trim()
      ? couponCode.trim().toUpperCase().slice(0, 64)
      : undefined;
  const coupon = normalizedCode ? COUPONS[normalizedCode] : undefined;
  const couponValid = !normalizedCode || !!coupon;
  const couponDiscount = coupon ? Math.round(subtotal * (coupon.pct / 100)) : 0;

  let discount = 0;
  let discountType: DiscountType = "none";
  let discountLabel: string | undefined;
  if (couponDiscount > 0 && couponDiscount >= autoDiscount) {
    discount = couponDiscount;
    discountType = "coupon";
    discountLabel = `${coupon!.pct}% off · ${coupon!.label}`;
  } else if (autoDiscount > 0) {
    discount = autoDiscount;
    discountType = "auto";
    discountLabel = `Auto ${CART_DISCOUNT_PCT}% off`;
  }

  return {
    subtotal,
    autoDiscount,
    couponDiscount,
    discount,
    discountType,
    discountLabel,
    couponValid,
    total: subtotal - discount,
    lineCount,
  };
}

// Shipping is computed on the post-discount items total, so a customer can't
// game the free-shipping threshold via a discount.
export function computeShipping(params: {
  itemsSubtotal: number;
}): { price: number; isFree: boolean; label: string } {
  if (params.itemsSubtotal >= SHIPPING_FREE_THRESHOLD) {
    return { price: 0, isFree: true, label: "Free shipping" };
  }
  return {
    price: SHIPPING_FLAT_RATE,
    isFree: false,
    label: "Standard shipping",
  };
}

// One-stop authoritative grand total: items − discount + shipping. Used by
// the Razorpay order endpoint to compute the amount actually charged AND by
// the COD endpoint to set the Shopify order total. The client derives the
// same number for display via the exact same function; if a client-supplied
// total ever disagreed, the server (which always recomputes independently)
// wins.
export function computeGrandTotal(
  items: Array<{ slug: string; qty: number }>,
  couponCode?: string
) {
  const cart = computeCartTotal(items, couponCode);
  const shipping = computeShipping({ itemsSubtotal: cart.total });
  return {
    subtotal: cart.subtotal,
    discount: cart.discount,
    discountType: cart.discountType,
    discountLabel: cart.discountLabel,
    couponValid: cart.couponValid,
    itemsTotal: cart.total,
    shipping: shipping.price,
    shippingLabel: shipping.label,
    grandTotal: cart.total + shipping.price,
    lineCount: cart.lineCount,
  };
}
