import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { CartProvider } from "@/lib/cart-context";
import Analytics from "@/components/Analytics";

// MiniCart only renders after a user adds an item — code-split it into its
// own chunk so motion + Image overhead don't sit in the initial bundle.
const MiniCart = dynamic(() => import("@/components/MiniCart"));
const WhatsAppFab = dynamic(() => import("@/components/WhatsAppFab"));
import { SITE_URL, SITE_NAME, SITE_LEGAL_NAME, DEFAULT_OG_IMAGE, safeJsonLd } from "@/lib/site";

const quirk = localFont({
  src: "../../public/fonts/Quirk-Regular.woff2",
  variable: "--font-quirk",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const OG_IMAGE = `${SITE_URL}${DEFAULT_OG_IMAGE}`;

export const viewport: Viewport = {
  themeColor: "#000000",
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
  // NOTE: do NOT set a global `canonical` here. Next.js inherits this on
  // every sub-page that doesn't override it, which would point /about, /shop,
  // /blog/* etc. all back to "/" and tank SEO. Each page sets its own
  // canonical via its own `metadata` export.
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
  logo: `${SITE_URL}/images/mom-logo-white.webp`,
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
    <html lang="en" className={`${quirk.variable} ${inter.variable}`}>
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
        {/* NOTE: hero first-frame preload moved out of layout into app/page.tsx
            (home only). Preloading 14KB of webp on /shop, /about, /blog etc.
            wasted bandwidth and hurt LCP on those routes. */}
      </head>
      <body className="bg-mom-black text-white font-sans antialiased">
        <Analytics />
        <CartProvider>
          {children}
          <MiniCart />
        </CartProvider>
        <WhatsAppFab />
        <div className="grain-overlay" />
      </body>
    </html>
  );
}
