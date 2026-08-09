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
  // Wordmark is now the "/home hero name.svg" (desktop) / "/home hero name -
  // mobile.svg" (mobile) art — eyebrow/wordmarkAlt exist for accessible text,
  // not for on-screen rendering as live type.
  hero: {
    wordmarkAlt: "Mirchi O Mirchi",
    eyebrow: "Hand Crafted Maharashtrian Thecha",
    // Rendered as two explicit lines — do not join into one string.
    taglineLines: ["Fresh thecha. Full flavour dhamaka.", "Just like your grandmother made it."],
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
    eyebrowDevanagari: "पदार्थ",
    eyebrowEnglish: "Ingredients",
    lines: [
      {
        direction: "ltr" as const,
        overlay: "/images/ingredients/ingridients overlay - 1.png",
        overlayMobile: "/images/ingredients/mobile/ingridients overlay - 1.png",
        items: [
          { en: "Red Chillies", dev: "लाल मिर्च" },
          { en: "Green Chillies", dev: "हरी मिर्च" },
        ],
      },
      {
        direction: "rtl" as const,
        overlay: "/images/ingredients/ingridients overlay - 2.png",
        overlayMobile: "/images/ingredients/mobile/ingridients overlay - 2.png",
        items: [
          { en: "Fresh Garlic", dev: "ताजा लहसुन" },
          { en: "Coriander", dev: "धनिया" },
        ],
      },
      {
        direction: "ltr" as const,
        overlay: "/images/ingredients/ingridients overlay - 3.png",
        overlayMobile: "/images/ingredients/mobile/ingridients overlay - 3.png",
        items: [
          { en: "Rock Salt", dev: "नमक" },
          { en: "Lemon Juice", dev: "नींबू का रस" },
        ],
      },
      {
        direction: "rtl" as const,
        overlay: "/images/ingredients/ingridients overlay - 4.png",
        overlayMobile: "/images/ingredients/mobile/ingridients overlay - 4.png",
        items: [
          { en: "Olive Oil", dev: "जैतून का तेल" },
          { en: "Cumin", dev: "जीरा" },
        ],
      },
    ],
  },

  // ─── Recipes (video slideshow) ────────────────────────────────────────────
  recipes: {
    eyebrowDevanagari: "व्यंजन विधि",
    eyebrowEnglish: "Recipes",
    headingLines: ["Khaane mein namak kam", "chalega, Thecha nahi."],
    subheading:
      "Spread it. Mix it. Dip it. Spoon it straight from the jar. Just put it on anything that needs flavour!",
    slides: [
      {
        title: "With Dal-Chawal",
        description:
          "Stir a spoon into dal-chawal and suddenly your comfort meal has heat, garlic and flavour.",
        video: "/videos/thecha-grilled-cheese.mp4",
      },
      {
        title: "With Parathas",
        description: "Tear, dip, repeat. Paratha and thecha is an iconic pairing.",
        video: "/videos/thecha-grilled-cheese.mp4",
      },
      {
        title: "On Toast",
        description: "Spread it on toast, layer it with butter, cheese or eggs.",
        video: "/videos/thecha-grilled-cheese.mp4",
      },
      {
        title: "With Eggs",
        description:
          "Scrambled, fried, omelette — anything goes. The breakfast game changer.",
        video: "/videos/thecha-grilled-cheese.mp4",
      },
      {
        title: "Straight Out the Jar",
        description: "Spoon. Jar. Done. We've all been there. No shame.",
        video: "/videos/thecha-grilled-cheese.mp4",
      },
    ],
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

  // ─── Our Process (what makes us different) ────────────────────────────────
  ourProcess: {
    eyebrowDevanagari: "आमची प्रक्रिया",
    eyebrowEnglish: "Our Process",
    heading: "What makes us different?",
    steps: [
      {
        number: "१",
        title: "Not a paste. Not a chutney.",
        description:
          "Fresh homestyle thecha with that coarse, pounded-style texture — the authentic way just the way it should be",
      },
      {
        number: "२",
        title: "The texture isn't an accident.",
        description:
          "A khandla preserves the heat and texture that a blender destroys. That's why it tastes different. That's why it is different.",
      },
      {
        number: "३",
        title: "Best before 1 month. Not 1 year.",
        description:
          "Real food expires. That's how you know it's real. Ours doesn't last years on a shelf — and we think that's exactly how it should be.",
      },
    ],
    cta: "Know More About Us",
    ctaHref: "/about",
  },

  // ─── Shop (hoverable jar composite) ───────────────────────────────────────
  shop: {
    eyebrowDevanagari: "खरीदें",
    eyebrowEnglish: "Shop",
    // Mobile-only replacement for the eyebrow row — desktop keeps the
    // Devanagari/English eyebrow pairing above, mobile shows this instead.
    mobileHeading: "Pick your mirchi",
    shopAllLabel: "Shop All",
    shopAllHref: "/shop",
    marqueeText: "Pick Your Mirchi",
    // hotspot rects are % of the composite image's own box, derived from the
    // alpha bounding box of each jar's cutout so they line up exactly with
    // where that jar sits in the full photo.
    jars: [
      {
        flavor: "green" as const,
        slug: "green-chilli-thecha",
        title: "Green Chilli Mirchi",
        bgDark: "#114A22",
        hotspot: { left: 40.7, top: 24.5, width: 18.5, height: 34.0 },
        boomSide: "right" as const,
      },
      {
        flavor: "mixed" as const,
        slug: "mixed-chilli-thecha",
        title: "Mixed Chilli Mirchi",
        bgDark: "#B44800",
        hotspot: { left: 34.7, top: 53.3, width: 18.6, height: 35.3 },
        // The mixed jar sits directly beside the red jar in the composite,
        // so the default top-right badge placement lands in the gap between
        // them and reads as floating in the middle. Anchoring it to this
        // jar's own left edge (open space) instead keeps it clearly
        // attached to the mixed jar.
        boomSide: "left" as const,
      },
      {
        flavor: "red" as const,
        slug: "red-chilli-thecha",
        title: "Red Chilli Mirchi",
        bgDark: "#9B1E15",
        hotspot: { left: 50.9, top: 53.0, width: 18.4, height: 35.2 },
        boomSide: "right" as const,
      },
    ],
  },

  // ─── Instagram (parallax photo scatter) ───────────────────────────────────
  instagram: {
    handle: "@mirchiomirchi",
    heading: "For more garmi",
    href: "https://www.instagram.com/mirchiomirchi/",
    images: [
      { src: "/images/social/top-left.webp", alt: "Mirchi O Mirchi on Instagram" },
      { src: "/images/social/top-right.webp", alt: "Mirchi O Mirchi on Instagram" },
      { src: "/images/social/bottom-left.webp", alt: "Mirchi O Mirchi on Instagram" },
      { src: "/images/social/bottom-right.webp", alt: "Mirchi O Mirchi on Instagram" },
    ],
  },

  // ─── CTA banner (WhatsApp community) ──────────────────────────────────────
  ctaBanner: {
    heading: "Claim your 5% off",
    bodyMobile:
      "We announce new batches, limited drops, and recipe ideas on WhatsApp first.",
    // Rendered as two explicit lines on desktop — do not join into one string.
    bodyDesktopLines: ["We announce new batches, limited drops,", "and recipe ideas on WhatsApp first. Join us there."],
    ctaLabel: "Join on WhatsApp",
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    brand: {
      title: "Mirchi O Mirchi",
      tagline: "Handcrafted Maharashtrian thecha.\nBold flavour. No fillers.",
    },
    shopLinks: [
      { name: "Green Chilli Thecha", href: "/products/green-chilli-thecha" },
      { name: "Red Chilli Thecha", href: "/products/red-chilli-thecha" },
      { name: "Mixed Chilli Thecha", href: "/products/mixed-chilli-thecha" },
      { name: "Combo Pack", href: "/products/combo-pack" },
    ],
    exploreLinks: [
      { name: "Recipes", href: "/#recipes" },
      { name: "About Us", href: "/about" },
      { name: "Get in Touch", href: "/contact" },
      { name: "Track Order", href: "/orders/track" },
      { name: "FAQs", href: "/faq" },
    ],
    legalLinks: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund" },
      { name: "Shipping Policy", href: "/shipping" },
    ],
    copyright: "© 2026 Mirchi O Mirchi. All Rights Reserved. Vivenza Marketing LLP.",
  },

  // ─── Product Detail Page (shared UI copy — per-product facts live on the
  // Product object itself in products.ts) ────────────────────────────────
  productPage: {
    // Generic bilingual label shown above the jar in the hero — same string
    // for every flavor, matching the convention already used in ProductShowcase.
    devanagariLabel: "मिर्ची चा ठेचा",
    pairing: {
      heading: "Best to Pair With",
      subheading:
        "Spread it. Mix it. Dip it. Spoon it straight from the jar. Just put it on anything that needs flavour!",
      ctaLabel: "See All Recipes",
      ctaHref: "/#recipes",
    },
    crossSell: {
      heading: "You should also try",
    },
  },

  // ─── About Us page ────────────────────────────────────────────────────────
  aboutPage: {
    hero: {
      headingLines: ["Started the way", "all the best things do."],
      subheading: "Over a home-cooked meal and a serious craving for more punch.",
      eyebrowDevanagari: "आमची कहाणी",
      eyebrowEnglish: "our story",
    },
    story: {
      heading: "Tamanna grew up eating fresh authentic thecha",
      paragraphs: [
        "...made at her Masa and Masi's home, the kind that didn't just sit on the side of the plate, it stole the show.",
        "One spoonful and suddenly everything tasted louder, teekha, better.",
      ],
    },
    quote: {
      label: "the question that started everything",
      text: "Why is it so hard to find fresh thecha that tastes like home?",
    },
    brandReveal: {
      before: "And just like that,",
      after: "was born.",
    },
    mission: {
      heading: "We're here to bring fresh, handcrafted Maharashtrian thecha to every table",
      body: "Bold, fiery, and made to wake up anything that needs a little extra masti, a little extra kick, and a whole lot of flavour.",
      ctaLabel: "Shop all flavours",
      ctaHref: "/shop",
    },
  },

  // ─── Shop page (/shop) ────────────────────────────────────────────────────
  shopPage: {
    hero: {
      heading: "The full lineup.",
      subheading:
        "Three flavours. Six real ingredients each. Zero fillers. Pick one, or get all three.",
    },
    allProductsLabel: "All Products",
    // Static, decorative — no delivery/PIN backend exists yet, matches the
    // design reference without wiring up functionality that isn't real.
    availabilityLabel: "Availability",
    deliverToLabel: "Deliver to:",
    deliverToCta: "Enter PIN code",
    decisionBanner: {
      eyebrowDevanagari: "मार्गदर्शिका",
      eyebrowEnglish: "Can't pick?",
      columns: [
        {
          question: "You want fresh & garlicky?",
          detail: "Light heat, bold garlic punch",
          ctaLabel: "Get Green Chilli Thecha",
          slug: "green-chilli-thecha",
        },
        {
          question: "You want maximum heat?",
          detail: "Bold, fiery, builds slowly",
          ctaLabel: "Get Red Chilli Thecha",
          slug: "red-chilli-thecha",
        },
        {
          question: "You want the best of both?",
          detail: "Balanced heat, complex flavour",
          ctaLabel: "Get Mixed Chilli Thecha",
          slug: "mixed-chilli-thecha",
        },
      ],
    },
    combo: {
      eyebrow: "Best Value",
      eyebrowSecondary: "Combo Pack",
      heading: "Still can't choose? Get all three.",
      body: "One jar of each — Green, Red, and Mixed. Try them all, find your forever favourite. Or keep all three on the counter.",
      ctaLabel: "Add Combo To Cart",
    },
    trustBadges: [
      { icon: "jar" as const, label: "250g per jar" },
      { icon: "chili" as const, label: "6 real ingredients" },
      { icon: "shipping" as const, label: "Free shipping ₹499+" },
      { icon: "badge" as const, label: "FSSAI certified" },
    ],
  },

  // ─── Contact page (/contact) ──────────────────────────────────────────────
  contactPage: {
    hero: {
      eyebrowDevanagari: "संपर्क करें",
      eyebrowEnglish: "contact us",
      heading: "Send us a message",
      subheading:
        "Question about an order? Wholesale enquiry? Press? We respond to every email within one working day.",
    },
    form: {
      namePlaceholder: "your name",
      emailPlaceholder: "your email",
      queryTypePlaceholder: "query type",
      queryOptions: ["Order help", "Wholesale / B2B", "Press / collab", "Something else"],
      subjectPlaceholder: "subject (optional)",
      messagePlaceholder: "message",
      submitLabel: "Send Message",
    },
    infoPanel: {
      emailLabel: "Email us",
      emailNote: "For order help, wholesale enquiries, partnerships, and anything else.",
      whatsappLabel: "Chat on Whatsapp",
      whatsappMessage: "Hi Mirchi O Mirchi — I had a question",
    },
    details: {
      eyebrow: "Get in touch",
      grievanceHeading: "Grievance officer",
      grievanceIntro:
        "Under the Consumer Protection (E-Commerce) Rules 2020, you can reach our grievance officer for unresolved complaints at",
      grievanceNote: "We acknowledge every complaint within 48 hours and resolve within 30 days.",
    },
  },

  // ─── Track order page (/orders/track) ─────────────────────────────────────
  trackPage: {
    hero: {
      eyebrowDevanagari: "ऑर्डर की स्थिति",
      eyebrowEnglish: "Order tracking",
      heading: "Where's my mirchi?",
      subheading:
        "Type your order number (from the confirmation email, like #1024) and the email you used to check out.",
    },
    lostOrder: {
      heading: "Lost your order number?",
      note: "with the date and shipping address — we'll find it.",
    },
    form: {
      orderNumberLabel: "Order number",
      orderNumberPlaceholder: "#1024",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      submitLabel: "Track order",
    },
  },

  // ─── FAQ page (/faq) ───────────────────────────────────────────────────────
  faqPage: {
    hero: {
      eyebrowDevanagari: "सवाल जवाब",
      eyebrowEnglish: "FAQs",
      heading: "Got questions?",
      subheading:
        "Everything about our thecha, delivery, and orders — answered below.",
    },
    categories: [
      {
        name: "About the thecha",
        items: [
          {
            q: "Is your thecha fresh?",
            a: "Always. Our thecha is made in small batches with fresh ingredients, so every jar brings the full hit — flavour, texture, and just the right amount of heat.",
          },
          {
            q: "Does the thecha need to be refrigerated?",
            a: "Yes, please refrigerate the thecha once opened.",
          },
          {
            q: "What is the shelf life?",
            a: "Our thecha is best consumed within 1 month. It is made fresh, so we recommend enjoying it while the flavour is at its boldest.",
          },
          {
            q: "Is it very spicy?",
            a: "It has a kick, but it is not just about heat. It is flavourful, punchy, and full of character.",
          },
          {
            q: "How can I eat it?",
            a: "With literally everything. Paratha, dal-chawal, curd rice, sandwiches, wraps, toast, khichdi, eggs, thepla — basically anywhere your food needs a little drama.",
          },
        ],
      },
      {
        name: "Orders & delivery",
        items: [
          {
            q: "Do you take bulk orders?",
            a: "Yes, we do. For bulk orders, gifting, events, or larger requirements, please reach out to us at contact@mirchiomirchi.com and we'll get back to you.",
          },
          {
            q: "Where do you deliver?",
            a: "We currently deliver across Mumbai. Delivery timelines may vary slightly depending on your location.",
          },
          {
            q: "How long does delivery take?",
            a: "Orders usually take 1–2 days to be delivered.",
          },
        ],
      },
      {
        name: "Returns",
        items: [
          {
            q: "Can I return or exchange a jar?",
            a: "We do not accept returns once delivered. However, if there is an issue with your order, please contact us within 48 hours and we'll do our best to help.",
          },
        ],
      },
    ],
    stillQuestions: {
      heading: "Have more questions?",
      note: "We're usually quick to reply — email or WhatsApp us and we'll sort it out.",
    },
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
