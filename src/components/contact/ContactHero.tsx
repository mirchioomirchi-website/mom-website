"use client";

import { ScrollReveal, Eyebrow } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { eyebrowDevanagari, eyebrowEnglish, heading, subheading } = SITE_CONTENT.contactPage.hero;

export default function ContactHero() {
  return (
    <section className="relative bg-cream pt-28 md:pt-36 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6 mb-6">
            <h1 className="order-last md:order-none text-[2.75rem] md:text-[5rem] font-bold text-green leading-[0.95]">
              {heading}
            </h1>
            <Eyebrow
              devanagari={eyebrowDevanagari}
              english={eyebrowEnglish}
              color="red"
              className="order-first md:order-none whitespace-nowrap shrink-0 md:pt-4"
            />
          </div>
          <p className="text-body text-dark max-w-xl">{subheading}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
