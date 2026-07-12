import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-24 md:pb-32 text-white">
        <article className="max-w-3xl mx-auto px-6 md:px-12">
          <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-4 font-semibold">
            {eyebrow}
          </p>
          <h1 className="text-4xl md:text-6xl font-quirk uppercase leading-[0.95] mb-5">
            {title}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/55 mb-10">
            Last updated · {updated}
          </p>

          {intro && (
            <p className="text-base md:text-lg text-white/85 leading-relaxed mb-12">
              {intro}
            </p>
          )}

          <div className="space-y-10">
            {sections.map((s, i) => (
              <section key={i}>
                {s.heading && (
                  <h2 className="text-xl md:text-2xl font-quirk uppercase tracking-[0.1em] mb-4">
                    {s.heading}
                  </h2>
                )}
                {s.paragraphs?.map((p, pi) => (
                  <p key={pi} className="text-white/80 leading-relaxed mb-4 last:mb-0">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="space-y-2 mt-3">
                    {s.bullets.map((b, bi) => (
                      <li
                        key={bi}
                        className="flex items-start gap-3 text-white/80 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-mom-pink mt-2 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-white/[0.06]">
            <p className="text-sm text-white/65 leading-relaxed">
              Questions? Email us at{" "}
              <a
                href="mailto:contact@mirchiomirchi.com"
                className="text-mom-pink hover:underline"
              >
                contact@mirchiomirchi.com
              </a>
              .
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-xs uppercase tracking-[0.25em] text-white/75 hover:text-white transition-colors"
            >
              ← Back home
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
