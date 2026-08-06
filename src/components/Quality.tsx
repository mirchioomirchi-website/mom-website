"use client";

import { motion } from "motion/react";
import { ScrollReveal, WordReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const COMPARISON = SITE_CONTENT.quality.rows;

export default function Quality() {
  return (
    <section className="relative py-16 md:py-28 bg-mom-dark overflow-hidden cv-auto">
      {/* Background glow halves */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-[600px] bg-mom-green/[0.06] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[600px] bg-mom-red/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-20">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-16">
          <ScrollReveal>
            <p className="text-[12px] uppercase tracking-[0.4em] text-mom-pink mb-4 font-semibold">
              {SITE_CONTENT.quality.eyebrow}
            </p>
          </ScrollReveal>
          <WordReveal
            text={SITE_CONTENT.quality.heading}
            tag="h2"
            className="text-5xl md:text-7xl lg:text-8xl font-quirk leading-[0.85] uppercase text-white"
          />
          <ScrollReveal delay={0.2}>
            <p className="text-base md:text-lg text-white/75 mt-6 max-w-xl mx-auto leading-relaxed">
              {SITE_CONTENT.quality.subheading}
            </p>
          </ScrollReveal>
        </div>

        {/* Dueling cards — MOM (green, left) vs Others (red, right) */}
        <div className="relative">
          {/* VS badge floating between */}
          <div className="hidden md:flex absolute left-1/2 top-12 -translate-x-1/2 z-10 w-16 h-16 rounded-full bg-mom-black border border-white/10 items-center justify-center font-quirk text-mom-pink text-xl">
            VS
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {/* MOM CARD */}
            <ScrollReveal direction="left" distance={40}>
              <div className="relative rounded-3xl border-2 border-mom-green/30 bg-gradient-to-b from-mom-green/[0.08] to-transparent p-7 md:p-10">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-full bg-mom-green flex items-center justify-center text-mom-black text-lg">
                    ✓
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.3em] text-mom-green font-semibold">
                      The Real Stuff
                    </p>
                    <h3 className="font-quirk text-3xl md:text-4xl uppercase text-mom-green leading-none mt-1">
                      MOM
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3.5">
                  {COMPARISON.map((row, i) => (
                    <motion.li
                      key={row.feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.45,
                        delay: 0.1 + i * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-start gap-3 pb-3 border-b border-white/[0.05] last:border-0"
                    >
                      <span className="text-mom-green text-lg leading-none mt-1">✓</span>
                      <div className="flex-1">
                        <p className="text-[12px] uppercase tracking-[0.25em] text-white/50 mb-0.5">
                          {row.feature}
                        </p>
                        <p className="text-sm md:text-base text-white font-medium">
                          {row.mom}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* OTHERS CARD */}
            <ScrollReveal direction="right" distance={40} delay={0.15}>
              <div className="relative rounded-3xl border-2 border-mom-red/20 bg-gradient-to-b from-mom-red/[0.05] to-transparent p-7 md:p-10 opacity-90">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-full bg-mom-red/80 flex items-center justify-center text-white text-lg">
                    ✕
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.3em] text-mom-red/80 font-semibold">
                      The Lab Stuff
                    </p>
                    <h3 className="font-quirk text-3xl md:text-4xl uppercase text-mom-red/90 leading-none mt-1">
                      Others
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3.5">
                  {COMPARISON.map((row, i) => (
                    <motion.li
                      key={row.feature}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.45,
                        delay: 0.2 + i * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-start gap-3 pb-3 border-b border-white/[0.05] last:border-0"
                    >
                      <span className="text-mom-red/70 text-lg leading-none mt-1">✕</span>
                      <div className="flex-1">
                        <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 mb-0.5">
                          {row.feature}
                        </p>
                        <p className="text-sm md:text-base text-white/55 line-through decoration-mom-red/30">
                          {row.others}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>

      </div>
    </section>
  );
}
