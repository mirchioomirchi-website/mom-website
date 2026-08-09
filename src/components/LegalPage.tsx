import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollReveal } from "@/components/primitives";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

export type LegalSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <SmoothScroll>
      <Navigation />
      <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
        <article className="max-w-3xl mx-auto px-5 md:px-9">
          <ScrollReveal>
            <p className="text-tag text-red uppercase tracking-[0.08em] mb-4">{eyebrow}</p>
            <h1 className="text-h1 text-red mb-4">{title}</h1>
            <p className="text-tag text-dark/60 uppercase tracking-[0.06em] mb-10">
              Last updated · {updated}
            </p>

            {intro && <p className="text-body text-dark max-w-2xl mb-12">{intro}</p>}
          </ScrollReveal>

          <div className="space-y-10 md:space-y-12">
            {sections.map((s, i) => (
              <ScrollReveal key={i} delay={Math.min(i * 0.03, 0.3)}>
                <section>
                  {i > 0 && <div className="dotted-divider text-dark/15 mb-10 md:mb-12" />}
                  {s.heading && (
                    <h2 className="text-h4 font-bold text-green mb-4">{s.heading}</h2>
                  )}
                  {s.paragraphs?.map((p, pi) => (
                    <p key={pi} className="text-body text-dark/80 mb-4 last:mb-0">
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul className="space-y-2.5 mt-4">
                      {s.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-3 text-body text-dark/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-red mt-2.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.1}>
            <div className="mt-16 pt-10">
              <div className="dotted-divider text-red mb-10" />
              <p className="text-body text-dark/70">
                Questions? Email us at{" "}
                <a
                  href={`mailto:${SITE_SUPPORT_EMAIL}`}
                  className="text-red underline underline-offset-2 hover:text-red/80 transition-colors"
                >
                  {SITE_SUPPORT_EMAIL}
                </a>
                .
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 text-btn text-dark/70 hover:text-red transition-colors"
              >
                <span aria-hidden="true">←</span> Back home
              </Link>
            </div>
          </ScrollReveal>
        </article>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
