"use client";

import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { SITE_SUPPORT_EMAIL, SITE_SUPPORT_HOURS, SITE_SUPPORT_PHONE, SITE_WHATSAPP_NUMBER } from "@/lib/site";
import ContactForm from "@/components/ContactForm";

const { infoPanel } = SITE_CONTENT.contactPage;

export default function ContactFormSection() {
  return (
    <section className="relative bg-cream pt-12 md:pt-16 pb-12 md:pb-16 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="grid md:grid-cols-[2fr_1fr] gap-10 md:gap-16 items-start">
          <ScrollReveal>
            <ContactForm />
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="bg-cream-dark rounded-2xl p-8 md:p-9">
              <p className="text-tag font-bold text-red mb-2">{infoPanel.emailLabel}</p>
              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className="block text-xl md:text-2xl font-bold text-dark hover:text-red transition-colors break-all"
              >
                {SITE_SUPPORT_EMAIL}
              </a>
              <p className="text-body-sm text-dark/70 mt-3">{infoPanel.emailNote}</p>

              <div className="mt-8">
                <a
                  href={`https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(infoPanel.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-body font-bold text-red hover:text-red/80 transition-colors mb-1"
                >
                  {infoPanel.whatsappLabel}
                </a>
                <a
                  href={`tel:${SITE_SUPPORT_PHONE.replace(/[^+\d]/g, "")}`}
                  className="block text-xl font-bold text-dark hover:text-red transition-colors"
                >
                  {SITE_SUPPORT_PHONE}
                </a>
                <p className="text-body-sm text-dark/60 mt-2">{SITE_SUPPORT_HOURS}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-9 mt-12 md:mt-16">
        <div className="dotted-divider text-red" />
      </div>
    </section>
  );
}
