"use client";

import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { label, text } = SITE_CONTENT.aboutPage.quote;

// Same amber dotted-frame treatment as the PDP ingredients banner (global
// dotted border with a gap around an inset box), but with typographic
// quote-mark bookends in the corners instead of the mirchi corner marks.
export default function AboutQuote() {
  return (
    <section className="relative bg-cream py-14 md:py-20 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <ScrollReveal>
          <div className="dotted-frame relative text-red p-3 md:p-4 mx-4 md:mx-0">
            <div
              className="relative rounded-md px-10 md:px-20 py-16 md:py-16 text-center overflow-hidden"
              style={{ background: "#FFB300" }}
            >
              <span
                aria-hidden="true"
                className="absolute top-2 left-4 md:top-4 md:left-8 text-red/60 text-6xl md:text-7xl font-serif leading-none select-none"
              >
                &ldquo;
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-6 right-4 md:bottom-8 md:right-8 text-red/60 text-6xl md:text-7xl font-serif leading-none select-none"
              >
                &rdquo;
              </span>

              <p className="text-tag font-medium text-sm md:text-lg text-red uppercase tracking-[0.08em] mb-4">
                {label}
              </p>
              <p className="text-h2 font-bold text-red max-w-2xl mx-auto">
                &ldquo;{text}&rdquo;
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
