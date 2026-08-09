// Single source of truth for product data
export type Product = {
  slug: string;
  name: string;
  flavor: "green" | "mixed" | "red" | "combo";
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  weight: string;
  image: string;
  speech: string;
  ingredients: string[];
  isCombo?: boolean;
  // ── PDP-specific fields ──────────────────────────────────────────────
  // Free-text heat label shown on the product page (e.g. "Medium - Hot").
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
  // ── Shopify-sourced fields (populated by getLiveProduct/getLiveProducts in
  // src/lib/products-source.ts; undefined on the static PRODUCTS array below,
  // which only exists as a resilience fallback if Shopify is unreachable) ──
  // Per-product Hindi/Devanagari name, shown in the PDP hero.
  nameHi?: string;
  // Per-product accent hex color from the Shopify "Accent Color" metafield —
  // used for PDP buttons/borders/highlights in place of the fixed
  // PDP_ACCENT_COLOR[flavor] design-token map below.
  pdpAccentColor?: string;
  // Native Shopify product photo (the transparent jar-front cutout) — used
  // in place of PRODUCT_CARD_IMAGES[slug] wherever that compact shot appears.
  mainImage?: string;
  // Live Shopify stock flag (variant.availableForSale). Undefined on the
  // static PRODUCTS fallback below (Shopify unreachable) — every check
  // against this field should treat `undefined` the same as `true` (fail
  // open, matching this file's existing "static catalogue is a resilience
  // fallback" philosophy) and only gate purchasing when it's explicitly
  // `false`.
  available?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    slug: "green-chilli-thecha",
    name: "Green Chilli Thecha",
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
    speech: "Classy. Sassy. Thodi bad-assy.",
    ingredients: [
      "Fresh green chillies",
      "Fresh garlic",
      "Coriander",
      "Cold pressed oil",
      "Lemon juice",
      "Rock salt & cumin",
    ],
    heatLevel: "Mild - Medium",
    storyText:
      "This one keeps it fresh. Spoon it over rice, fold it into curd, or eat it straight off a hot bhakri — Green Chilli Thecha is for whoever asked for 'more garlic, less rules.'",
  },
  {
    slug: "red-chilli-thecha",
    name: "Red Chilli Thecha",
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
    speech: "Too hot to handle, baby.",
    ingredients: [
      "Fresh red chillies",
      "Fresh garlic",
      "Coriander",
      "Cold pressed oil",
      "Lemon juice",
      "Rock salt & cumin",
    ],
    heatLevel: "Medium - Hot",
    storyText:
      "This one doesn't play safe. Stir it into dal-chawal, smear it on a sandwich, or eat it off the spoon — Red Chilli Thecha is for whoever asked for 'more spicy.'",
    closeupImage: "/images/pdp/red-closeup.webp",
    secondaryImage: "/images/pdp/red-secondary.webp",
  },
  {
    slug: "mixed-chilli-thecha",
    name: "Mixed Chilli Thecha",
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
    heatLevel: "Medium - Hot",
    storyText:
      "This one doesn't pick sides. Stir it into misal, load it onto vada pav, or eat it off the spoon — Mixed Chilli Thecha is for whoever asked for 'both, actually.'",
  },
  {
    slug: "combo-pack",
    name: "Combo Pack",
    flavor: "combo",
    tagline: "Three Heats. Save ₹98.",
    description:
      "All three flavours — Green, Mixed, Red — together. Save ₹98 vs buying separately.",
    longDescription:
      "Can't pick a favourite? You don't have to. The Combo Pack gives you all three flavours in one go — fresh green, bold red and fiery mixed — at a price that beats buying separately. Great gift, great trial set, great answer to the question 'which one is the spiciest?'",
    price: 799,
    originalPrice: 899,
    weight: "3 × 250g",
    image: "/images/jar-mixed-final.webp",
    speech: "Why pick? Take all three.",
    ingredients: [
      "1 × Green Chilli Thecha (250g)",
      "1 × Mixed Chilli Thecha (250g)",
      "1 × Red Chilli Thecha (250g)",
    ],
    isCombo: true,
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
  "green-chilli-thecha": "/images/green chilli.webp",
  "red-chilli-thecha": "/images/red chilli.webp",
  "mixed-chilli-thecha": "/images/mixed chilli.webp",
  "combo-pack": "/images/combo products.webp",
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

// Discount, coupon-code, and shipping config + the authoritative price
// computation functions now live in "@/lib/discounts" — a dedicated file so
// pricing rules aren't buried inside the product catalogue. See that file to
// change a promo or add a coupon code.
