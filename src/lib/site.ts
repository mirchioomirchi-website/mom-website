// One place that knows what the live URL is. Everything that needs an
// absolute URL (metadata, sitemap, RSS, OG tags, JSON-LD) reads from here.
//
// Order of precedence:
//   1. NEXT_PUBLIC_SITE_URL  (set in Vercel once the domain is live)
//   2. VERCEL_PROJECT_PRODUCTION_URL (Vercel's auto-generated prod hostname)
//   3. The hardcoded fallback below
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;
  return "https://mirchiomirchi.com";
})();

export const SITE_NAME = "Mirchi O Mirchi";
export const SITE_LEGAL_NAME = "Vivenza Marketing LLP";
export const SITE_REGISTERED_ADDRESS =
  "3rd Floor, Office No. 8, Dealing Chambers, J.M. Road, Near Sai Service Petrol Pump, Pune, Maharashtra, India";
export const SITE_SUPPORT_EMAIL = "contact@mirchiomirchi.com";
export const SITE_SUPPORT_PHONE = "+91 88508 16448";
// E.164 format (no spaces, no plus) — used by wa.me deep-links + Click-to-call.
// Same number as SITE_SUPPORT_PHONE — keep both in sync.
export const SITE_WHATSAPP_NUMBER = "918850816448";
export const SITE_SUPPORT_HOURS = "Mon–Sat · 10:00 AM – 7:00 PM IST";
export const SITE_DESCRIPTION =
  "Handcrafted Indian thecha. Three bold flavours. No fillers. No shortcuts.";
export const SITE_LOCALE = "en_IN";

// Landscape (1200×630, the universal safe ratio for Twitter/X, LinkedIn,
// Slack, WhatsApp, and Facebook link unfurls) hero shot of all three jars —
// used as the fallback OG/Twitter image on every page that doesn't set a
// more specific one (PDPs use their own product photo instead). Generated
// from the real shop-page hero background photography, not a stock/AI image.
export const DEFAULT_OG_IMAGE = "/images/og-default.webp";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Real, currently-live brand social profiles only — never add a placeholder
// or aspirational link here. Read by the root Organization JSON-LD's
// `sameAs` (the standard way to tell Google/AI knowledge graphs "this
// Instagram account and this website are the same entity").
export const SITE_SAME_AS: string[] = ["https://www.instagram.com/mirchiomirchi.in"];

// Where the brand actually ships, in plain language — used in the
// Organization JSON-LD `areaServed` and in llms.txt. Keep in sync with
// isMumbaiPincode() in shiprocket.ts if the delivery area ever expands.
export const SITE_AREA_SERVED = "Mumbai, Maharashtra, India";

// Safely serialise a JSON-LD object for embedding inside a <script> tag via
// dangerouslySetInnerHTML. JSON.stringify by itself does NOT escape
// "</script>" inside string values — if any product description, blog
// field, or future CMS-driven content ever contains it, the page breaks out
// of the script tag (best case → SEO breaks, worst case → XSS).
//
// Also escapes U+2028 / U+2029 line separators which JS treats as line
// terminators inside string literals. Standard hardening pattern.
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
