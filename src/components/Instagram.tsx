"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { SITE_CONTENT } from "@/lib/content";

const { handle, heading, href, images } = SITE_CONTENT.instagram;

type Rect = { left: number; top: number; width: number; height: number; speed: number };

// Scattered polaroid rects — % of the section's own box — measured against
// the desktop and mobile design references. Order matches SITE_CONTENT
// .instagram.images: top-left, top-right, bottom-left, bottom-right.
const DESKTOP_LAYOUT: Rect[] = [
  { left: 4.9, top: 5.7, width: 19.8, height: 46.7, speed: 36 },
  { left: 69.6, top: 10.5, width: 11.4, height: 24.2, speed: 55 },
  { left: 9.4, top: 67.7, width: 10.8, height: 24.5, speed: 20 },
  { left: 75.6, top: 40, width: 19.6, height: 54, speed: 44 },
];

const MOBILE_LAYOUT: Rect[] = [
  { left: 6, top: 5, width: 37, height: 26, speed: 24 },
  { left: 62, top: 11, width: 32, height: 21, speed: 36 },
  { left: 9, top: 54, width: 29, height: 19, speed: 14 },
  { left: 51, top: 56, width: 40, height: 28, speed: 28 },
];

function ParallaxPhoto({
  src,
  alt,
  rect,
  progress,
}: {
  src: string;
  alt: string;
  rect: Rect;
  progress: MotionValue<number>;
}) {
  // All photos travel upward as the user scrolls down — just at different
  // paces (different speed magnitudes) so they drift apart from each other.
  const y = useTransform(progress, [0, 1], [rect.speed, -rect.speed]);

  return (
    <motion.div
      className="absolute overflow-hidden"
      style={{
        left: `${rect.left}%`,
        top: `${rect.top}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        y,
      }}
    >
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 40vw, 20vw" className="object-cover" />
    </motion.div>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Instagram({
  variant = "red",
}: {
  variant?: "red" | "yellow";
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const isYellow = variant === "yellow";

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden cv-auto ${isYellow ? "bg-yellow" : "bg-red"}`}
    >
      <div className="relative w-full h-screen max-w-[1400px] mx-auto px-5 md:px-9">
        {/* Desktop scatter */}
        <div className="hidden md:block absolute inset-0">
          {images.map((img, i) => (
            <ParallaxPhoto
              key={img.src}
              src={img.src}
              alt={img.alt}
              rect={DESKTOP_LAYOUT[i]}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Mobile scatter */}
        <div className="md:hidden absolute inset-0">
          {images.map((img, i) => (
            <ParallaxPhoto
              key={img.src}
              src={img.src}
              alt={img.alt}
              rect={MOBILE_LAYOUT[i]}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Center copy */}
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none ${
            isYellow ? "text-red" : "text-cream"
          }`}
        >
          <p
            className={`text-tag tracking-[0.15em] uppercase mb-3 ${
              isYellow ? "text-red" : "text-cream"
            }`}
          >
            {handle}
          </p>
          <h2 className={`text-h1 mb-6 ${isYellow ? "text-red" : "text-cream"}`}>
            {heading}
          </h2>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mirchi O Mirchi on Instagram"
            className={`pointer-events-auto w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isYellow
                ? "text-red hover:bg-red hover:text-yellow"
                : "text-cream hover:bg-cream hover:text-red"
            }`}
          >
            <InstagramIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
