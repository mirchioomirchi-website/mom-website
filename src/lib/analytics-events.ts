// Typed GA4 e-commerce + engagement event helpers.
//
// Standard event names follow the GA4 reference:
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events
//
// Every helper is safe to call on the server — `trackEvent` no-ops when
// `window` is undefined or gtag/fbq haven't loaded yet (env var missing).

import { trackEvent } from "@/components/Analytics";
import { PRODUCTS, type Product, getProduct } from "@/lib/products";

const CURRENCY = "INR";
const BRAND = "Mirchi O Mirchi";

type CartLineInput = { slug: string; qty: number };

type Ga4Item = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  item_variant?: string;
  price: number;
  quantity: number;
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
};

function productToItem(product: Product, qty = 1, index?: number): Ga4Item {
  return {
    item_id: product.slug,
    item_name: product.name,
    item_brand: BRAND,
    item_category: product.isCombo ? "Combo Pack" : "Thecha",
    price: product.price,
    quantity: qty,
    ...(index !== undefined ? { index } : {}),
  };
}

function linesToItems(lines: CartLineInput[]): Ga4Item[] {
  return lines
    .map((l) => {
      const product = getProduct(l.slug);
      return product ? productToItem(product, l.qty) : null;
    })
    .filter((x): x is Ga4Item => x !== null);
}

function cartValue(lines: CartLineInput[]): number {
  return lines.reduce((sum, l) => {
    const p = getProduct(l.slug);
    return sum + (p?.price ?? 0) * l.qty;
  }, 0);
}

// ===== E-commerce events =====

export function trackViewItem(product: Product) {
  trackEvent("view_item", {
    currency: CURRENCY,
    value: product.price,
    items: [productToItem(product)],
  });
}

export function trackViewItemList(
  products: Product[],
  listName = "Shop",
  listId = "shop_grid"
) {
  trackEvent("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: products.map((p, i) => ({
      ...productToItem(p, 1, i),
      item_list_id: listId,
      item_list_name: listName,
    })),
  });
}

export function trackSelectItem(
  product: Product,
  listName = "Shop",
  listId = "shop_grid",
  index?: number
) {
  trackEvent("select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [
      {
        ...productToItem(product, 1, index),
        item_list_id: listId,
        item_list_name: listName,
      },
    ],
  });
}

export function trackAddToCart(product: Product, qty = 1) {
  trackEvent("add_to_cart", {
    currency: CURRENCY,
    value: product.price * qty,
    items: [productToItem(product, qty)],
  });
}

export function trackRemoveFromCart(product: Product, qty = 1) {
  trackEvent("remove_from_cart", {
    currency: CURRENCY,
    value: product.price * qty,
    items: [productToItem(product, qty)],
  });
}

export function trackViewCart(lines: CartLineInput[]) {
  trackEvent("view_cart", {
    currency: CURRENCY,
    value: cartValue(lines),
    items: linesToItems(lines),
  });
}

export function trackBeginCheckout(
  lines: CartLineInput[],
  total: number,
  coupon?: string
) {
  trackEvent("begin_checkout", {
    currency: CURRENCY,
    value: total,
    ...(coupon ? { coupon } : {}),
    items: linesToItems(lines),
  });
}

export function trackAddPaymentInfo(
  lines: CartLineInput[],
  total: number,
  paymentType: "razorpay" | "cod"
) {
  trackEvent("add_payment_info", {
    currency: CURRENCY,
    value: total,
    payment_type: paymentType,
    items: linesToItems(lines),
  });
}

export function trackAddShippingInfo(
  lines: CartLineInput[],
  total: number,
  shippingTier: string
) {
  trackEvent("add_shipping_info", {
    currency: CURRENCY,
    value: total,
    shipping_tier: shippingTier,
    items: linesToItems(lines),
  });
}

export function trackPurchase(opts: {
  transactionId: string;
  lines: CartLineInput[];
  value: number;
  shipping: number;
  tax?: number;
  discount?: number;
  paymentType: "razorpay" | "cod";
  coupon?: string;
}) {
  trackEvent("purchase", {
    transaction_id: opts.transactionId,
    currency: CURRENCY,
    value: opts.value,
    shipping: opts.shipping,
    ...(opts.tax !== undefined ? { tax: opts.tax } : {}),
    ...(opts.coupon ? { coupon: opts.coupon } : {}),
    payment_type: opts.paymentType,
    items: linesToItems(opts.lines),
  });
}

// ===== Engagement events =====

export function trackSignUp(method: string = "newsletter") {
  trackEvent("sign_up", { method });
}

export function trackGenerateLead(formName: string, value?: number) {
  trackEvent("generate_lead", {
    currency: CURRENCY,
    ...(value !== undefined ? { value } : {}),
    form_name: formName,
  });
}

export function trackClickCTA(ctaName: string, location: string) {
  trackEvent("click_cta", {
    cta_name: ctaName,
    cta_location: location,
  });
}

export function trackContact(channel: "form" | "email" | "phone") {
  trackEvent("contact", { method: channel });
}

// Keep PRODUCTS imported so `import { PRODUCTS } from "@/lib/analytics-events"`
// works as a sanity check — avoids "unused" lint flags on the import.
export { PRODUCTS };
