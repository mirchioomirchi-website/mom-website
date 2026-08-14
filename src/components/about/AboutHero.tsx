"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { headingLines, subheading, eyebrowDevanagari, eyebrowEnglish } =
  SITE_CONTENT.aboutPage.hero;

// 80% of the viewport tall on desktop. The heading/subheading/eyebrow sit
// near the top (normal flow); the character is pinned absolutely to the
// section's own bottom edge so it sits flush against the red story section
// that follows with zero gap between them.
// Mobile gets a shorter floor (not 92vh) and less top padding — the text
// block is short, so a tall section just left a big dead-cream gap above
// the character before the red section started. The character is also
// sized up on mobile so it reads as a real illustration filling that space
// rather than a small icon floating in the middle of it.
export default function AboutHero() {
  return (
    <section className="relative bg-cream min-h-[62vh] md:min-h-[80vh] overflow-hidden pt-[110px] md:pt-[200px] cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <ScrollReveal className="max-w-xl">
            <h1 className="text-h1 text-[2.75rem] md:text-[4rem] text-red mb-6 md:mb-8">
              {headingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-body text-lg md:text-xl font-medium text-dark/70 max-w-md">
              {subheading}
            </p>
          </ScrollReveal>

          {/* order-first on mobile so the eyebrow renders above the
              heading; back to its normal trailing (right-hand) position
              on desktop via md:order-none. */}
          <ScrollReveal delay={0.1} className="order-first md:order-none shrink-0">
            <p className="font-sura text-red text-base md:text-lg flex items-center gap-2 whitespace-nowrap md:justify-end">
              <span>{eyebrowDevanagari}</span>
              <span aria-hidden="true" className="text-red/50">
                ·
              </span>
              <span>{eyebrowEnglish}</span>
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Pinned flush to the section's bottom edge — no gap before the
          red section that follows. */}
      <div className="absolute right-4 md:right-[10rem] bottom-0 w-60 md:w-[21rem] aspect-[319/364]">
        <Image
          src="/images/about/hero-character.svg"
          alt="Mirchi O Mirchi character illustration"
          fill
          priority
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}
