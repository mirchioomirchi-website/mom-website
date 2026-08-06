"use client";

import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { SITE_SUPPORT_EMAIL, SITE_SUPPORT_PHONE } from "@/lib/site";
import FaqAccordionItem from "./FaqAccordionItem";

const { categories, stillQuestions } = SITE_CONTENT.faqPage;

export default function FaqList() {
  return (
    <section className="relative bg-cream pb-20 md:pb-28 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="grid md:grid-cols-[2fr_1fr] gap-12 md:gap-16 mt-16 md:mt-20 items-start">
          <div className="space-y-12 md:space-y-14">
            {categories.map((cat, ci) => (
              <ScrollReveal key={cat.name} delay={Math.min(ci * 0.05, 0.2)}>
                <h2 className="text-[2rem] font-bold text-green mb-2 leading-tight">{cat.name}</h2>
                <div>
                  {cat.items.map((item, i) => (
                    <div key={item.q}>
                      <FaqAccordionItem q={item.q} a={item.a} />
                      {i < cat.items.length - 1 && (
                        <div className="dotted-divider text-dark/15" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.1}>
            <div className="bg-cream-dark rounded-2xl p-8 md:p-9">
              <p className="text-tag font-bold text-red mb-2">{stillQuestions.heading}</p>
              <p className="text-body-sm text-dark/70 mb-6">{stillQuestions.note}</p>

              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className="block text-xl font-bold text-dark hover:text-red transition-colors break-all mb-1"
              >
                {SITE_SUPPORT_EMAIL}
              </a>
              <p className="text-body-sm text-dark/60 mb-6">Email us anytime</p>

              <a
                href={`tel:${SITE_SUPPORT_PHONE.replace(/[^+\d]/g, "")}`}
                className="block text-xl font-bold text-dark hover:text-red transition-colors mb-1"
              >
                {SITE_SUPPORT_PHONE}
              </a>
              <p className="text-body-sm text-dark/60">We reply within a day</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
