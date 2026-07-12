import type { NextConfig } from "next";
import path from "path";

// Security headers applied to every response. Adjusted so that:
//   - Sanity Studio still works at /studio (it iframes Sanity tools)
//   - Razorpay checkout popups and iframes still work
//   - Google Analytics + Meta Pixel still load
// The Content-Security-Policy is deliberately moderate (allows 'unsafe-inline'
// for inline analytics scripts and the Razorpay widget). Tighten via nonces later.
//
// Sources allowed:
//   - self                        → our own routes + Next.js chunks
//   - inline scripts/styles       → JSON-LD + Tailwind + analytics gtag init
//   - checkout.razorpay.com       → Razorpay Checkout JS
//   - api.razorpay.com            → Razorpay API calls from widget
//   - cdn.razorpay.com            → Razorpay risk-detection bundle
//   - lumberjack.razorpay.com     → Razorpay telemetry
//   - googletagmanager + google-analytics + analytics.google.com → GA4
//   - connect.facebook.net        → Meta Pixel
//   - cdn.sanity.io               → Sanity blog images
//   - cdn.shopify.com             → Shopify product images (Storefront)
//   - data: + blob:               → inline SVGs + canvas frames in Hero
const cspDirectives: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://checkout.razorpay.com",
    "https://cdn.razorpay.com",
    "https://*.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://connect.facebook.net",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://cdn.sanity.io",
    "https://cdn.shopify.com",
    "https://*.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.facebook.com",
  ],
  "font-src": [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    "https://lumberjack.razorpay.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://connect.facebook.net",
    "https://*.facebook.com",
    "https://cdn.sanity.io",
    "https://*.sanity.io",
  ],
  "frame-src": [
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
  ],
  "frame-ancestors": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'", "https://checkout.razorpay.com"],
  "object-src": ["'none'"],
  "upgrade-insecure-requests": [],
};

const cspValue = Object.entries(cspDirectives)
  .map(([k, v]) => (v.length > 0 ? `${k} ${v.join(" ")}` : k))
  .join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: cspValue },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/frames/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/fonts/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Studio + API surfaces should never be indexed
      {
        source: "/studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  async redirects() {
    return [
      // Pre-empt common typos / legacy paths
      { source: "/products", destination: "/shop", permanent: true },
    ];
  },
};

export default nextConfig;
