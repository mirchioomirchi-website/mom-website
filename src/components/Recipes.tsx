"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { eyebrowDevanagari, eyebrowEnglish, headingLines, subheading, slides } =
  SITE_CONTENT.recipes;

function ArrowButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full border border-cream/40 flex items-center justify-center text-cream hover:bg-cream hover:text-green hover:border-cream transition-colors duration-300"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

export default function Recipes() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      id="recipes"
      className="relative bg-green py-16 md:py-24 overflow-hidden cv-auto"
    >
      <div className="recipes-grid w-full max-w-[1400px] mx-auto px-5 md:px-9 gap-x-12 gap-y-5 md:gap-y-8">
        {/* Eyebrow */}
        <ScrollReveal className="[grid-area:eyebrow] flex items-center gap-2.5">
          <span className="font-sura text-cream text-[15px] md:text-base">
            {eyebrowDevanagari}
          </span>
          <span className="text-cream/50 text-sm">•</span>
          <span className="font-sura text-cream text-[15px] md:text-base">
            {eyebrowEnglish}
          </span>
        </ScrollReveal>

        {/* Heading — forced to exactly two lines at the designed break point */}
        <ScrollReveal delay={0.05} className="[grid-area:heading] mt-3 md:mt-4">
          <h2 className="text-h2 text-cream">
            {headingLines[0]}
            <br />
            {headingLines[1]}
          </h2>
        </ScrollReveal>

        {/* Subheading */}
        <ScrollReveal
          delay={0.1}
          className="[grid-area:subheading] mt-1 md:mt-4 md:self-end md:text-right"
        >
          <p className="text-body leading-relaxed text-cream/75 md:ml-auto max-w-[46ch]">
            {subheading}
          </p>
        </ScrollReveal>

        {/* Video — swaps per slide; placeholder mortar clip for every slide until real footage lands */}
        <ScrollReveal delay={0.15} className="[grid-area:video] my-6 md:my-10">
          <div className="relative w-full aspect-[4/3] md:aspect-[2/1] overflow-hidden bg-cream/5">
            <video
              key={index}
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.video}
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              aria-hidden="true"
            />
          </div>
        </ScrollReveal>

        {/* Slide bar — mobile: title -> description -> arrows.
            Desktop: title+arrows stacked in the left column, description on the right. */}
        <div className="[grid-area:slidebar] recipe-slidebar-grid gap-3 md:gap-4">
          <h3 className="[grid-area:title] text-h4 text-cream">
            {slide.title}
          </h3>
          <p className="[grid-area:desc] text-body leading-relaxed text-cream/75 md:text-right md:justify-self-end max-w-[46ch]">
            {slide.description}
          </p>
          <div className="[grid-area:arrows] flex items-center gap-2">
            <ArrowButton direction="prev" onClick={goPrev} label="Previous recipe" />
            <ArrowButton direction="next" onClick={goNext} label="Next recipe" />
          </div>
        </div>
      </div>
    </section>
  );
}
