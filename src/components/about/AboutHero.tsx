"use client";

import Image from "next/image";
import { ScrollReveal, Eyebrow } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { headingLines, subheading, eyebrowDevanagari, eyebrowEnglish } =
  SITE_CONTENT.aboutPage.hero;

// Desktop: 80% of the viewport tall, character pinned absolutely to the
// section's own bottom edge so it sits flush against the red story section
// that follows with zero gap. That vh-based approach doesn't translate to
// mobile — phone viewport heights vary a lot more than laptop ones (a short
// iPhone SE vs. a tall Pro Max can differ by several hundred px), so a
// vh-driven height plus an absolutely-positioned illustration produced a
// different amount of empty space on every device. Mobile instead just
// flows normally: no forced section height, and the illustration sits in
// document flow with a fixed margin-top below the text (see the shared div
// below — `relative` + normal flow on mobile, `md:absolute` + pinned on
// desktop) — so it looks identical on every phone regardless of its actual
// viewport height, and the section is simply as tall as its own content.
export default function AboutHero() {
  return (
    <section className="relative bg-cream md:min-h-[80vh] overflow-hidden pt-[110px] md:pt-[200px] cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-10">
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
            <Eyebrow
              devanagari={eyebrowDevanagari}
              english={eyebrowEnglish}
              color="red"
              className="whitespace-nowrap"
            />
          </ScrollReveal>
        </div>
      </div>

      {/* Mobile: normal flow, right-aligned via ml-auto, fixed mt-10 gap
          below the text — same on every device. Desktop: switches to
          absolute, pinned flush to the section's bottom-right edge. */}
      <div className="relative md:absolute md:right-[10rem] md:bottom-0 w-60 md:w-[21rem] aspect-[319/364] ml-auto mr-4 md:mr-0 mt-10 md:mt-0">
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
