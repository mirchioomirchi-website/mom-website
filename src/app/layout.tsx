import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import dynamic from "next/dynamic";
import { CartProvider } from "@/lib/cart-context";
import Analytics from "@/components/Analytics";
import {
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SITE_REGISTERED_ADDRESS,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_PHONE,
  SITE_SAME_AS,
  SITE_AREA_SERVED,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
  safeJsonLd,
} from "@/lib/site";

const MiniCart = dynamic(() => import("@/components/MiniCart"));
const WhatsAppFab = dynamic(() => import("@/components/WhatsAppFab"));
const PromoPopup = dynamic(() => import("@/components/PromoPopup"));

// All three brand typefaces load through next/font/local — one consistent
// mechanism (subsetting, preload, font-display, automatic fallback metrics)
// instead of mixing next/font with hand-written @font-face rules. Each
// variable is consumed by the @theme tokens in globals.css.
const afacad = localFont({
  src: [
    {
      path: "../../public/fonts/afacad/Afacad-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/fonts/afacad/Afacad-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-quirk",
  display: "swap",
  preload: true,
});

// Primary body/UI typeface. Weights map 1:1 to the type scale in globals.css
// (Medium 500 = body text, DemiBold 600 = tags/buttons); Bold/ExtraBold are
// kept for the handful of components (nav popups, cart drawer) still using
// heavier inline weights.
const greycliff = localFont({
  src: [
    { path: "../../public/fonts/greycliff/GreycliffCF-Medium.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/greycliff/GreycliffCF-DemiBold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/greycliff/GreycliffCF-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/greycliff/GreycliffCF-ExtraBold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

// Devanagari-supporting accent typeface — used only for the bilingual
// eyebrow labels ("पदार्थ · Ingredients") and similar brand flourishes.
const sura = localFont({
  src: [
    { path: "../../public/fonts/sura/Sura-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/sura/Sura-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-accent",
  display: "swap",
  preload: false,
});

const OG_IMAGE = `${SITE_URL}${DEFAULT_OG_IMAGE}`;

export const viewport: Viewport = {
  themeColor: "#1A0D04",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Bold Flavour. Real Thecha.`,
    template: "%s",
  },
  description:
    "Handcrafted Indian thecha made with real ingredients. Three bold flavours — Green Chilli, Mixed Chilli, Red Chilli. No fillers. No shortcuts. Just mirchi.",
  keywords: [
    "thecha",
    "Indian sauce",
    "green chilli thecha",
    "red chilli thecha",
    "mixed chilli thecha",
    "mirchi",
    "handmade condiment",
    "spicy sauce",
    "Maharashtrian thecha",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_LEGAL_NAME }],
  creator: SITE_LEGAL_NAME,
  publisher: SITE_LEGAL_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { types: { "application/rss+xml": `${SITE_URL}/rss.xml` } },
  openGraph: {
    title: `${SITE_NAME} — Bold Flavour. Real Thecha.`,
    description:
      "Handcrafted Indian thecha. Three bold flavours. No fillers. No shortcuts.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: "Mirchi O Mirchi — Green, Mixed, and Red Chilli Thecha jars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Bold Flavour. Real Thecha.`,
    description: "Handcrafted Indian thecha. Three bold flavours. Just mirchi.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

// @id anchors so the Organization and WebSite entities can be referenced
// (not re-declared) from every other JSON-LD block on the site — Product,
// Article, BreadcrumbList, FAQPage, etc. all point back at these same two
// URIs via `{"@id": ...}` instead of repeating the full Organization object.
// That's what actually makes this a connected knowledge graph rather than a
// pile of disconnected schema blocks, which is what both Google's Knowledge
// Graph and AI answer engines use to disambiguate "which brand is this."
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/images/mom-logo-white.webp`,
    width: 500,
    height: 218,
  },
  image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  description:
    "Handcrafted Indian thecha. Three bold flavours. No fillers. No shortcuts.",
  slogan: "Bold Flavour. Real Thecha.",
  areaServed: {
    "@type": "City",
    name: SITE_AREA_SERVED,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE_REGISTERED_ADDRESS,
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: SITE_SUPPORT_EMAIL,
      telephone: SITE_SUPPORT_PHONE,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi", "Marathi"],
    },
  ],
  sameAs: SITE_SAME_AS,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-IN",
  publisher: { "@id": ORGANIZATION_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${afacad.variable} ${greycliff.variable} ${sura.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
        />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      </head>
      <body className="bg-cream text-dark font-sans antialiased">
        {/* Skip-to-content link — the first focusable element on every page.
            Invisible until a keyboard user Tabs to it, then jumps straight
            to #main-content so they don't have to tab through the entire
            nav on every single page load. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:bg-red focus:text-cream focus:px-4 focus:py-2.5 focus:text-btn focus:font-bold"
        >
          Skip to content
        </a>
        <Analytics />
        <CartProvider>
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <MiniCart />
        </CartProvider>
        <WhatsAppFab />
        <PromoPopup />
        <div className="grain-overlay" />
      </body>
    </html>
  );
}