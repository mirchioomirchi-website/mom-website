"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { ScrollReveal, WordReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const INGREDIENTS = SITE_CONTENT.ingredients.items;

export default function Ingredients() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowX = useTransform(scrollYProgress, [0, 1], [-200, 200]);

  return (
    <section
      id="ingredients"
      ref={sectionRef}
      className="relative pt-16 pb-10 md:py-28 bg-mom-black overflow-hidden cv-auto"
    >
      {/* Moving ambient glow */}
      <motion.div
        className="absolute top-1/3 w-[600px] h-[600px] rounded-full bg-mom-green/[0.06] blur-[150px] pointer-events-none"
        style={{ x: glowX }}
      />

      <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-16">
          <ScrollReveal>
            <p className="text-[12px] uppercase tracking-[0.4em] text-mom-green mb-4 font-semibold">
              {SITE_CONTENT.ingredients.eyebrow}
            </p>
          </ScrollReveal>
          <WordReveal
            text={SITE_CONTENT.ingredients.heading}
            tag="h2"
            className="text-5xl md:text-7xl lg:text-8xl font-quirk leading-[0.85] uppercase text-white"
          />
        </div>

        {/* Ingredient grid — large cards with prominent numbering */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {INGREDIENTS.map((ingredient, i) => (
            <ScrollReveal
              key={ingredient.name}
              delay={i * 0.06}
              direction={i % 3 === 0 ? "left" : i % 3 === 2 ? "right" : "up"}
              distance={40}
            >
              <motion.div
                className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] overflow-hidden group hover:border-white/[0.15] transition-all duration-500"
                whileHover={{
                  y: -8,
                  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${ingredient.color}20 0%, transparent 65%)`,
                  }}
                />

                {/* Image area with overlaid number */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <Image
                    src={ingredient.image}
                    alt={ingredient.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  {/* Gradient fade to dark at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mom-black/30 to-mom-black" />

                  {/* Big number */}
                  <div
                    className="absolute top-4 left-5 font-quirk text-5xl md:text-6xl leading-none tracking-tighter"
                    style={{
                      color: ingredient.color,
                      textShadow: `0 4px 24px ${ingredient.color}50`,
                    }}
                  >
                    {ingredient.n}
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-6 md:p-7">
                  <h3
                    className="font-quirk text-xl md:text-2xl uppercase tracking-wide mb-2 leading-tight"
                    style={{ color: ingredient.color }}
                  >
                    {ingredient.name}
                  </h3>
                  <p className="text-sm md:text-base text-white/75 leading-relaxed">
                    {ingredient.description}
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom statement */}
        <ScrollReveal delay={0.3}>
          <div className="text-center mt-10 md:mt-16">
            <p
              className="text-2xl md:text-3xl font-quirk text-white/40 uppercase [&_em]:not-italic"
              dangerouslySetInnerHTML={{ __html: SITE_CONTENT.ingredients.footerHtml }}
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
