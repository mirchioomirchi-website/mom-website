import type { Metadata } from "next";
import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  SITE_LEGAL_NAME,
  SITE_REGISTERED_ADDRESS,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_PHONE,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us — Mirchi O Mirchi",
  description:
    "Mirchi O Mirchi is operated by Vivenza Marketing LLP. Handcrafted Indian thecha in small batches — three flavours, real ingredients, no fillers.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <SmoothScroll>
      <Navigation />
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-24 md:pb-32 text-white">
        <article className="max-w-3xl mx-auto px-6 md:px-12">
          <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-4 font-semibold">
            Our story
          </p>
          <h1 className="text-4xl md:text-6xl font-quirk uppercase leading-[0.95] mb-8">
            About Mirchi O Mirchi
          </h1>

          <div className="space-y-6 text-base md:text-lg text-white/85 leading-relaxed">
            <p>
              Mirchi O Mirchi is a handcrafted Indian thecha brand — bold flavour, real
              ingredients, small batches. We make three thechas: Green Chilli, Red Chilli,
              and Mixed Chilli. Every jar is hand-pounded, slow-cooked, and packed in
              Maharashtra.
            </p>
            <p>
              We started Mirchi O Mirchi because the thecha sitting on supermarket shelves
              had become unrecognisable — thinned out with vinegar, padded with starch,
              soaked in cheap oil. We wanted to bring the real one back. Six ingredients,
              nothing else. No preservatives, no colours, no shortcuts.
            </p>
            <p>
              Each jar is made in small batches and shipped pan-India directly from our
              kitchen. We ship within 24 hours, every order tracked end-to-end.
            </p>
          </div>

          {/* What we make */}
          <section className="mt-14">
            <h2 className="text-2xl md:text-3xl font-quirk uppercase tracking-[0.05em] mb-5">
              What we make
            </h2>
            <ul className="space-y-3">
              {[
                {
                  name: "Green Chilli Thecha",
                  desc: "Classy. Sassy. Bad-assy. Bright, sharp green chilli heat.",
                },
                {
                  name: "Red Chilli Thecha",
                  desc: "Fierce. Fiery. Fearless. Deep red chilli with a slow build.",
                },
                {
                  name: "Mixed Chilli Thecha",
                  desc: "Traditional. Powerful. Complex. Both chillies together.",
                },
                {
                  name: "Combo Pack",
                  desc: "All three jars in one box — the easiest way to start.",
                },
              ].map((p) => (
                <li
                  key={p.name}
                  className="flex items-start gap-3 text-white/85 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-mom-pink mt-2 shrink-0" />
                  <span>
                    <span className="font-semibold">{p.name}</span> — {p.desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* How we make it */}
          <section className="mt-14">
            <h2 className="text-2xl md:text-3xl font-quirk uppercase tracking-[0.05em] mb-5">
              How we make it
            </h2>
            <ul className="space-y-3">
              {[
                "Stone-ground in small batches — no mass production, no shortcuts.",
                "Six real ingredients. No vinegar, no synthetic colours, no preservatives.",
                "Cold-filled and sealed within the same day the batch is made.",
                "Each jar leaves the kitchen with a batch code so we can trace it back.",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-white/85 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-mom-pink mt-2 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Business info */}
          <section className="mt-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-mom-pink mb-4">
              Business details
            </p>
            <dl className="space-y-3 text-sm md:text-base">
              <div>
                <dt className="text-white/55 uppercase tracking-[0.15em] text-[11px] mb-1">
                  Legal entity
                </dt>
                <dd className="text-white/90">{SITE_LEGAL_NAME}</dd>
              </div>
              <div>
                <dt className="text-white/55 uppercase tracking-[0.15em] text-[11px] mb-1">
                  Registered office
                </dt>
                <dd className="text-white/90">{SITE_REGISTERED_ADDRESS}</dd>
              </div>
              <div>
                <dt className="text-white/55 uppercase tracking-[0.15em] text-[11px] mb-1">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${SITE_SUPPORT_EMAIL}`}
                    className="text-mom-pink hover:underline"
                  >
                    {SITE_SUPPORT_EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-white/55 uppercase tracking-[0.15em] text-[11px] mb-1">
                  Phone
                </dt>
                <dd>
                  <a
                    href={`tel:${SITE_SUPPORT_PHONE.replace(/[^+\d]/g, "")}`}
                    className="text-mom-pink hover:underline"
                  >
                    {SITE_SUPPORT_PHONE}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="px-6 py-3 bg-mom-pink text-white text-[12px] uppercase tracking-[0.15em] font-quirk rounded-full hover:bg-mom-pink/90 transition-colors"
            >
              Shop the jars
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-white/15 text-white text-[12px] uppercase tracking-[0.15em] font-quirk rounded-full hover:bg-white/[0.04] transition-colors"
            >
              Contact us
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
