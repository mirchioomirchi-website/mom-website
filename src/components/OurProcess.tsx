"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ScrollReveal, Eyebrow } from "@/components/primitives";
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
//
// The number and title live in their own row (fixed-width number column so
// the description below can indent to line up under the title), separate
// from the collapsible description block — number+title is the only thing
// that needs `items-center` alignment, and keeping the (possibly tall, once
// open) description out of that row means opening it never re-centers the
// number away from the title.
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
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-5 md:gap-6 text-left cursor-pointer md:pointer-events-none md:cursor-auto"
      >
        <span className="font-sura text-pink/50 text-5xl md:text-6xl leading-none shrink-0 w-14 md:w-16">
          {step.number}
        </span>
        <span className="flex-1 min-w-0 flex items-center justify-between gap-3">
          <h3 className="text-h4">{step.title}</h3>
          <span
            className={`md:hidden shrink-0 text-pink transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <ChevronIcon />
          </span>
        </span>
      </button>
      {/* No inline style here on purpose — an inline `gridTemplateRows`
          would out-specificity `md:grid-rows-[1fr]` and force it shut on
          desktop too. Plain conditional classes let the `md:` variant win
          in the cascade at that breakpoint instead. Left-padded to match
          the number column + gap above, so the text lines up under the
          title instead of under the number. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out pl-[4.75rem] md:pl-[5.5rem] md:grid-rows-[1fr] ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-body leading-relaxed text-dark/70 pt-1 md:pt-2">
            {step.description}
          </p>
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
        {/* Eyebrow + heading — one grid area, one ScrollReveal, so the gap
            between them is a plain flex gap we control directly instead of
            being at the mercy of the grid's row-gap. Heading also shares
            its row with the CTA on mobile only (heading left, CTA right,
            bottom-aligned) so the CTA doesn't need its own separate row
            before the steps list. Desktop's CTA is a separate element
            entirely (see below), not part of this block. */}
        <ScrollReveal className="[grid-area:eh] flex flex-col gap-2 md:gap-2.5 mb-1 md:mb-0">
          <Eyebrow devanagari={eyebrowDevanagari} english={eyebrowEnglish} color="pink" />
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-h2 max-w-[13ch] md:max-w-[8ch]">
              {heading}
            </h2>
            <Link
              href={ctaHref}
              className="md:hidden shrink-0 text-btn inline-flex items-center gap-1.5 underline decoration-pink decoration-2 underline-offset-4 hover:text-pink transition-colors whitespace-nowrap"
            >
              {cta}
            </Link>
          </div>
        </ScrollReveal>

        {/* Video — real multi-angle mortar footage, loop/muted, no controls.
            Lazy-loaded: preload="none" + IntersectionObserver above means
            this doesn't fetch until it's about to scroll into view, then
            autoplays from there exactly as before. */}
        <ScrollReveal delay={0.1} className="[grid-area:video] mb-2 md:my-10">
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
        <div className="[grid-area:steps] flex flex-col gap-5 md:gap-10">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={0.1 + i * 0.08}>
              <ProcessStep
                step={step}
                isOpen={openStep === i}
                onToggle={() => setOpenStep((cur) => (cur === i ? null : i))}
              />
              {/* Divider is mobile-accordion-only — desktop already shows
                  every description expanded with generous spacing, the
                  extra dotted rule just added clutter there. */}
              {i < steps.length - 1 && (
                <div className="dotted-divider text-green/40 mt-5 md:hidden" />
              )}
            </ScrollReveal>
          ))}
        </div>

        {/* Desktop-only CTA. Not a named grid-area — placed with explicit
            grid-row/grid-column instead, in the same row 1 / column 1 cell
            as "eh", bottom-aligned there via `self-end` so it lines up
            with the bottom of the (taller) steps list without needing to
            touch or risk breaking eh's own placement. Bigger than the
            mobile version and no underline. */}
        <ScrollReveal
          delay={0.15}
          className="hidden md:block md:[grid-column:1] md:[grid-row:1] md:self-end"
        >
          <Link
            href={ctaHref}
            className="text-btn md:text-lg inline-flex items-center gap-1.5 md:gap-2 hover:text-pink transition-colors"
          >
            {cta}
            <span aria-hidden="true">→</span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
