"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import Image from "next/image";
import { ScrollReveal, WordReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

function AnimatedCounter({ value, color }: { value: string; color: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.span
      ref={ref}
      className={`block text-5xl md:text-6xl lg:text-7xl font-quirk leading-none ${color}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {value}
    </motion.span>
  );
}

export default function Story() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.05, 1]);

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative py-16 md:py-28 bg-mom-dark overflow-hidden cv-auto"
    >
      <div className="w-full max-w-[1400px] mx-auto px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left: Text */}
          <div>
            <ScrollReveal>
              <p className="text-[12px] uppercase tracking-[0.4em] text-mom-pink mb-5 font-semibold">
                {SITE_CONTENT.story.eyebrow}
              </p>
            </ScrollReveal>

            <WordReveal
              text={SITE_CONTENT.story.heading}
              tag="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-quirk leading-[0.9] uppercase mb-10 text-white"
            />

            {/* Stats row — placed directly under heading */}
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {SITE_CONTENT.story.stats.map((stat, i) => (
                <ScrollReveal key={stat.label} delay={0.4 + i * 0.1}>
                  <div>
                    <AnimatedCounter value={stat.value} color={stat.color} />
                    <p className="text-[12px] md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] text-white/65 mt-2 font-semibold leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right: Image with parallax */}
          <ScrollReveal direction="right" distance={80} delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <motion.div
                className="absolute inset-0"
                style={{ y: imageY, scale: imageScale }}
              >
                <Image
                  src="/images/story-fresh-chillies.webp"
                  alt="Freshly stone-ground green chilli thecha in a stone mortar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-mom-black/50 via-transparent to-mom-black/20" />

              {/* Badge */}
              <motion.div
                className="absolute bottom-5 left-5 right-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="bg-black/40 backdrop-blur-md border border-white/[0.06] rounded-xl p-4">
                  <p className="text-[12px] uppercase tracking-[0.3em] text-mom-pink/50 mb-1">
                    Made Fresh
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Stone-ground in small batches. Every jar, every time.
                  </p>
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
