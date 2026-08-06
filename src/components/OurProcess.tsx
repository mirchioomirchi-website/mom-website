"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

export default function OurProcess() {
  const { eyebrowDevanagari, eyebrowEnglish, heading, steps, cta, ctaHref } =
    SITE_CONTENT.ourProcess;

  return (
    <section className="relative bg-cream py-16 md:py-24 overflow-hidden cv-auto">
      <div className="process-grid w-full max-w-[1400px] mx-auto px-5 md:px-9 gap-x-16 gap-y-6 md:gap-y-8">
        {/* Eyebrow */}
        <ScrollReveal className="[grid-area:eyebrow] flex items-center gap-2.5">
          <span className="font-sura text-pink text-[15px] md:text-base">
            {eyebrowDevanagari}
          </span>
          <span className="text-pink/50 text-sm">•</span>
          <span className="font-sura text-pink text-[15px] md:text-base">
            {eyebrowEnglish}
          </span>
        </ScrollReveal>

        {/* Heading */}
        <ScrollReveal delay={0.05} className="[grid-area:heading] mt-3 md:mt-4 mb-8 md:mb-0">
          <h2 className="text-h2 max-w-[13ch] md:max-w-[8ch]">
            {heading}
          </h2>
        </ScrollReveal>

        {/* Video — real multi-angle mortar footage, autoplay/loop/muted, no controls */}
        <ScrollReveal delay={0.1} className="[grid-area:video] my-2 md:my-10">
          <div className="relative w-full aspect-video md:aspect-[5/2] overflow-hidden bg-dark/5">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src="/videos/mortar.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              aria-hidden="true"
            />
          </div>
        </ScrollReveal>

        {/* Numbered steps */}
        <div className="[grid-area:steps] flex flex-col gap-8 md:gap-10">
          {steps.map((step, i) => (
            <ScrollReveal
              key={step.number}
              delay={0.1 + i * 0.08}
              className="flex items-start gap-5 md:gap-6"
            >
              <span className="font-sura text-pink/50 text-5xl md:text-6xl leading-none shrink-0">
                {step.number}
              </span>
              <div>
                <h3 className="text-h4 mb-2">{step.title}</h3>
                <p className="text-body leading-relaxed text-dark/70">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal
          delay={0.2}
          className="[grid-area:cta] mt-6 md:mt-14 text-center md:text-left"
        >
          <Link
            href={ctaHref}
            className="text-btn inline-flex items-center gap-1.5 underline decoration-pink decoration-2 underline-offset-4 hover:text-pink transition-colors"
          >
            {cta}
            <span aria-hidden="true" className="hidden md:inline">
              →
            </span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
