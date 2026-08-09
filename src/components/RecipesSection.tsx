"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { eyebrowDevanagari, eyebrowEnglish, headingLines, subheading: homeSubheading, slides } =
  SITE_CONTENT.recipes;
const { heading: pdpHeading, subheading: pdpSubheading, ctaLabel, ctaHref } =
  SITE_CONTENT.productPage.pairing;

// Cascading video stack (desktop) — distance-from-active drives both size
// and opacity: the active dish is full size/opacity, the next one 80%/60%,
// the one after that 60%/40%. Anything further back isn't rendered at all.
const OFFSETS = [
  { heightPct: 100, opacity: 1 },
  { heightPct: 80, opacity: 0.6 },
  { heightPct: 60, opacity: 0.4 },
];

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
      className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full border border-cream/40 flex items-center justify-center text-cream hover:bg-cream hover:text-dark hover:border-cream transition-colors duration-300 cursor-pointer"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

export default function RecipesSection({
  variant,
  accentColor,
}: {
  variant: "home" | "pdp";
  accentColor?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];

  const goPrev = () => setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % slides.length);
  const selectIndex = (i: number) => setActiveIndex(i);

  // Mobile carousel — tracks whichever card is most centered in the
  // horizontal scroller (same convention as PdpCrossSell), so a tap on a
  // card that isn't centered yet just scrolls it into focus first.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.6] }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToCard = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section
      id={variant === "home" ? "recipes" : undefined}
      className={`relative py-16 md:py-24 overflow-hidden cv-auto ${variant === "home" ? "bg-green" : ""}`}
      style={variant === "pdp" ? { background: accentColor } : undefined}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="grid md:grid-cols-[2fr_3fr] gap-8 md:gap-16 md:items-center">
          {/* LEFT column — section text + the active dish's info + nav. */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            {variant === "home" ? (
              <div className="flex flex-col gap-3 md:gap-4">
                <ScrollReveal className="flex items-center gap-2.5">
                  <span className="font-sura text-cream text-[15px] md:text-base">{eyebrowDevanagari}</span>
                  <span className="text-cream/50 text-sm">•</span>
                  <span className="font-sura text-cream text-[15px] md:text-base">{eyebrowEnglish}</span>
                </ScrollReveal>
                <ScrollReveal delay={0.05}>
                  <h2 className="text-h2 text-cream">
                    {headingLines[0]}
                    <br />
                    {headingLines[1]}
                  </h2>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                  <p className="text-body leading-relaxed text-cream/75 max-w-[46ch]">{homeSubheading}</p>
                </ScrollReveal>
              </div>
            ) : (
              <ScrollReveal>
                <h2 className="text-h2 text-cream mb-3">{pdpHeading}</h2>
                <p className="text-body leading-relaxed text-cream/80 max-w-md">{pdpSubheading}</p>
              </ScrollReveal>
            )}

            {/* Mobile — swipeable video cards, current one filling most of
                the width with the next one peeking at the edge. */}
            <div
              ref={scrollRef}
              className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {slides.map((s, i) => (
                <div
                  key={s.title}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  data-index={i}
                  className="relative snap-center shrink-0 w-[78%] aspect-[9/16] rounded-2xl overflow-hidden bg-cream/10"
                  onClickCapture={(e) => {
                    if (i !== activeIndex) {
                      e.preventDefault();
                      e.stopPropagation();
                      scrollToCard(i);
                    }
                  }}
                >
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={s.video}
                    autoPlay={i === activeIndex}
                    preload={i === activeIndex ? "auto" : "metadata"}
                    loop
                    muted
                    playsInline
                    controls={false}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>

            <ScrollReveal delay={0.1} className="pt-5 md:pt-2 border-t border-cream/15">
              <h3 className="text-h4 text-cream mb-2">{slide.title}</h3>
              <p className="text-body leading-relaxed text-cream/75 max-w-[42ch] mb-5">{slide.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <ArrowButton direction="prev" onClick={goPrev} label="Previous recipe" />
                  <ArrowButton direction="next" onClick={goNext} label="Next recipe" />
                </div>
                {variant === "pdp" && (
                  <Link
                    href={ctaHref}
                    className="text-btn inline-flex items-center gap-1.5 text-cream underline decoration-cream decoration-2 underline-offset-4 hover:text-cream/80 transition-colors"
                  >
                    {ctaLabel}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT column — desktop only, cascading video slider. Only the
              active clip + next two are ever rendered; overflow-hidden lets
              the trailing one clip off the edge exactly like the reference
              design. Clicking a smaller clip brings it into focus. */}
          <div className="hidden md:flex relative h-[440px] lg:h-[560px] items-center overflow-hidden">
            <div className="flex items-center gap-6 lg:gap-8 h-full">
              {slides.map((s, i) => {
                const offset = (i - activeIndex + slides.length) % slides.length;
                if (offset > 2) return null;
                const { heightPct, opacity } = OFFSETS[offset];
                return (
                  <button
                    key={s.title}
                    type="button"
                    tabIndex={offset === 0 ? -1 : 0}
                    onClick={() => offset !== 0 && selectIndex(i)}
                    aria-label={offset === 0 ? s.title : `Show ${s.title}`}
                    className={`relative shrink-0 rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
                      offset === 0 ? "cursor-default" : "cursor-pointer"
                    }`}
                    style={{ height: `${heightPct}%`, aspectRatio: "9 / 16", opacity }}
                  >
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      src={s.video}
                      autoPlay={offset === 0}
                      preload={offset === 0 ? "auto" : "metadata"}
                      loop
                      muted
                      playsInline
                      controls={false}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
