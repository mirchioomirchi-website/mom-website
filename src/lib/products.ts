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
    weight: "250g",
    image: "/images/jar-green-final.webp",
    color: "#7BB55E",
    accentRgb: "123, 181, 94",
    speech: "Classy. Sassy. Thodi bad-assy.",
    ingredients: [
      "Fresh green chillies",
      "Fresh garlic",
      "Fresh coriander",
      "Olive oil",
      "Lemon",
      "Cumin",
      "Salt",
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
    weight: "250g",
    image: "/images/jar-red-final.webp",
    color: "#E53935",
    accentRgb: "229, 57, 53",
    speech: "Too hot to handle, baby.",
    ingredients: [
      "Fresh red chillies",
      "Fresh garlic",
      "Fresh coriander",
      "Olive oil",
      "Lemon",
      "Cumin",
      "Salt",
    ],
    pairings: [
      "Dosa",
      "Roti",
      "Pulao",
      "Avocado Toast",
      "Anything boring",
    ],
    spiceLevel: 5,
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
    weight: "250g",
    image: "/images/jar-mixed-final.webp",
    color: "#FF9A1E",
    accentRgb: "255, 154, 30",
    speech: "Mirchi lagi toh? IDGAFlying Chappal!",
    ingredients: [
      "Fresh green chillies",
      "Fresh red chillies",
      "Fresh garlic",
      "Fresh coriander",
      "Olive oil",
      "Lemon",
      "Cumin",
      "Salt",
    ],
    pairings: [
      "Vada Pav",
      "Misal",
      "Steamed rice with dal",
      "Eggs",
      "Maggi",
    ],
    spiceLevel: 4,
  },
  {
    slug: "combo-pack",
    name: "Combo Pack",
    shortName: "Combo Pack",
    flavor: "combo",
    tagline: "Three Heats. Save ₹98.",
    description:
      "All three flavours — Green, Mixed, Red — together. Save ₹98 vs buying separately.",
    longDescription:
      "Can't pick a favourite? You don't have to. The Combo Pack gives you all three flavours in one go — fresh green, bold red and fiery mixed — at a price that beats buying separately. Great gift, great trial set, great answer to the question 'which one is the spiciest?'",
    price: 799,
    originalPrice: 897,
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
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.slug !== slug && !p.isCombo);
}

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
