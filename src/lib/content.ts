// Single source of truth for all marketing copy on the site.
//
// Why this file exists:
//   - All hard-coded text used to live scattered across 18 component files.
//   - Edits required hunting through React code.
//   - This file centralizes it. Edit text here, save, the site updates.
//
// Next migration step (already scaffolded in lib/shopify-content.ts):
//   This object will be merged with Shopify Metaobjects on load. Anything you
//   set in Shopify admin overrides the defaults below — so the site becomes
//   editable from Shopify without ever touching code.

export const SITE_CONTENT = {
  // ─── Top-of-page marquee ──────────────────────────────────────────────────
  marquee: {
    items: [
      "Green Chilli Thecha",
      "Small Batches",
      "Red Chilli Thecha",
      "Stone-ground",
      "Mixed Chilli Thecha",
      "Real Ingredients",
      "Handcrafted in Maharashtra",
      "Six Real Ingredients",
    ],
  },

  // ─── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    eyebrow: ["Handcrafted", "Indian", "Thecha"],
    headingTop: "Mirchi",
    headingMid: "O",
    headingBottom: "Mirchi",
    tagline: "Bold Flavour. Real Thecha. Small Batches.",
    ctaPrimary: { label: "Shop Now", href: "#shop" },
    ctaSecondary: { label: "Flavours", href: "#flavours" },
  },

  // ─── Meet MOM (the three character avatars) ───────────────────────────────
  meetMOM: {
    eyebrow: "Meet MOM",
    headingHtml:
      "She's got opinions. She's got <em class='text-mom-pink'>flavour</em>. And she's definitely not asking for <em class='text-mom-orange'>permission</em>.",
    body: "Three women. Three attitudes. Three flavours. Each one represents a side of MOM you know — bold, unapologetic, and impossible to ignore.",
    characters: [
      {
        name: "Green Chilli",
        trait: "Classy. Sassy. Bad-assy.",
        image: "/images/character-3.webp",
        bg: "#CDDC39",
      },
      {
        name: "Mixed Chilli",
        trait: "Traditional. Powerful. Complex.",
        image: "/images/character-2.webp",
        bg: "#FFB300",
      },
      {
        name: "Red Chilli",
        trait: "Fierce. Fiery. Fearless.",
        image: "/images/character-1.webp",
        bg: "#F5197F",
      },
    ],
  },

  // ─── Ingredients (what's inside) ──────────────────────────────────────────
  ingredients: {
    eyebrow: "What's Inside",
    heading: "Six real ingredients.",
    items: [
      {
        n: "01",
        name: "Green & Red Chillies",
        description: "Handpicked and stone-ground for real heat.",
        image: "/images/ing-chillies.webp",
        color: "#E53935",
      },
      {
        n: "02",
        name: "Fresh Garlic",
        description: "Coarsely crushed for a bold, pungent kick.",
        image: "/images/ing-garlic.webp",
        color: "#FFD54F",
      },
      {
        n: "03",
        name: "Coriander",
        description: "Fresh leaves for brightness and depth.",
        image: "/images/ing-coriander.webp",
        color: "#7BB55E",
      },
      {
        n: "04",
        name: "Olive Oil",
        description: "Pure olive oil — no palm oil or processed oils.",
        image: "/images/ing-oil.webp",
        color: "#FF9A1E",
      },
      {
        n: "05",
        name: "Lemon",
        description: "Citrusy, tangy and made to cut through the heat.",
        image: "/images/ing-lemon.webp",
        color: "#FFD54F",
      },
      {
        n: "06",
        name: "Cumin & Salt",
        description: "Earthy, savoury and balanced.",
        image: "/images/ing-cumin-salt.webp",
        color: "#FFF8E1",
      },
    ],
    footerHtml:
      "Others add fillers. <em class='text-white not-italic'>We add flavour.</em>",
  },

  // ─── Quality (Real vs Fake) ───────────────────────────────────────────────
  quality: {
    eyebrow: "The Difference",
    heading: "Real vs. Fake.",
    subheading:
      "What makes our thecha different? Start with what's inside.",
    momLabel: "The Real Stuff",
    momTitle: "MOM",
    othersLabel: "The Other Stuff",
    othersTitle: "Others",
    rows: [
      { feature: "Ingredients", mom: "6 real ingredients", others: "20+ chemicals & fillers" },
      { feature: "Preservatives", mom: "Zero", others: "Sodium benzoate, etc." },
      { feature: "Process", mom: "Stone-ground, small batch", others: "Factory mass-produced" },
      { feature: "Oil", mom: "Olive oil", others: "Refined / palm oil" },
      { feature: "Shelf Life", mom: "Natural (3-6 months)", others: "Artificial (12-24 months)" },
      { feature: "Taste", mom: "Traditional Kolhapuri recipe", others: "Like a lab made it" },
    ],
  },

  // ─── Story (grandmother's recipe) ─────────────────────────────────────────
  story: {
    eyebrow: "The Story",
    heading: "Our grandmother's thecha recipe.",
    stats: [
      { value: "6", label: "Ingredients", color: "text-mom-pink" },
      { value: "0", label: "Preservatives", color: "text-mom-green" },
      { value: "100%", label: "Handmade", color: "text-mom-orange" },
    ],
  },

  // ─── Shop ─────────────────────────────────────────────────────────────────
  shop: {
    eyebrow: "Shop",
    heading: "Grab your jar.",
    trustSignals: ["Secure Checkout", "Handcrafted in Maharashtra"],
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    newsletter: {
      heading: "Stay spicy.",
      body: "First access to new flavours, recipes, and limited drops. No spam — just heat.",
      placeholder: "your@email.com",
      cta: "Subscribe",
    },
    brand: {
      title: "Mirchi O Mirchi",
      tagline: "Handcrafted Indian thecha.\nBold flavour. No fillers.\nMade in India.",
    },
    columns: [
      {
        heading: "Shop",
        links: [
          { name: "Green Chilli Thecha", href: "/products/green-chilli-thecha" },
          { name: "Mixed Chilli Thecha", href: "/products/mixed-chilli-thecha" },
          { name: "Red Chilli Thecha", href: "/products/red-chilli-thecha" },
          { name: "Combo Pack", href: "/products/combo-pack" },
        ],
      },
    ],
    legal: "© Mirchi O Mirchi. All rights reserved.",
  },

  // ─── Navigation ───────────────────────────────────────────────────────────
  nav: {
    items: [
      { label: "Shop", href: "#shop" },
      { label: "Story", href: "#story" },
      { label: "Ingredients", href: "#ingredients" },
    ],
    ctaLabel: "Buy Now",
    ctaHref: "#shop",
  },

  // ─── Character speech bubbles (CharacterPeek / CharacterDivider) ──────────
  characterSpeech: {
    variantsPeek: "Pick wisely... or just get all three.",
    shopPeek: "Grab yours before it's gone!",
    dividerSay: "Come back here!",
  },
} as const;

export type SiteContent = typeof SITE_CONTENT;
