// Single source of truth for product data
export type Product = {
  slug: string;
  name: string;
  shortName: string;
  flavor: "green" | "mixed" | "red" | "combo";
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  weight: string;
  image: string;
  color: string;
  accentRgb: string;
  speech: string;
  ingredients: string[];
  pairings: string[];
  spiceLevel: number; // 1-5
  badge?: string;
  isCombo?: boolean;
  comboItems?: string[];
  // ── PDP-specific fields ──────────────────────────────────────────────
  // Free-text heat label shown on the product page (e.g. "Medium - Hot").
  // Distinct from the numeric spiceLevel used for the chili-icon indicator.
  heatLevel: string;
  // Punchy brand-voice paragraph used in the PDP "story" section — separate
  // from longDescription (which is the factual jar-copy in the hero).
  storyText: string;
  // Macro/closeup product photo + a secondary lifestyle photo, both meant to
  // come from Shopify product metafields. Optional — components fall back
  // to a color-tinted panel with the front jar shot when a flavor doesn't
  // have real photography yet.
  closeupImage?: string;
  secondaryImage?: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "green-chilli-thecha",
    name: "Green Chilli Thecha",
    shortName: "Green Chilli",
    flavor: "green",
    tagline: "Fresh. Garlicky. Addictive.",
    description:
      "Hand-pounded green chillies, fresh garlic and olive oil. The OG — fresh, garlicky and dangerously addictive.",
    longDescription:
      "Our Green Chilli thecha is the original — sharp, fresh and built for people who like their flavour with a kick. We use hand-picked green chillies, pound them in stone mortars and blend with garlic and olive oil.",
    price: 299,
    originalPrice: 399,
    weight: "250g",
    image: "/images/jar-green-final.webp",
    color: "#7BB55E",
    accentRgb: "123, 181, 94",
    speech: "Classy. Sassy. Thodi bad-assy.",
    ingredients: [
      "Fresh green chillies",
      "Fresh garlic",
      "Coriander",
      "Cold pressed oil",
      "Lemon juice",
      "Rock salt & cumin",
    ],
    pairings: [
      "Hot Bhakri",
      "Dal-Rice",
      "Paratha",
      "Cheese toast",
      "Maggi",
    ],
    spiceLevel: 4,
    badge: "Bestseller",
    heatLevel: "Mild - Medium",
    storyText:
      "This one keeps it fresh. Spoon it over rice, fold it into curd, or eat it straight off a hot bhakri — Green Chilli Thecha is for whoever asked for 'more garlic, less rules.'",
  },
  {
    slug: "red-chilli-thecha",
    name: "Red Chilli Thecha",
    shortName: "Red Chilli",
    flavor: "red",
    tagline: "Bold. Fiery. Garlicky.",
    description:
      "Whole red chillies, fresh garlic and olive oil. A bold red thecha with fiery heat, a garlicky kick and a heat that builds.",
    longDescription:
      "Whole red chillies stone-ground with raw garlic and olive oil. Rich, dark, and deeply hot — pairs with anything that needs life.",
    price: 299,
    originalPrice: 399,
    weight: "250g",
    image: "/images/jar-red-final.webp",
    color: "#E53935",
    accentRgb: "229, 57, 53",
    speech: "Too hot to handle, baby.",
    ingredients: [
      "Fresh red chillies",
      "Fresh garlic",
      "Coriander",
      "Cold pressed oil",
      "Lemon juice",
      "Rock salt & cumin",
    ],
    pairings: [
      "Dosa",
      "Roti",
      "Pulao",
      "Avocado Toast",
      "Anything boring",
    ],
    spiceLevel: 5,
    heatLevel: "Medium - Hot",
    storyText:
      "This one doesn't play safe. Stir it into dal-chawal, smear it on a sandwich, or eat it off the spoon — Red Chilli Thecha is for whoever asked for 'more spicy.'",
    closeupImage: "/images/pdp/red-closeup.webp",
    secondaryImage: "/images/pdp/red-secondary.webp",
  },
  {
    slug: "mixed-chilli-thecha",
    name: "Mixed Chilli Thecha",
    shortName: "Mixed Chilli",
    flavor: "mixed",
    tagline: "Punchy. Complex. Full Power.",
    description:
      "Green and red chillies, fresh garlic and olive oil — bright, bold and layered.",
    longDescription:
      "Green and red chillies stone-ground into one bold and layered thecha. Best of both heats in one jar.",
    price: 299,
    originalPrice: 399,
    weight: "250g",
    image: "/images/jar-mixed-final.webp",
    color: "#FF9A1E",
    accentRgb: "255, 154, 30",
    speech: "Mirchi lagi toh? IDGAFlying Chappal!",
    ingredients: [
      "Fresh green chillies",
      "Fresh red chillies",
      "Fresh garlic",
      "Coriander",
      "Cold pressed oil",
      "Lemon juice",
      "Rock salt & cumin",
    ],
    pairings: [
      "Vada Pav",
      "Misal",
      "Steamed rice with dal",
      "Eggs",
      "Maggi",
    ],
    spiceLevel: 4,
    heatLevel: "Medium - Hot",
    storyText:
      "This one doesn't pick sides. Stir it into misal, load it onto vada pav, or eat it off the spoon — Mixed Chilli Thecha is for whoever asked for 'both, actually.'",
  },
  {
    slug: "combo-pack",
    name: "Combo Pack",
    shortName: "Combo Pack",
    flavor: "combo",
    tagline: "Three Heats. Save ₹100.",
    description:
      "All three flavours — Green, Mixed, Red — together. Save ₹100 vs buying separately.",
    longDescription:
      "Can't pick a favourite? You don't have to. The Combo Pack gives you all three flavours in one go — fresh green, bold red and fiery mixed — at a price that beats buying separately. Great gift, great trial set, great answer to the question 'which one is the spiciest?'",
    price: 799,
    originalPrice: 899,
    weight: "3 × 250g",
    image: "/images/jar-mixed-final.webp",
    color: "#F5197F",
    accentRgb: "245, 25, 127",
    speech: "Why pick? Take all three.",
    ingredients: [
      "1 × Green Chilli Thecha (250g)",
      "1 × Mixed Chilli Thecha (250g)",
      "1 × Red Chilli Thecha (250g)",
    ],
    pairings: [
      "A full pantry refresh",
      "A perfect housewarming gift",
      "Recipe experiments",
      "Spice lovers",
    ],
    spiceLevel: 5,
    badge: "Best Value",
    isCombo: true,
    comboItems: [
      "/images/jar-green-final.webp",
      "/images/jar-mixed-final.webp",
      "/images/jar-red-final.webp",
    ],
    heatLevel: "Mild - Hot",
    storyText:
      "Can't pick a favourite? Don't. Keep all three within arm's reach — on the table, in the fridge, wherever flavour's needed — Combo Pack is for whoever asked for 'why choose.'",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.slug !== slug);
}

