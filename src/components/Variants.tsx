"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import Image from "next/image";
import { ScrollReveal, WordReveal } from "@/components/primitives";
import CharacterPeek from "@/components/CharacterPeek";

const VARIANTS = [
  {
    name: "Green Chilli",
    subtitle: "Thecha",
    tagline: "Fresh. Fiery. Unapologetic.",
    description:
      "Made with hand-pounded green chillies, fresh garlic, and a squeeze of lemon. The OG thecha — raw, bold, and dangerously addictive.",
    image: "/images/jar-green-final.webp",
    color: "#7BB55E",
    speech: "Classy. Sassy. Thodi bad-assy.",
  },
  {
    name: "Mixed Chilli",
    subtitle: "Thecha",
    tagline: "Warm. Complex. Irresistible.",
    description:
      "A harmony of green and red chillies with roasted spices. The one that plays nice — until it doesn't. Perfect for heat with depth.",
    image: "/images/jar-mixed-final.webp",
    color: "#FF9A1E",
    speech: "Mirchi lagi toh? IDGAFlying Chappal!",
  },
  {
    name: "Red Chilli",
    subtitle: "Thecha",
    tagline: "Smoky. Intense. No Mercy.",
    description:
      "Slow-roasted red chillies ground with garlic and oil. This one brings the smoke and the fire. Not for the faint-hearted.",
    image: "/images/jar-red-final.webp",
    color: "#E53935",
    speech: "Too hot to handle, baby.",
  },
];

function JarCard({ variant, index }: { variant: (typeof VARIANTS)[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Each jar has its own parallax float
  const jarY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);
  const jarRotate = useTransform(scrollYProgress, [0, 0.5, 1], [index === 1 ? 3 : -3, 0, index === 1 ? -2 : 2]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.5, 0]);

  return (
    <ScrollReveal
      delay={index * 0.15}
      direction={index === 0 ? "left" : index === 2 ? "right" : "up"}
      distance={60}
    >
      <motion.div
        ref={cardRef}
        className="relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500"
        whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      >
        {/* Card glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${variant.color}10 0%, transparent 70%)`,
          }}
        />

        <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
          <p className="text-[12px] uppercase tracking-[0.4em] text-white/40 mb-2">
            {variant.subtitle}
          </p>

          <h3
            className="text-2xl md:text-3xl font-quirk uppercase mb-1"
            style={{ color: variant.color }}
          >
            {variant.name}
          </h3>

          <p
            className="text-[12px] tracking-[0.2em] uppercase mb-8 opacity-50"
            style={{ color: variant.color }}
          >
            {variant.tagline}
          </p>

          {/* Jar with scroll-driven parallax float */}
          <motion.div
            className="relative w-44 h-44 md:w-56 md:h-56 mb-8"
            style={{ y: jarY, rotate: jarRotate }}
            whileHover={{
              scale: 1.12,
              rotate: [0, -4, 4, -2, 0],
              transition: { duration: 0.6 },
            }}
          >
            {/* Continuous gentle float */}
            <motion.div
              className="w-full h-full"
              animate={isInView ? {
                y: [0, -8, 0],
              } : {}}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src={variant.image}
                alt={`${variant.name} Thecha`}
                fill
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              />
            </motion.div>

            {/* Animated glow under jar */}
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-2xl"
              style={{
                background: variant.color,
                opacity: glowOpacity,
              }}
            />

            {/* Hover ring pulse */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: `0 0 60px 20px ${variant.color}`,
              }}
            />
          </motion.div>

          {/* Speech bubble on hover */}
          <motion.div
            className="absolute top-4 right-4 md:top-6 md:right-6 max-w-[140px] pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="px-3 py-2 rounded-xl text-[12px] font-quirk text-white leading-tight opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"
              style={{ background: `${variant.color}30`, border: `1px solid ${variant.color}40` }}
            >
              {variant.speech}
              <div
                className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45"
                style={{ background: `${variant.color}30` }}
              />
            </div>
          </motion.div>

          <p className="text-xs text-white/50 leading-[1.7] max-w-[280px]">
            {variant.description}
          </p>

          <div
            className="w-8 h-[1px] mt-6 opacity-20 group-hover:w-16 transition-all duration-700"
            style={{ background: variant.color }}
          />
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function Variants() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section
      id="flavours"
      ref={sectionRef}
      className="relative py-28 md:py-40 bg-mom-black overflow-hidden"
    >
      {/* Character peek — left side */}
      <CharacterPeek
        image="/images/character-1-nobg.webp"
        alt="MOM Character"
        side="left"
        speech="Pick wisely... or just get all three 😏"
        speechColor="#F5197F"
        revealAt={[0.2, 0.4]}
        size={200}
        offsetY="30%"
      />

      {/* Floating background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-mom-pink/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-mom-green/[0.03] blur-[100px]" />
      </motion.div>

      <div className="relative w-full max-w-[1400px] mx-auto px-8 md:px-12">
        {/* Section heading */}
        <div className="text-center mb-16 md:mb-24">
          <ScrollReveal>
            <p className="text-[12px] uppercase tracking-[0.5em] text-mom-pink/40 mb-4">
              Three Bold Flavours
            </p>
          </ScrollReveal>
          <WordReveal
            text="Pick Your Fighter."
            tag="h2"
            className="text-5xl md:text-7xl lg:text-8xl font-quirk leading-[0.85] uppercase"
          />
        </div>

        {/* Variant cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {VARIANTS.map((variant, i) => (
            <JarCard key={variant.name} variant={variant} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
