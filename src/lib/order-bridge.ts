// Bridge: take Razorpay payment data (notes + amount) and forward it to
// Shopify Admin as a paid order. Idempotent — safe to call from both the
// /api/razorpay/verify endpoint AND the /api/razorpay/webhook endpoint;
// whichever wins the race creates the order, the loser sees alreadyExists.

import {
  createPaidOrder,
  hasUsedCoupon,
  shopifyAdminConfigured,
  type CreateOrderResult,
  type AdminOrderLineInput,
} from "@/lib/shopify-admin";
import { PRODUCTS } from "@/lib/products";
import { computeCartTotal, computeShipping } from "@/lib/discounts";

export type RazorpayBridgeInput = {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  notes?: Record<string, string>;
};

function parseItems(itemsStr?: string) {
  if (!itemsStr) return [] as Array<{ slug: string; qty: number }>;
  return itemsStr
    .split(";")
    .map((entry) => {
      const [slug, qtyStr] = entry.split(":");
      const qty = Number(qtyStr);
      if (!slug || !Number.isFinite(qty) || qty <= 0) return null;
      return { slug, qty };
    })
    .filter((x): x is { slug: string; qty: number } => x !== null);
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "." };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function expandComboLines(
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

export async function pushRazorpayOrderToShopify(
  input: RazorpayBridgeInput
): Promise<CreateOrderResult> {
  if (!shopifyAdminConfigured) {
    return { ok: false, reason: "Shopify Admin not configured" };
  }
  const notes = input.notes || {};
  const items = parseItems(notes.items);
  if (items.length === 0) {
    return { ok: false, reason: "No items in payment notes" };
  }

  const {
    subtotal,
    discount,
    discountLabel,
    couponCode: appliedCouponCode,
    total: itemsTotal,
  } = computeCartTotal(items, notes.coupon_code);
  const shipping = computeShipping({ itemsSubtotal: subtotal });

  const expectedTotal = itemsTotal + shipping.price;
  const paidRupees = Math.round(input.amountInPaise / 100);
  const mismatchRupees = Math.abs(paidRupees - expectedTotal);

  // Sanity check: if Razorpay captured ≠ our recomputed expected total
  // (allow ₹1 for rounding), log AND surface to the founder. We still create
  // the order so the customer's payment doesn't fall through the cracks —
  // but we attach a `flagged-mismatch` tag + spelled-out note so the order
  // is filterable in Shopify Admin and the founder can investigate.
  const isMismatched = mismatchRupees > 1;

  // Coupon-reuse safety net. /api/razorpay/order already checks
  // hasUsedCoupon() (and holds a short-lived reservation, see
  // src/lib/coupon-lock.ts) before payment even starts, so this should
  // essentially never fire — but this is the authoritative point where the
  // order is actually about to be written, several seconds to minutes after
  // that first check, so we re-verify against Shopify itself right here. We
  // do NOT block order creation on this: the customer has already paid, and
  // refusing to create their order would be a much worse outcome than a rare
  // extra 5% discount slipping through. Instead, same treatment as an amount
  // mismatch — tag + note it so it's visible in Shopify Admin and the
  // founder can decide whether to act on it.
  let couponReused = false;
  if (appliedCouponCode) {
    try {
      couponReused = await hasUsedCoupon({
        email: notes.email,
        phone: notes.phone,
        code: appliedCouponCode,
      });
    } catch (err) {
      console.error("[order-bridge] coupon-reuse re-check threw", err);
      couponReused = false; // fail open, consistent with hasUsedCoupon itself
    }
  }

  const extraTags = [
    ...(isMismatched ? ["flagged-mismatch"] : []),
    ...(couponReused ? ["flagged-coupon-reuse"] : []),
  ];
  const extraNote =
    (isMismatched
      ? ` [AMOUNT MISMATCH: paid ₹${paidRupees} vs expected ₹${expectedTotal} (Δ ₹${mismatchRupees})]`
      : "") +
    (couponReused
      ? ` [COUPON REUSE: ${appliedCouponCode} appears to have already been used by this customer — order still created since payment was already captured, please review]`
      : "");

  if (isMismatched) {
    console.warn(
      `[order-bridge] AMOUNT MISMATCH on ${input.razorpayPaymentId}: paid ₹${paidRupees} vs expected ₹${expectedTotal}. Order tagged flagged-mismatch.`
    );
  }
  if (couponReused) {
    console.warn(
      `[order-bridge] COUPON REUSE on ${input.razorpayPaymentId}: ${appliedCouponCode} already used by this customer. Order tagged flagged-coupon-reuse.`
    );
  }

  const result = await createPaidOrder({
    email: notes.email || "",
    phone: notes.phone || "",
    shipping: {
      ...splitName(notes.name || "Customer"),
      address1: notes.address || "Address on file",
      city: notes.city || "Unknown",
      province: notes.state,
      zip: notes.pincode || "000000",
      country: "India",
      phone: notes.phone,
    },
    lines: expandComboLines(items),
    shippingTitle:
      shipping.price === 0 ? "Free shipping (orders over ₹999)" : "Standard shipping",
    shippingPriceRupees: shipping.price,
    discountRupees: discount,
    discountLabel,
    appliedCouponCode,
    totalRupees: paidRupees,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpayOrderId: input.razorpayOrderId,
    extraTags,
    extraNote,
  });

  return result;
}
