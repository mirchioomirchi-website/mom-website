"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Mobile: accordion — only the number + title show at a glance, tap to
// reveal the description. Three full title+description blocks stacked was
// a lot of reading before the shopper even scrolled past this section.
// Desktop keeps the original always-expanded layout (that's `md:` forcing
// the collapsible track back open regardless of `isOpen`, and hiding the
// mobile-only chevron) — plenty of room there, no need to hide anything.
function ProcessStep({
  step,
  isOpen,
  onToggle,
}: {
  step: { number: string; title: string; description: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-5 md:gap-6">
      <span className="font-sura text-pink/50 text-5xl md:text-6xl leading-none shrink-0">
        {step.number}
      </span>
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer md:pointer-events-none md:cursor-auto"
        >
          <h3 className="text-h4 mb-2 md:mb-2">{step.title}</h3>
          <span
            className={`md:hidden shrink-0 text-pink mt-0.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <ChevronIcon />
          </span>
        </button>
        {/* No inline style here on purpose — an inline `gridTemplateRows`
            would out-specificity `md:grid-rows-[1fr]` and force it shut on
            desktop too. Plain conditional classes let the `md:` variant
            win in the cascade at that breakpoint instead. */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr] ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <p className="text-body leading-relaxed text-dark/70">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OurProcess() {
  const { eyebrowDevanagari, eyebrowEnglish, heading, steps, cta, ctaHref } =
    SITE_CONTENT.ourProcess;

  // Mobile accordion — one step open at a time, none open by default so
  // all three titles are visible at a glance. Irrelevant on desktop, where
  // ProcessStep forces every description open regardless of this state.
  const [openStep, setOpenStep] = useState<number | null>(null);

  // mortar.mp4 is a 21MB clip — with plain `autoPlay` the browser starts
  // fetching/buffering it near page load regardless of scroll position,
  // which is real bandwidth wasted on mobile if the visitor never scrolls
  // this far. `preload="none"` below stops that eager fetch; this
  // IntersectionObserver only starts loading + playing once the section
  // actually scrolls into view, still autoplaying at that point exactly
  // like before.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || shouldPlay) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldPlay(true);
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldPlay]);

  useEffect(() => {
    if (shouldPlay) videoRef.current?.play().catch(() => {});
  }, [shouldPlay]);

  return (
    <section className="relative bg-cream py-16 md:py-24 overflow-hidden cv-auto">
      <div className="process-grid w-full max-w-[1400px] mx-auto px-5 md:px-9 gap-x-16 gap-y-6 md:gap-y-8">
        {/* Eyebrow */}
        <ScrollReveal className="[grid-area:eyebrow] flex items-center gap-2.5">
          <span className="font-sura text-pink text-[15px] md:text-base">
            {eyebrowDevanagari}
          </span>
          <span className="text-pink/50 text-sm">•</span>
          <span className="font-sura text-pink text-[15px] md:text-base">
            {eyebrowEnglish}
          </span>
        </ScrollReveal>

        {/* Heading */}
        <ScrollReveal delay={0.05} className="[grid-area:heading] mt-3 md:mt-4 mb-8 md:mb-0">
          <h2 className="text-h2 max-w-[13ch] md:max-w-[8ch]">
            {heading}
          </h2>
        </ScrollReveal>

        {/* Video — real multi-angle mortar footage, loop/muted, no controls.
            Lazy-loaded: preload="none" + IntersectionObserver above means
            this doesn't fetch until it's about to scroll into view, then
            autoplays from there exactly as before. */}
        <ScrollReveal delay={0.1} className="[grid-area:video] my-2 md:my-10">
          <div className="relative w-full aspect-video md:aspect-[5/2] overflow-hidden bg-dark/5">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src="/videos/mortar.mp4"
              preload="none"
              loop
              muted
              playsInline
              controls={false}
              aria-hidden="true"
            />
          </div>
        </ScrollReveal>

        {/* Numbered steps */}
        <div className="[grid-area:steps] flex flex-col gap-8 md:gap-10">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={0.1 + i * 0.08}>
              <ProcessStep
                step={step}
                isOpen={openStep === i}
                onToggle={() => setOpenStep((cur) => (cur === i ? null : i))}
              />
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal
          delay={0.2}
          className="[grid-area:cta] mt-6 md:mt-14 text-center md:text-left"
        >
          <Link
            href={ctaHref}
            className="text-btn inline-flex items-center gap-1.5 underline decoration-pink decoration-2 underline-offset-4 hover:text-pink transition-colors"
          >
            {cta}
            <span aria-hidden="true" className="hidden md:inline">
              →
            </span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
