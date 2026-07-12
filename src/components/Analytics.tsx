// Google Analytics 4 + Meta (Facebook) Pixel.
//
// Set these env vars in `.env.local` and Vercel Project Settings:
//   NEXT_PUBLIC_GA_ID         e.g. "G-XXXXXXXXXX"  (analytics.google.com → Property → Data Streams)
//   NEXT_PUBLIC_META_PIXEL_ID e.g. "1234567890"     (business.facebook.com → Events Manager → Pixel)
//
// If either env var is missing, that vendor's script silently no-ops. Order
// conversion tracking on the Shopify checkout side is handled by Shopify's
// native Customer Events / Web Pixels (configured separately in admin).
//
// What's wired here:
//   1. Consent Mode v2 defaults — analytics granted, ad signals denied. Safe
//      for India + EU visitors out of the box.
//   2. gtag.js loader + init with send_page_view: false (we fire page_view
//      manually from RouteChangeTracker so SPA navigations are counted).
//   3. RouteChangeTracker — a Suspense-wrapped client child that re-fires
//      page_view on every pathname / searchParams change.
//   4. trackEvent helper — used by lib/analytics-events.ts for the typed
//      e-commerce + engagement wrappers.

import Script from "next/script";
import { Suspense } from "react";
import RouteChangeTracker from "./RouteChangeTracker";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function Analytics() {
  return (
    <>
      {GA_ID && (
        <>
          {/* Consent + init must run BEFORE gtag.js loads so the script sees
              the consent defaults already in dataLayer. Both are inline +
              afterInteractive; Next.js preserves the declaration order. */}
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'granted',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500,
              });
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                send_page_view: false,
                currency: 'INR',
                country: 'IN',
                allow_google_signals: false,
              });
            `}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Suspense fallback={null}>
            <RouteChangeTracker gaId={GA_ID} />
          </Suspense>
        </>
      )}

      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Helper: track a custom event in both GA4 and Meta Pixel.
// Usage: trackEvent('add_to_cart', { value: 299, currency: 'INR', items: [...] })
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) window.gtag("event", name, params);
  if (window.fbq) {
    // Meta uses different naming for standard events; this map covers the
    // e-commerce + engagement ones we actually fire.
    const META_EVENT_MAP: Record<string, string> = {
      add_to_cart: "AddToCart",
      view_item: "ViewContent",
      view_item_list: "ViewContent",
      begin_checkout: "InitiateCheckout",
      add_payment_info: "AddPaymentInfo",
      purchase: "Purchase",
      search: "Search",
      sign_up: "CompleteRegistration",
      generate_lead: "Lead",
      contact: "Contact",
    };
    const metaName = META_EVENT_MAP[name] ?? name;
    window.fbq("track", metaName, params);
  }
}
