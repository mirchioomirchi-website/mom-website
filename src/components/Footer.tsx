"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { brand, shopLinks, exploreLinks, legalLinks, copyright } = SITE_CONTENT.footer;
const trackOrderLink = exploreLinks.find((l) => l.name === "Track Order")!;

// FSSAI license number comes from env so it can be filled in on Vercel
// without a code change. Falls back to "Applied For" so the line always
// renders — swap in the real number via NEXT_PUBLIC_FSSAI_NUMBER once issued.
function FooterCompliance() {
  const fssai = process.env.NEXT_PUBLIC_FSSAI_NUMBER;
  const gstin = process.env.NEXT_PUBLIC_GSTIN;
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-dark/55">
      <span>FSSAI Lic. No. {fssai || "Applied For"}</span>
      {gstin && <span>GSTIN · {gstin}</span>}
    </div>
  );
}

function InstagramGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SocialIcon() {
  return (
    <a
      href="https://www.instagram.com/mirchiomirchi/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Mirchi O Mirchi on Instagram"
      className="w-11 h-11 flex items-center justify-center text-green hover:bg-green hover:text-cream transition-colors duration-300"
    >
      <InstagramGlyph />
    </a>
  );
}

function LinkColumn({
  heading,
  links,
}: {
  heading: string;
  links: readonly { name: string; href: string }[];
}) {
  return (
    <div>
      <h5 className="text-[12px] font-semibold text-dark/45 uppercase tracking-[0.2em] mb-4">
        {heading}
      </h5>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.name} className={l.name === "Track Order" ? "hidden md:block" : undefined}>
            <Link href={l.href} className="text-body-sm text-dark/75 hover:text-green transition-colors">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-cream cv-auto">
      <div className="w-full max-w-[1400px] mx-auto px-5 md:px-9 pt-14 md:pt-20 pb-8 md:pb-10">
        {/* Wordmark */}
        <ScrollReveal>
          <Image
            src="/footer-logo.svg"
            alt={brand.title}
            width={1296}
            height={143}
            className="w-full h-auto mb-10 md:mb-16"
          />
        </ScrollReveal>

        {/* Brand block + link columns */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16 mb-10 md:mb-14">
          <div className="flex items-start justify-between md:block gap-6 md:max-w-[280px]">
            <p className="text-dark/80 text-[17px] md:text-lg leading-relaxed">
              {brand.tagline.split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <div className="flex items-center gap-2.5 shrink-0 md:mt-6">
              <SocialIcon />
              <SocialIcon />
              <SocialIcon />
            </div>
          </div>

          <div className="grid grid-cols-2 md:flex md:gap-16 lg:gap-24 gap-8">
            <LinkColumn heading="Shop" links={shopLinks} />
            <LinkColumn heading="Explore" links={exploreLinks} />
            <div className="hidden md:block">
              <LinkColumn heading="Legal" links={legalLinks} />
            </div>
          </div>
        </div>

        {/* Mobile-only: Track Order + collapsible Legal — grid-aligned under
            the Shop / Explore columns above so Legal sits directly under
            Explore rather than pinned to the far edge. */}
        <div className="md:hidden grid grid-cols-2 gap-8 mb-10">
          <Link href={trackOrderLink.href} className="font-quirk inline-flex items-center gap-1.5 font-medium text-green">
            {trackOrderLink.name}
            <span aria-hidden="true">→</span>
          </Link>
          <details className="group">
            <summary className="font-quirk list-none flex items-center gap-1.5 font-medium text-green cursor-pointer select-none">
              Legal
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-300 group-open:rotate-180"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <ul className="mt-3 space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="text-dark/70 text-sm">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>

        {/* Copyright (left) + compliance (right) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-dark/60 text-[12px] md:text-[13px]">{copyright}</p>
          <FooterCompliance />
        </div>
      </div>
    </footer>
  );
}
