"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal, WordReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { trackSignUp } from "@/lib/analytics-events";

// FSSAI license number + GSTIN come from env so the values can be filled in
// Vercel without a code change. Both render only if present.
function FooterCompliance() {
  const fssai = process.env.NEXT_PUBLIC_FSSAI_NUMBER;
  const gstin = process.env.NEXT_PUBLIC_GSTIN;
  if (!fssai && !gstin) return null;
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.25em] text-white/45">
      {fssai && <span>FSSAI · {fssai}</span>}
      {gstin && <span>GSTIN · {gstin}</span>}
    </div>
  );
}

type NewsletterStatus = "idle" | "sending" | "sent" | "error";

function NewsletterForm() {
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const website = String(data.get("website") || "");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", website }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || `Couldn't subscribe (${res.status})`);
      setStatus("sent");
      trackSignUp("newsletter_footer");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't subscribe.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-6"
    >
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden"
      />
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        maxLength={150}
        autoComplete="email"
        aria-label="Email address"
        placeholder={SITE_CONTENT.footer.newsletter.placeholder}
        disabled={status === "sending" || status === "sent"}
        className="flex-1 px-5 py-3 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs text-white placeholder:text-white/30 outline-none focus:border-mom-pink/40 transition-colors disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "sending" || status === "sent"}
        className="px-6 py-3 bg-mom-pink text-white text-[12px] uppercase tracking-[0.15em] font-quirk rounded-full hover:bg-mom-pink/90 hover:shadow-[0_0_20px_rgba(245,25,127,0.3)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending"
          ? "…"
          : status === "sent"
            ? "Subscribed"
            : SITE_CONTENT.footer.newsletter.cta}
      </button>
      {error && (
        <p
          role="alert"
          className="basis-full text-[11px] text-mom-red text-center"
        >
          {error}
        </p>
      )}
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-mom-black border-t border-white/[0.04] cv-auto">
      <div className="w-full max-w-[1400px] mx-auto px-8 md:px-12 py-14 md:py-20">
        {/* Newsletter */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <WordReveal
              text={SITE_CONTENT.footer.newsletter.heading}
              tag="h3"
              className="text-3xl md:text-5xl font-quirk uppercase mb-3"
            />
            <p className="text-[12px] text-white/35 max-w-sm mx-auto leading-relaxed">
              {SITE_CONTENT.footer.newsletter.body}
            </p>

            <NewsletterForm />
          </div>
        </ScrollReveal>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/[0.06] mb-12" />

        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <ScrollReveal delay={0}>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-base font-quirk tracking-[0.1em] uppercase mb-3">
                {SITE_CONTENT.footer.brand.title}
              </h4>
              <p className="text-[12px] text-white/35 leading-[1.8] whitespace-pre-line">
                {SITE_CONTENT.footer.brand.tagline}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div>
              <h5 className="text-[12px] uppercase tracking-[0.25em] text-white/30 mb-3">
                Shop
              </h5>
              <ul className="space-y-2">
                {[
                  { name: "Green Chilli Thecha", href: "/products/green-chilli-thecha" },
                  { name: "Mixed Chilli Thecha", href: "/products/mixed-chilli-thecha" },
                  { name: "Red Chilli Thecha", href: "/products/red-chilli-thecha" },
                  { name: "Combo Pack", href: "/products/combo-pack" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[12px] text-white/35 hover:text-mom-pink transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div>
              <h5 className="text-[12px] uppercase tracking-[0.25em] text-white/30 mb-3">
                Company
              </h5>
              <ul className="space-y-2">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Contact Us", href: "/contact" },
                  { name: "Track Order", href: "/orders/track" },
                  { name: "Shop", href: "/shop" },
                  { name: "Blog", href: "/blog" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[12px] text-white/35 hover:text-mom-pink transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div>
              <h5 className="text-[12px] uppercase tracking-[0.25em] text-white/30 mb-3">
                Follow
              </h5>
              <p className="text-[11px] text-white/30 leading-[1.7] mb-3">
                Socials launching soon. Sign up above for first access.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Compliance line — FSSAI / GSTIN populate from env when available */}
        <FooterCompliance />

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-white/25 tracking-wide">
            &copy; 2026 Mirchi O Mirchi. All rights reserved. Vivenza Marketing LLP.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { name: "Privacy Policy", href: "/privacy" },
              { name: "Terms of Service", href: "/terms" },
              { name: "Refund Policy", href: "/refund" },
              { name: "Shipping Policy", href: "/shipping" },
              { name: "Contact Us", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[12px] text-white/25 hover:text-white/50 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
