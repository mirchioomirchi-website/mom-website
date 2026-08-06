"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { heading, body, ctaLabel, ctaHref } = SITE_CONTENT.aboutPage.mission;

// 50/50 split — right column is a true full-bleed image (no padding, no
// max-width, no rounding) spanning the full width and height of its column,
// same edge-to-edge convention as the PDP Hero photo. Left column stays
// inset with the page's usual padding, heading pinned to the top and
// body copy + CTA pinned to the bottom of the same column height (same
// top/bottom split convention as PdpPairing's text column).
export default function AboutMission() {
  return (
    <section className="relative bg-cream cv-auto">
      <div aria-hidden="true" className="dotted-divider text-green absolute inset-x-0 top-0" />
      <div aria-hidden="true" className="dotted-divider text-green absolute inset-x-0 bottom-0" />

      <div className="grid md:grid-cols-2 md:h-[80vh]">
        {/* self-start so this column sizes to its own content instead of
            stretching to match the image column's height — with a fixed
            height, a flex `justify-center` has to split leftover space
            between top and bottom itself, which is where the unevenness
            was coming from. Sized purely by padding now, so top/bottom
            are guaranteed identical. */}
        <div className="flex flex-col self-start gap-8 md:gap-[8rem] pl-5 pr-5 md:pl-[8rem] md:pr-[4rem] py-16 md:py-[11rem]">
          <ScrollReveal>
            <h2 className="text-h2 text-dark max-w-md">{heading}</h2>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <p className="text-body text-dark/70 max-w-sm mb-6">{body}</p>
            <Link
              href={ctaHref}
              className="text-btn inline-flex items-center gap-2 bg-green text-cream px-8 py-3.5 hover:bg-green/90 transition-colors"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          <div className="relative w-full h-[70vh] md:h-full">
            <Image
              src="/images/about/all-flavours-shot.webp"
              alt="Green Chilli, Red Chilli and Mixed Chilli thecha jars with fresh chillies"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
