"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";

interface CharacterPeekProps {
  image: string;
  alt: string;
  side: "left" | "right";
  speech?: string;
  speechColor?: string;
  /** How far down the section the character appears (0-1) */
  revealAt?: [number, number];
  /** Size in px */
  size?: number;
  /** Vertical offset from center */
  offsetY?: string;
  className?: string;
}

export default function CharacterPeek({
  image,
  alt,
  side,
  speech,
  speechColor = "#F5197F",
  revealAt = [0.15, 0.45],
  size = 320,
  offsetY = "10%",
  className = "",
}: CharacterPeekProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Character slides in from off-screen
  const slideX = useTransform(
    scrollYProgress,
    [revealAt[0], revealAt[1], 0.75, 0.9],
    [side === "left" ? -120 : 120, 0, 0, side === "left" ? -120 : 120]
  );

  const opacity = useTransform(
    scrollYProgress,
    [revealAt[0], revealAt[0] + 0.05, 0.75, 0.85],
    [0, 1, 1, 0]
  );

  // Speech bubble pops in slightly after character
  const speechOpacity = useTransform(
    scrollYProgress,
    [revealAt[1] - 0.05, revealAt[1] + 0.05, 0.65, 0.75],
    [0, 1, 1, 0]
  );

  const speechScale = useTransform(
    scrollYProgress,
    [revealAt[1] - 0.05, revealAt[1] + 0.05],
    [0.7, 1]
  );

  return (
    <div
      ref={ref}
      className={`absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"} pointer-events-none z-10 hidden lg:block ${className}`}
    >
      <motion.div
        className="sticky flex flex-col items-center gap-3"
        style={{
          top: offsetY,
          x: slideX,
          opacity,
          [side === "left" ? "left" : "right"]: "-40px",
          position: "sticky",
        }}
      >
        {/* Speech bubble */}
        {speech && (
          <motion.div
            className="relative px-4 py-2.5 rounded-2xl max-w-[160px] text-center"
            style={{
              opacity: speechOpacity,
              scale: speechScale,
              background: `${speechColor}20`,
              border: `1px solid ${speechColor}35`,
            }}
          >
            <p className="text-[12px] text-white/80 leading-snug">
              {speech}
            </p>
            {/* Bubble tail */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `8px solid ${speechColor}20`,
              }}
            />
          </motion.div>
        )}

        {/* Character image */}
        <div className="relative" style={{ width: size, height: size * 1.4 }}>
          <Image
            src={image}
            alt={alt}
            fill
            className="object-contain object-bottom"
          />
        </div>
      </motion.div>
    </div>
  );
}
