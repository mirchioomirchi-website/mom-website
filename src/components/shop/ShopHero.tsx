"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { heading, subheading } = SITE_CONTENT.shopPage.hero;

// Red hero — capped to exactly one viewport tall on desktop. Heading/
// subheading sit in their own fixed-height block up top; the transparent
// jars-and-boxes cutout (same asset as the homepage's hoverable Shop
// teaser, /images/shop/full.webp) fills whatever room is left via a flex-1
// area, object-contain so nothing ever gets cropped on tall/narrow mobile
// viewports. On mobile the section is NOT forced to fill 100vh — the image
// area sizes itself to its own aspect ratio instead, so the section is only
// as tall as its content (no leftover empty red space below the photo).
export default function ShopHero() {
  return (
    <section className="relative bg-red overflow-hidden md:h-screen flex flex-col cv-auto">
      <div className="shrink-0 pt-[150px] md:pt-[150px] pb-8 md:pb-0 px-5 text-center max-w-[560px] md:max-w-[1200px] mx-auto">
        <ScrollReveal>
          <h1 className="text-h1 text-[3.25rem] md:text-[5rem] text-cream mb-4 md:mb-6">
            {heading}
          </h1>
          <p className="text-lg md:text-xl font-medium text-cream/80 whitespace-normal md:whitespace-nowrap max-w-[95%] md:max-w-none mx-auto">
            {subheading}
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1} className="relative md:flex-1 md:min-h-0">
        <div className="relative w-full aspect-[2400/1603] md:aspect-auto md:h-full max-w-6xl mx-auto px-5 pb-6 md:pb-10">
          <Image
            src="/images/shop/full.webp"
            alt="Mirchi O Mirchi — Green, Red and Mixed Chilli Thecha jars and boxes"
            fill
            priority
            className="object-contain object-top md:object-bottom"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
