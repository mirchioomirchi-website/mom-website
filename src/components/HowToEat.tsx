"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ScrollReveal, WordReveal } from "@/components/primitives";

// Hand-drawn doodle icons — thick, messy strokes like ink on a tiffin note.
// rough-style strokeWidth, slight wobble, unfinished edges, dot fills.
const doodle = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icons = {
  toast: (
    <svg viewBox="0 0 64 64" {...doodle}>
      {/* slice of toast — wobbly outline */}
      <path d="M11 27 C 11 17, 19 12, 32 11 C 45 12, 53 17, 53 27 L 52 51 L 12 52 Z" />
      {/* messy thecha smear with seeds */}
      <path d="M18 32 C 24 30, 30 34, 38 31 C 44 30, 48 33, 47 36" />
      <path d="M18 39 C 26 38, 32 41, 40 38 C 44 37, 47 39, 46 41" />
      <circle cx="22" cy="44" r="1.6" fill="currentColor" />
      <circle cx="32" cy="45" r="1.4" fill="currentColor" />
      <circle cx="40" cy="44" r="1.6" fill="currentColor" />
    </svg>
  ),
  rice: (
    <svg viewBox="0 0 64 64" {...doodle}>
      {/* bowl — slightly uneven */}
      <path d="M9 36 C 9 36, 18 33, 32 33 C 46 33, 55 36, 55 36 C 55 47, 46 53, 32 53 C 18 53, 9 47, 9 36 Z" />
      {/* steam squiggles */}
      <path d="M22 24 C 22 20, 26 20, 26 16 C 26 13, 23 12, 23 10" />
      <path d="M32 22 C 32 18, 36 18, 36 14 C 36 11, 33 10, 33 8" />
      <path d="M42 24 C 42 20, 46 20, 46 16 C 46 13, 43 12, 43 10" />
      {/* rice grains */}
      <ellipse cx="22" cy="40" rx="2" ry="1" fill="currentColor" />
      <ellipse cx="32" cy="38" rx="2" ry="1" fill="currentColor" />
      <ellipse cx="42" cy="40" rx="2" ry="1" fill="currentColor" />
    </svg>
  ),
  paratha: (
    <svg viewBox="0 0 64 64" {...doodle}>
      {/* wobbly disc with torn edges */}
      <path d="M32 9 C 44 9, 55 18, 55 31 C 55 44, 46 55, 32 55 C 18 55, 9 44, 9 31 C 9 19, 20 9, 32 9 Z" />
      {/* layer lines */}
      <path d="M16 24 C 22 28, 28 32, 22 38" />
      <path d="M30 18 C 32 26, 28 34, 32 42" />
      <path d="M44 22 C 40 30, 46 36, 42 44" />
      {/* char dots */}
      <circle cx="22" cy="44" r="1.6" fill="currentColor" />
      <circle cx="40" cy="26" r="1.6" fill="currentColor" />
      <circle cx="38" cy="42" r="1.4" fill="currentColor" />
    </svg>
  ),
  eggs: (
    <svg viewBox="0 0 64 64" {...doodle}>
      {/* messy egg-white blob */}
      <path d="M14 38 C 9 28, 18 18, 28 19 C 36 14, 50 18, 52 30 C 56 42, 44 50, 32 48 C 22 50, 12 46, 14 38 Z" />
      {/* yolk */}
      <circle cx="30" cy="32" r="6" fill="currentColor" stroke="none" opacity="0.45" />
      <circle cx="30" cy="32" r="6" />
      {/* heat squiggle */}
      <path d="M50 38 C 53 39, 56 40, 58 41" />
    </svg>
  ),
  dal: (
    <svg viewBox="0 0 64 64" {...doodle}>
      {/* katori bowl */}
      <path d="M8 30 C 8 30, 20 28, 32 28 C 44 28, 56 30, 56 30 C 56 44, 46 52, 32 52 C 18 52, 8 44, 8 30 Z" />
      {/* spoon sticking out */}
      <path d="M40 14 L 50 4" />
      <path d="M48 6 C 52 8, 54 12, 50 14" />
      {/* dal swirl + thecha drop */}
      <path d="M16 36 C 22 40, 32 36, 40 40" />
      <circle cx="30" cy="36" r="2.4" fill="currentColor" />
      <circle cx="40" cy="34" r="1.8" fill="currentColor" />
    </svg>
  ),
  everything: (
    <svg viewBox="0 0 64 64" {...doodle}>
      {/* messy spoon dripping thecha */}
      <ellipse cx="32" cy="20" rx="13" ry="9" />
      <path d="M32 28 L 32 52" />
      {/* drips */}
      <path d="M22 30 C 21 36, 19 38, 19 42" />
      <path d="M42 30 C 43 35, 45 37, 45 41" />
      <circle cx="19" cy="46" r="1.8" fill="currentColor" />
      <circle cx="45" cy="45" r="1.6" fill="currentColor" />
      <circle cx="32" cy="56" r="2" fill="currentColor" />
    </svg>
  ),
};

