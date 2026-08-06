"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { eyebrowDevanagari, eyebrowEnglish, columns } = SITE_CONTENT.shopPage.decisionBanner;

export default function ShopDecisionBanner() {
  return (
    <section className="relative bg-cream pb-14 md:pb-20 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <ScrollReveal>
          <p className="font-sura text-red text-base md:text-lg flex items-center justify-center gap-2 mb-6 md:mb-8">
            <span>{eyebrowDevanagari}</span>
            <span aria-hidden="true" className="text-red/50">
              ·
            </span>
            <span>{eyebrowEnglish}</span>
          </p>
        </ScrollReveal>

        {/* Flex row instead of grid — the dotted column rules are real
            sibling elements that stretch (align-items: stretch, the flex
            default) to match the row's height automatically, rather than
            absolutely-positioned dividers anchored to top/bottom offsets. */}
        <ScrollReveal delay={0.05}>
          <div className="bg-pink flex flex-col md:flex-row">
            {columns.map((col, i) => (
              <Fragment key={col.slug}>
                {i > 0 && (
                  <>
                    {/* Mobile — horizontal dotted rule between stacked
                        columns, same dot pattern as desktop. */}
                    <div
                      aria-hidden="true"
                      className="block md:hidden mx-6"
                      style={{
                        height: "3px",
                        flexShrink: 0,
                        backgroundImage:
                          "radial-gradient(circle, #FFF3D7 1.5px, transparent 1.5px)",
                        backgroundSize: "13px 3px",
                        backgroundRepeat: "repeat-x",
                        backgroundPosition: "0 50%",
                      }}
                    />
                    {/* Desktop — vertical dotted rule between columns. */}
                    <div
                      aria-hidden="true"
                      className="hidden md:block my-8"
                      style={{
                        alignSelf: "stretch",
                        width: "3px",
                        flexShrink: 0,
                        backgroundImage:
                          "radial-gradient(circle, #FFF3D7 1.5px, transparent 1.5px)",
                        backgroundSize: "3px 13px",
                        backgroundRepeat: "repeat-y",
                        backgroundPosition: "50% 0",
                      }}
                    />
                  </>
                )}
                <div className="flex-1 flex flex-col items-center text-center gap-3 px-6 md:px-8 py-10 md:py-14">
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
