"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ScrollReveal, Eyebrow } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { THEME_COLORS } from "@/lib/theme-colors";

const { eyebrowDevanagari, eyebrowEnglish, columns } = SITE_CONTENT.shopPage.decisionBanner;

export default function ShopDecisionBanner() {
  return (
    <section className="relative bg-cream pb-14 md:pb-20 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <ScrollReveal className="text-center">
          <Eyebrow
            devanagari={eyebrowDevanagari}
            english={eyebrowEnglish}
            color="red"
            className="mb-6 md:mb-8"
          />
        </ScrollReveal>

        {/* Mobile — swipeable cards: each column is its own full card, ~85%
            of the viewport wide so the next card peeks in at the edge as an
            affordance to keep scrolling (same convention as the PDP
            cross-sell carousel). Desktop — unchanged flex row with real
            dotted-divider siblings between columns. */}
        <ScrollReveal delay={0.05}>
          <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {columns.map((col) => (
              <div
                key={col.slug}
                className="snap-center shrink-0 w-[85%] bg-pink flex flex-col items-center text-center gap-3 px-6 py-10"
              >
                <h3 className="text-h4 font-bold text-cream">{col.question}</h3>
                <p className="text-body text-cream/75">{col.detail}</p>
                <Link
                  href={`/products/${col.slug}`}
                  className="text-btn font-bold text-cream underline decoration-cream decoration-2 underline-offset-4 hover:text-cream/80 transition-colors mt-4"
                >
                  {col.ctaLabel}
                </Link>
              </div>
            ))}
          </div>

          <div className="hidden md:flex bg-pink">
            {columns.map((col, i) => (
              <Fragment key={col.slug}>
                {i > 0 && (
                  <div
                    aria-hidden="true"
                    className="my-8"
                    style={{
                      alignSelf: "stretch",
                      width: "3px",
                      flexShrink: 0,
                      backgroundImage: `radial-gradient(circle, ${THEME_COLORS.cream} 1.5px, transparent 1.5px)`,
                      backgroundSize: "3px 13px",
                      backgroundRepeat: "repeat-y",
                      backgroundPosition: "50% 0",
                    }}
                  />
                )}
                <div className="flex-1 flex flex-col items-center text-center gap-3 px-8 py-14">
                  <h3 className="text-h4 font-bold text-cream">{col.question}</h3>
                  <p className="text-body text-cream/75">{col.detail}</p>
                  <Link
                    href={`/products/${col.slug}`}
                    className="text-btn font-bold text-cream underline decoration-cream decoration-2 underline-offset-4 hover:text-cream/80 transition-colors mt-4"
                  >
                    {col.ctaLabel}
                  </Link>
                </div>
              </Fragment>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
