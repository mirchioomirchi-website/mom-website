"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { eyebrowDevanagari, eyebrowEnglish, slides } = SITE_CONTENT.recipes;
const { heading: pdpHeading, subheading: pdpSubheading, ctaLabel, ctaHref } =
  SITE_CONTENT.productPage.pairing;

// Cascading video stack (desktop) — distance-from-active drives both size
// and opacity: the active dish is full size/opacity, the next one 80%/60%,
// the one after that 60%/40%. Anything further back isn't rendered at all.
const OFFSETS = [
  { heightPct: 100, opacity: 1 },
  { heightPct: 80, opacity: 0.55 },
  { heightPct: 60, opacity: 0.35 },
];

const SLIDE_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

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
      className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full border border-cream/40 flex items-center justify-center text-cream hover:bg-cream hover:text-dark hover:border-cream transition-colors duration-300 cursor-pointer"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  // Mobile carousel refs — declared up front so `selectIndex` below (used by
  // both the desktop click-to-select and the shared prev/next arrows) can
  // scroll the mobile track into sync too, regardless of which breakpoint
  // triggered the change.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollToCard = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const selectIndex = (i: number) => {
    setActiveIndex(i);
    scrollToCard(i);
  };
  const goPrev = () => selectIndex((activeIndex - 1 + slides.length) % slides.length);
  const goNext = () => selectIndex((activeIndex + 1) % slides.length);

  // The `autoPlay` attribute only fires once, at mount — flipping it as a
  // prop on an already-mounted <video> does nothing. So whenever the active
  // dish changes we imperatively play its clip(s) — desktop stack + mobile
  // carousel share the same slide, both get a ref registered here — and
  // pause everything else.
  const mobileVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const desktopVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  useEffect(() => {
    const sync = (map: Record<string, HTMLVideoElement | null>) => {
      Object.entries(map).forEach(([title, el]) => {
        if (!el) return;
        if (title === slide.title) {
          el.currentTime = 0;
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      });
    };
    sync(mobileVideoRefs.current);
    sync(desktopVideoRefs.current);
  }, [slide.title]);

  // Tracks whichever card is most centered in the horizontal scroller (same
  // convention as PdpCrossSell), so a tap on a card that isn't centered yet
  // just scrolls it into focus first.
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

  // Windowed, offset-ordered — index 0 of this array is always the active
  // dish. Rendering in THIS order (rather than the slides' fixed order) is
  // what makes the active clip visually slide into the lead position: with
  // a stable per-dish `key` + framer's `layout` prop, reordering the array
  // triggers a FLIP animation instead of an instant jump.
  const windowed = [0, 1, 2].map((offset) => {
    const idx = (activeIndex + offset) % slides.length;
    return { offset, idx, slide: slides[idx] };
  });

  return (
    <section
      id={variant === "home" ? "recipes" : undefined}
      className={`relative py-16 md:py-24 overflow-hidden cv-auto ${variant === "home" ? "bg-red" : ""}`}
      style={variant === "pdp" ? { background: accentColor } : undefined}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="md:grid md:grid-cols-[2fr_3fr] gap-10 md:gap-14 lg:gap-20 md:items-center">
          {/* LEFT column — section eyebrow/heading, ~40% of the row on
              desktop. */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            {variant === "home" ? (
              <ScrollReveal className="flex items-center gap-2.5">
                <span className="font-sura text-cream text-[15px] md:text-base">{eyebrowDevanagari}</span>
                <span className="text-cream/50 text-sm">•</span>
                <span className="font-sura text-cream text-[15px] md:text-base">{eyebrowEnglish}</span>
              </ScrollReveal>
            ) : (
              <ScrollReveal>
                <h2 className="text-h2 text-cream mb-3">{pdpHeading}</h2>
                <p className="text-body leading-relaxed text-cream/80 max-w-md">{pdpSubheading}</p>
              </ScrollReveal>
            )}

            {/* Mobile — dish name + description come before the video here
                (opposite order from desktop), with the arrows sitting right
                next to the dish name instead of below the description. */}
            <ScrollReveal delay={0.05} className="md:hidden">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-h2 text-cream">{slide.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <ArrowButton direction="prev" onClick={goPrev} label="Previous recipe" />
                  <ArrowButton direction="next" onClick={goNext} label="Next recipe" />
                </div>
              </div>
              <p className="text-body leading-relaxed text-cream/75 mt-2">{slide.description}</p>
              {variant === "pdp" && (
                <Link
                  href={ctaHref}
                  className="text-btn inline-flex items-center gap-1.5 text-cream underline decoration-cream decoration-2 underline-offset-4 hover:text-cream/80 transition-colors mt-3"
                >
                  {ctaLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </ScrollReveal>

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
                  className="relative snap-center shrink-0 w-[62%] aspect-[9/16] overflow-hidden bg-cream/10 transition-opacity duration-300"
                  style={{ opacity: i === activeIndex ? 1 : 0.6 }}
                  onClickCapture={(e) => {
                    if (i !== activeIndex) {
                      e.preventDefault();
                      e.stopPropagation();
                      scrollToCard(i);
                    }
                  }}
                >
                  <video
                    ref={(el) => {
                      mobileVideoRefs.current[s.title] = el;
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={s.video}
                    loop
                    muted
                    playsInline
                    aria-hidden={i !== activeIndex}
                  />
                </div>
              ))}
            </div>

            {/* Desktop — dish name, description, then the arrows below. */}
            <ScrollReveal delay={0.1} className="hidden md:block">
              <h3 className="text-h2 text-cream mb-2">{slide.title}</h3>
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

          {/* RIGHT column — desktop only, cascading video slider, ~60% of
              the row. The negative right margin exactly cancels the
              container's own right inset (px-9, plus half the leftover
              space once the page is wider than the 1400px container), so
              this column's box — and the overflow-hidden clip point along
              with it — reaches the true edge of the viewport instead of
              stopping at the container's padding. Clicking a smaller clip
              brings it into focus — with `layout` + a stable per-dish key,
              it slides into the lead position instead of jumping or
              flashing. */}
          <div
            className="hidden md:flex relative h-[440px] lg:h-[560px] items-center overflow-hidden"
            style={{ marginRight: "calc(-1 * (max(0px, (100vw - 1400px) / 2) + 2.25rem))" }}
          >
            <div className="flex items-center gap-6 lg:gap-8 h-full">
              <AnimatePresence initial={false}>
                {windowed.map(({ offset, idx, slide: s }) => {
                  const { heightPct, opacity } = OFFSETS[offset];
                  const isActive = offset === 0;
                  return (
                    <motion.div
                      key={s.title}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity }}
                      exit={{ opacity: 0 }}
                      transition={{ layout: SLIDE_TRANSITION, opacity: { duration: 0.35 } }}
                      style={{ height: `${heightPct}%`, aspectRatio: "9 / 16" }}
                      className={`relative shrink-0 overflow-hidden ${isActive ? "" : "cursor-pointer"}`}
                      onClick={isActive ? undefined : () => selectIndex(idx)}
                      role={isActive ? undefined : "button"}
                      tabIndex={isActive ? undefined : 0}
                      aria-label={isActive ? undefined : `Show ${s.title}`}
                    >
                      <video
                        ref={(el) => {
                          desktopVideoRefs.current[s.title] = el;
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                        src={s.video}
                        loop
                        muted
                        playsInline
                        aria-hidden={!isActive}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
