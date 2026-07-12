"use client";

// Fires GA4 page_view on every SPA route change.
//
// Why this is needed: in `Analytics.tsx` we initialise gtag with
// `send_page_view: false`, so the gtag.js script does NOT auto-fire the
// initial page_view. The initial fire + every subsequent client-side
// navigation goes through this component.
//
// Suspense wrapper is required because `useSearchParams()` opts the entire
// subtree into client-rendering and would otherwise bubble. The parent
// (`Analytics.tsx`) wraps this in <Suspense fallback={null}>.

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RouteChangeTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || !window.gtag || !pathname) return;
    const queryString = searchParams?.toString();
    const path = queryString ? `${pathname}?${queryString}` : pathname;
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaId,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}
