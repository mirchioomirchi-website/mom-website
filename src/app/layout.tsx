import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import dynamic from "next/dynamic";
import { CartProvider } from "@/lib/cart-context";
import Analytics from "@/components/Analytics";
import { SITE_URL, SITE_NAME, SITE_LEGAL_NAME, DEFAULT_OG_IMAGE, safeJsonLd } from "@/lib/site";

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
    images: [{ url: OG_IMAGE, width: 1200, height: 1200, alt: "Mirchi O Mirchi thecha jars" }],
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/MOM_logo.svg`,
  description:
    "Handcrafted Indian thecha. Three bold flavours. No fillers. No shortcuts.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
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
        <Analytics />
        <CartProvider>
          {children}
          <MiniCart />
        </CartProvider>
        <WhatsAppFab />
        <PromoPopup />
        <div className="grain-overlay" />
      </body>
    </html>
  );
}