// Clean, product-only photography (no lifestyle staging) used in compact UI
// contexts — the cart drawer's line-item rows, PDP cross-sell cards — where
// the fuller "-final" jar renders read too busy. Single source of truth so
// every place that needs a small product thumbnail stays in sync, with a
// dedicated combo-pack shot instead of falling back to a single jar.
export const PRODUCT_CARD_IMAGES: Record<string, string> = {
  "green-chilli-thecha": "/images/green chilli.png",
  "red-chilli-thecha": "/images/red chilli.png",
  "mixed-chilli-thecha": "/images/mixed chilli.png",
  "combo-pack": "/images/combo products.png",
};

// PDP-only accent colors. `product.color` (the bright candy hexes used for
// character illustrations, shop cards, etc.) is intentionally vivid for
// those other contexts — but on the Product Detail Page every other element
// (buttons, dividers, banners) draws from the site's single global palette
// (globals.css --color-* tokens). This map keeps the PDP's per-flavor tints
// (ingredients banner text, cross-sell highlight background, marquee text,
// hero fallback panel) inside that same palette instead of introducing a
// second, mismatched color system on just this one page.
export const PDP_ACCENT_COLOR: Record<Product["flavor"], string> = {
  green: "var(--color-green)",
  red: "var(--color-red)",
  mixed: "var(--color-orange)",
  combo: "var(--color-pink)",
};

// Discount config — must match CheckoutPageClient.tsx so the server-computed
// total and the client-displayed total agree.
export const CART_DISCOUNT_THRESHOLD = 1000;
export const CART_DISCOUNT_PCT = 10;

// Shipping config — must match CheckoutPageClient.tsx + CartPageClient.tsx so
// the displayed total and the Razorpay/Shopify-charged total agree.
export const SHIPPING_FREE_THRESHOLD = 999;
export const SHIPPING_FLAT_RATE = 70;

// Authoritative server-side price computation. Used by /api/razorpay/order to
// derive the true order amount from a list of {slug, qty} items, so a malicious
// client cannot tamper with the amount.
export function computeCartTotal(
  items: Array<{ slug: string; qty: number }>
): { subtotal: number; discount: number; total: number; lineCount: number } {
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
  const discount =
    subtotal >= CART_DISCOUNT_THRESHOLD
      ? Math.round(subtotal * (CART_DISCOUNT_PCT / 100))
      : 0;
  return { subtotal, discount, total: subtotal - discount, lineCount };
}

// Shipping is computed on the post-discount items subtotal, so a customer
// can't game the free-shipping threshold via a discount.
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
// the order endpoint to compute the amount sent to Razorpay AND used by the
// COD endpoint to set the Shopify order total. The client also derives the
// same number for display; if they disagree, the server wins.
export function computeGrandTotal(items: Array<{ slug: string; qty: number }>) {
  const cart = computeCartTotal(items);
  const shipping = computeShipping({ itemsSubtotal: cart.total });
  return {
    subtotal: cart.subtotal,
    discount: cart.discount,
    itemsTotal: cart.total,
    shipping: shipping.price,
    shippingLabel: shipping.label,
    grandTotal: cart.total + shipping.price,
    lineCount: cart.lineCount,
  };
}
