"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const LINES = SITE_CONTENT.ingredients.lines;

// How many times the two-item chip pattern repeats inside a single half of
// the track. The track is rendered twice back-to-back (see JSX below) and
// looped via `translateX(0) -> translateX(-50%)`, so as long as one repeated
// half is wider than the viewport the marquee reads as perfectly seamless.
const REPEAT = 6;

function buildChipText(items: readonly { en: string; dev: string }[]) {
  const unit = items.map((it) => `${it.en}   ${it.dev}`).join("    ·    ") + "    ·    ";
  return unit.repeat(REPEAT);
}

const BASE_RATE = 1;
const SCROLL_RATE = 1.4;
const EASE = 0.06;

// How long each line's ingredient overlay auto-pulses into view as it
// scrolls near the center of the viewport — short and one at a time, so it
// reads as a gentle nudge rather than a slideshow. Mobile has no hover at
// all, so this is the only way touch users ever see the overlays; desktop
// gets it too so a fast scroll-past doesn't skip them entirely.
const SCROLL_REVEAL_MS = 900;

export default function Ingredients() {
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rateRef = useRef<number[]>(LINES.map(() => BASE_RATE));
  const targetRateRef = useRef<number[]>(LINES.map(() => BASE_RATE));
  const [hovered, setHovered] = useState<number | null>(null);
  const [scrollActive, setScrollActive] = useState<number | null>(null);

  // Hover always wins over the auto scroll-pulse — pointer users get the
  // interaction they expect, and hovering a different line doesn't fight
  // with whatever the scroll pulse was mid-animation on.
  const active = hovered ?? scrollActive;

  // Scroll-triggered reveal — fires every time a line crosses the vertical
  // center band of the viewport (works scrolling either direction), holds
  // briefly, then clears itself.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const observers = lineRowRefs.current.map((el, i) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setScrollActive(i);
          const t = setTimeout(() => {
            setScrollActive((cur) => (cur === i ? null : cur));
          }, SCROLL_REVEAL_MS);
          timers.push(t);
        },
        { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
      );
      observer.observe(el);
      return observer;
    });
    return () => {
      observers.forEach((o) => o?.disconnect());
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const anims = trackRefs.current.map((el) => el?.getAnimations()[0] ?? null);

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      targetRateRef.current = targetRateRef.current.map(() => SCROLL_RATE);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetRateRef.current = targetRateRef.current.map(() => BASE_RATE);
      }, 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    const tick = () => {
      anims.forEach((anim, i) => {
        if (!anim) return;
        const current = rateRef.current[i];
        const target = targetRateRef.current[i];
        const next = current + (target - current) * EASE;
        rateRef.current[i] = next;
        try {
          anim.playbackRate = next;
        } catch {
          // ignore — animation may not support playbackRate in some browsers
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="ingredients"
      className="relative h-auto md:h-[90vh] flex flex-col justify-center pt-8 md:pt-16 pb-16 md:pb-[220px] bg-cream overflow-hidden cv-auto scroll-mt-[84px]"
    >
      {/* Hover overlays — full-bleed decorative ingredient scatter, one per
          line, same desktop art on every screen size now (the separate
          mobile crop read too different from the desktop version). The
          wrapping div spans the section's own top/bottom edges (`top-0
          bottom-0`) and the image is `fill` + `object-cover` inside it, so
          it's always exactly 100% of the section's height regardless of
          viewport. Shown on hover (desktop) or the short scroll-triggered
          pulse (all sizes). */}
      {LINES.map((line, i) => (
        <div
          key={line.overlay}
          className="absolute top-0 bottom-0 w-screen left-1/2 -translate-x-1/2 transition-opacity duration-500 ease-out pointer-events-none"
          style={{ opacity: active === i ? 1 : 0 }}
          aria-hidden="true"
        >
          <div className="relative w-full h-full">
            <Image
              src={line.overlay}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      ))}

      {/* Eyebrow */}
      <div className="relative w-full max-w-[1400px] mx-auto px-5 md:px-9 mb-14 md:mb-16 text-center">
        <ScrollReveal className="inline-flex items-center gap-2.5">
          <span className="font-sura text-pink text-[15px] md:text-base">
            {SITE_CONTENT.ingredients.eyebrowDevanagari}
          </span>
          <span className="text-pink/50 text-sm">•</span>
          <span className="font-sura text-pink text-[15px] md:text-base">
            {SITE_CONTENT.ingredients.eyebrowEnglish}
          </span>
        </ScrollReveal>
      </div>

      {/* Marquee lines — full-bleed, alternating direction, hover reveals overlay */}
      <div className="relative flex flex-col gap-8 md:gap-12">
        {LINES.map((line, i) => (
          <div
            key={line.overlay + i}
            ref={(el) => {
              lineRowRefs.current[i] = el;
            }}
            className="relative w-screen left-1/2 -translate-x-1/2 overflow-x-hidden overflow-y-visible"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
          >
            <div
              ref={(el) => {
                trackRefs.current[i] = el;
              }}
              className={`flex whitespace-nowrap font-sura leading-[1.5] py-1.5 md:py-2 text-[28px] md:text-[32px] lg:text-[36px] text-dark/70 select-none transition-opacity duration-300 ease-out ${
                line.direction === "ltr" ? "animate-marquee-ltr" : "animate-marquee-rtl"
              } ${active !== null && active !== i ? "opacity-20" : "opacity-100"}`}
            >
              <span>{buildChipText(line.items)}</span>
              <span aria-hidden="true">{buildChipText(line.items)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
