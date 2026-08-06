"use client";

// NOTE: not currently rendered on /contact — the latest design reference
// (Jul 2026) folds "what's this about" into the query-type dropdown on the
// form instead of separate category cards. Left in place (self-contained,
// not pulling from SITE_CONTENT.contactPage, which no longer has a
// `categories` key) rather than deleted, since files in this workspace
// folder can't be removed from here. Safe to delete manually, or wire back
// in if the design changes again.

import { ScrollReveal } from "@/components/primitives";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

const CATEGORIES = [
  {
    title: "Order help",
    body: "Status, tracking, refunds, replacements. Include your order ID.",
    subject: "Order help",
  },
  {
    title: "Wholesale + B2B",
    body: "Bulk pricing, distribution, retail partnerships, HoReCa enquiries.",
    subject: "Wholesale enquiry",
  },
  {
    title: "Press + collabs",
    body: "Media, creator collabs, brand partnerships, podcast invites.",
    subject: "Press / collab",
  },
];

export default function ContactCategories() {
  return (
    <section className="relative bg-cream pt-10 md:pt-12 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {CATEGORIES.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 0.06}>
              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}?subject=${encodeURIComponent(c.subject)}`}
                className="group block bg-cream-dark p-6 md:p-7 h-full hover:bg-red transition-colors"
              >
                <p className="text-tag font-bold text-dark uppercase tracking-[0.05em] mb-2 group-hover:text-cream transition-colors">
                  {c.title}
                </p>
                <p className="text-body-sm text-dark/60 group-hover:text-cream/80 transition-colors">
                  {c.body}
                </p>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