const WAYS = [
  {
    title: "On Toast",
    description: "Spread it on toast, layer it with butter, cheese or eggs.",
    icon: Icons.toast,
  },
  {
    title: "With Dal-Chawal",
    description: "Stir a spoon into dal-chawal and suddenly your comfort meal has heat, garlic and flavour.",
    icon: Icons.dal,
  },
  {
    title: "With Parathas",
    description: "Tear, dip, repeat. Paratha and thecha is an iconic pairing.",
    icon: Icons.paratha,
  },
  {
    title: "With Eggs",
    description: "Scrambled, fried, omelette — anything goes. The breakfast game changer.",
    icon: Icons.eggs,
  },
  {
    title: "On Everything",
    description: "Pizza, Maggi, sandwiches, biryani, khichdi, leftovers. There are no rules. We don't judge.",
    icon: Icons.everything,
  },
  {
    title: "Straight Out the Jar",
    description: "Spoon. Jar. Done. We've all been there. No shame.",
    icon: Icons.rice,
  },
];

export default function HowToEat() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-28 bg-mom-black overflow-hidden cv-auto"
    >
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] pointer-events-none"
        style={{
          rotate,
          background:
            "radial-gradient(circle at center, rgba(255,154,30,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="text-center mb-10 md:mb-16">
          <ScrollReveal>
            <p className="text-[12px] uppercase tracking-[0.4em] text-mom-orange mb-4 font-semibold">
              How to Eat
            </p>
          </ScrollReveal>
          <WordReveal
            text="Put it on everything."
            tag="h2"
            className="text-5xl md:text-7xl lg:text-8xl font-quirk leading-[0.85] uppercase text-white"
          />
          <ScrollReveal delay={0.2}>
            <p className="text-base md:text-lg text-white/75 mt-6 max-w-2xl mx-auto leading-relaxed">
              Six ways to use thecha. There&apos;s no wrong answer — spread it,
              mix it, dip it, spoon it. If your food needs heat, thecha belongs
              there.
            </p>
          </ScrollReveal>
        </div>

        {/* Grid — 2x3 on mobile, 3x2 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {WAYS.map((way, i) => (
            <ScrollReveal key={way.title} delay={i * 0.07} distance={30}>
              <motion.div
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 md:p-8 hover:border-mom-orange/30 transition-all duration-500 group h-full flex flex-col"
                whileHover={{
                  y: -6,
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-b from-mom-orange/[0.06] to-transparent" />

                {/* Icon */}
                <div className="relative w-14 h-14 md:w-16 md:h-16 mb-5 text-mom-orange transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  {way.icon}
                </div>

                <h3 className="relative font-quirk text-lg md:text-xl tracking-wide uppercase text-white mb-2 leading-tight">
                  {way.title}
                </h3>
                <p className="relative text-sm md:text-base text-white/70 leading-relaxed">
                  {way.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
