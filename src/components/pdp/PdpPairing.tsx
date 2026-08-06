"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

// Reuses the exact same recipe slide data (and mortar-clip placeholder) as
// the homepage Recipes section — just laid out differently here: photo
// left, heading/CTA + active slide info stacked on the right.
const { slides } = SITE_CONTENT.recipes;
const { heading, subheading, ctaLabel, ctaHref } = SITE_CONTENT.productPage.pairing;

function ArrowButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 shrink-0 rounded-full border border-dark/25 flex items-center justify-center text-dark hover:bg-dark hover:text-cream hover:border-dark transition-colors duration-300"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

// The heading + subheading + CTA block. Rendered twice (see below) — once
// mobile-only ahead of the video, once desktop-only inside the text column
// — rather than reordered with CSS, so the two very different layouts
// (mobile: stacked hierarchy heading > video > slide-info; desktop:
// video left, heading+slide-info split top/bottom on the right) each stay
// simple and predictable instead of relying on fragile grid re-ordering.
function HeadingBlock() {
  return (
    <>
      <h2 className="text-h2 text-dark mb-3">{heading}</h2>
      <p className="text-body text-dark/70 max-w-md mb-4">{subheading}</p>
      <Link
        href={ctaHref}
        className="text-btn inline-flex items-center gap-1.5 text-red underline decoration-red decoration-2 underline-offset-4 hover:text-red/80 transition-colors"
      >
        {ctaLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

export default function PdpPairing() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section className="relative bg-cream py-20 md:py-28 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-5">
        {/* Mobile-only: heading/CTA leads the section, ahead of the video. */}
        <ScrollReveal className="md:hidden mb-8">
          <HeadingBlock />
        </ScrollReveal>

        <div className="grid md:grid-cols-[7fr_3fr] gap-10 md:gap-12 md:items-stretch">
          {/* Media — a fixed wide (4:3 mobile, 3:2 desktop) aspect ratio,
              same convention as the homepage Recipes section, so the video
              keeps its natural landscape shape instead of being stretched
              to match the text column's height. Vertically centered within
              the column via the flex wrapper. */}
          <ScrollReveal>
            <div className="relative w-full md:h-full md:min-h-[600px] flex md:items-center">
              <div className="relative w-full aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-dark/5">
                <video
                  key={index}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={slide.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  aria-hidden="true"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Text column — heading/CTA pinned to the top (desktop only —
              mobile shows its own copy above the video instead), active
              slide info pinned to the bottom, spanning the media's height. */}
          <div className="flex flex-col gap-8 md:gap-0 md:justify-between md:h-full md:min-h-[600px] md:py-2">
            <ScrollReveal delay={0.05} className="hidden md:block">
              <HeadingBlock />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h3 className="text-h4 text-dark mb-2">{slide.title}</h3>
              <p className="text-body text-dark/70 max-w-sm mb-4">{slide.description}</p>
              <div className="flex items-center gap-2.5">
                <ArrowButton direction="prev" onClick={goPrev} label="Previous recipe" />
                <ArrowButton direction="next" onClick={goNext} label="Next recipe" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
