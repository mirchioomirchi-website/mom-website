"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// Exposed globally so nav links (see Navigation.tsx) can drive an in-place
// smooth scroll through the same engine that owns the page's scroll
// position. Lenis intercepts wheel input and re-asserts its own idea of
// scrollY every animation frame — a plain anchor click (or
// `scrollIntoView`) moves the browser's scroll position, but on the very
// next frame Lenis snaps it right back to wherever its internal state
// still thinks it is. Anything that wants to move the page has to go
// through `lenis.scrollTo(...)` so that internal state stays in sync.
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Matches the fixed navbar's height (see Navigation.tsx) plus a little
// breathing room, so an anchor target's heading doesn't land tucked right
// under the nav.
export const NAV_SCROLL_OFFSET = 84;

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip Lenis when reduced motion is requested
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Skip Lenis on coarse-pointer devices (mobile/tablet) — native momentum scrolling
    // is GPU-driven and feels better than any JS-driven smoothing on iOS/Android
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (isTouch) return;

    const lenis = new Lenis({
      // Lower lerp = longer smoothing tail (more "buttery"). 0.085 hits the sweet spot:
      // tight enough to feel responsive, smooth enough to glide.
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
      syncTouch: false,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = undefined;
    };
  }, []);

  // On every route change, land on the URL's hash target if it has one
  // (e.g. arriving at "/#recipes" from another page via the nav) instead of
  // always resetting to the top — otherwise this effect would wipe out the
  // browser's hash scroll on every navigation, hash or not.
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const target = hash ? document.getElementById(hash.slice(1)) : null;

    if (target) {
      // Defer a tick so layout (images, fonts) has settled before measuring.
      requestAnimationFrame(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(top, { immediate: true });
        } else {
          window.scrollTo(0, top);
        }
      });
    } else if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
