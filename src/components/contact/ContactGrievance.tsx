"use client";

// NOTE: not currently rendered on /contact — its content (grievance officer
// + back-home link) was folded into ContactInfo.tsx's two-column "Get in
// touch" section to match the latest design reference (Jul 2026). Left in
// place (self-contained, not pulling from SITE_CONTENT.contactPage, which no
// longer has `grievance`/`backLabel` keys) rather than deleted, since files
// in this workspace folder can't be removed from here.

import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

const GRIEVANCE = {
  label: "Grievance officer",
  intro:
    "Under the Consumer Protection (E-Commerce) Rules 2020, you can reach our grievance officer for unresolved complaints at",
  note: "We acknowledge every complaint within 48 hours and resolve within 30 days.",
};
const BACK_LABEL = "Back home";

export default function ContactGrievance() {
  return (
    <section className="relative bg-cream pb-14 md:pb-20 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="bg-cream-dark p-7 md:p-9">
              <p className="text-tag text-red uppercase tracking-[0.08em] mb-3">
                {GRIEVANCE.label}
              </p>
              <p className="text-body text-dark/70">
                {GRIEVANCE.intro}{" "}
                <a
                  href={`mailto:${SITE_SUPPORT_EMAIL}`}
                  className="text-red underline underline-offset-2 hover:text-red/80 transition-colors"
                >
                  {SITE_SUPPORT_EMAIL}
                </a>
                . {GRIEVANCE.note}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.06} className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-btn text-dark/70 hover:text-red transition-colors"
            >
              <span aria-hidden="true">←</span> {BACK_LABEL}
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
