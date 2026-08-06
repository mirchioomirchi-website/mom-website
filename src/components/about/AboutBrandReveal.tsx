"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { before, after } = SITE_CONTENT.aboutPage.brandReveal;

// "And just like that, [big wordmark] was born." — reuses the exact same
// green wordmark asset as the footer, so there's one source of truth for
// the brand logotype. Two small character-portrait crops bleed in from
// the left/right edges (desktop only), matching the design's flanking
// illustrations.
export default function AboutBrandReveal() {
  return (
    <section className="relative bg-cream py-16 md:py-28 overflow-hidden cv-auto">
      {/* Flanking characters anchored to the section's own edges (the true
          page edges), not the inset 1400px content wrapper — so they sit
          flush at the browser edge, half-cut by the section's own
          overflow-hidden boundary. */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 lg:w-28 opacity-90 pointer-events-none"
      >
        <div className="relative aspect-[153/209]">
          <Image src="/images/about/mirchi-character.svg" alt="" fill className="object-contain" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-20 lg:w-28 opacity-90 pointer-events-none -scale-x-100"
      >
        <div className="relative aspect-[153/209]">
          <Image src="/images/about/mirchi-character.svg" alt="" fill className="object-contain" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-9 relative">
        <ScrollReveal className="relative">
          <p className="text-lg md:text-xl font-medium text-dark/70 mb-2 md:mb-4">{before}</p>
          <Image
            src="/mirchi-wordmark-red.svg"
            alt="Mirchi O Mirchi"
            width={1296}
            height={143}
            className="w-full h-auto"
          />
          <p className="text-lg md:text-xl font-medium text-dark/70 text-right mt-2 md:mt-4">{after}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
