"use client";

import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { SITE_LEGAL_NAME, SITE_REGISTERED_ADDRESS, SITE_SUPPORT_EMAIL } from "@/lib/site";

const { details } = SITE_CONTENT.contactPage;

export default function ContactInfo() {
  return (
    <section className="relative bg-cream pt-12 md:pt-16 pb-16 md:pb-20 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <ScrollReveal>
            <h2 className="text-h4 font-bold text-red mb-3">{SITE_LEGAL_NAME}</h2>
            <p className="text-body text-dark max-w-md">{SITE_REGISTERED_ADDRESS}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.06}>
            <h2 className="text-h4 font-bold text-red mb-3">{details.grievanceHeading}</h2>
            <p className="text-body text-dark max-w-lg">
              {details.grievanceIntro}{" "}
              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className="text-red underline underline-offset-2 hover:text-red/80 transition-colors"
              >
                {SITE_SUPPORT_EMAIL}
              </a>
              . {details.grievanceNote}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
