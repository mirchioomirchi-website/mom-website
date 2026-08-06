"use client";

import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { SITE_WHATSAPP_NUMBER } from "@/lib/site";

const { heading, bodyMobile, bodyDesktopLines, ctaLabel } = SITE_CONTENT.ctaBanner;

const WHATSAPP_HREF = `https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Mirchi O Mirchi — I'd like to join your WhatsApp community for updates and offers \u{1F336}️"
)}`;

export default function CtaBanner() {
  return (
    <section className="relative bg-cream py-10 md:py-14 cv-auto">
      <div className="w-full max-w-[1400px] mx-auto px-5 md:px-9">
        {/* Same dotted-divider pattern as the navbar's bottom border. */}
        <div className="dotted-divider" />

        <div className="my-3 md:my-4">
          <ScrollReveal>
            <div className="bg-cream-dark px-6 md:px-14 py-10 md:py-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
                <h2 className="text-h2 text-green text-center md:text-left shrink-0">
                  {heading}
                </h2>

                <div className="flex flex-col items-center md:items-end gap-5">
                  <p className="text-body text-dark/80 text-center md:text-right max-w-sm md:max-w-md">
                    <span className="md:hidden">{bodyMobile}</span>
                    <span className="hidden md:block">
                      {bodyDesktopLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </p>
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-btn inline-flex items-center justify-center gap-2 bg-green text-cream px-8 py-3.5 hover:bg-green/90 transition-colors w-full md:w-auto"
                  >
                    {ctaLabel}
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="dotted-divider" />
      </div>
    </section>
  );
}
