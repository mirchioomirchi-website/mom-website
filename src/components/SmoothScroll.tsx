"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

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
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
