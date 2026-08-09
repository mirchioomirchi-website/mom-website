"use client";

import Image from "next/image";
import { motion } from "motion/react";
import CharacterIllustration from "@/components/CharacterIllustration";
import { SITE_CONTENT } from "@/lib/content";

export default function Hero() {
  const [line1, line2] = SITE_CONTENT.hero.taglineLines;

  return (
    <section className="relative bg-cream overflow-hidden min-h-[90vh] md:min-h-screen flex flex-col">
      <div className="flex-1 flex items-center w-full max-w-[1400px] mx-auto px-5 md:px-9 pt-16 md:pt-36 pb-8 md:pb-10">
        {/* ───────────────────── MOBILE (< md) ───────────────────── */}
        <div className="md:hidden flex flex-col items-center text-center w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-quirk font-bold text-red text-[0.95rem] tracking-[0.01em] mb-9"
          >
            {SITE_CONTENT.hero.eyebrow}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[88%] max-w-[380px] mx-auto"
          >
            <Image
              src="/home hero name - mobile.svg"
              alt={SITE_CONTENT.hero.wordmarkAlt}
              width={330}
              height={332}
              priority
              className="w-full h-auto select-none pointer-events-none"
            />

            {/* Character — centered over the wordmark stack */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: "62%" }}
            >
              <CharacterIllustration />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-body text-dark/90 mt-10 max-w-[300px]"
          >
            <span className="block">{line1}</span>
            <span className="block">{line2}</span>
          </motion.p>
        </div>

        {/* ───────────────────── DESKTOP (md+) ───────────────────── */}
        <div className="hidden md:block w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <Image
              src="/home hero name.svg"
              alt={SITE_CONTENT.hero.wordmarkAlt}
              width={1296}
              height={274}
              priority
              className="w-full h-auto select-none pointer-events-none"
            />

            {/* Character — overlaps the "O", extends above/below the wordmark row */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: "-60%", width: "27%" }}
            >
              <CharacterIllustration />
            </div>

            {/* Tagline — right side, level with the badge/lower half of the row */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 text-right text-body leading-snug text-dark/90 max-w-[320px]"
              style={{ top: "68%" }}
            >
              <span className="block">{line1}</span>
              <span className="block">{line2}</span>
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — pinned to the bottom of the viewport */}
      <motion.button
        type="button"
        aria-label="Scroll down"
        onClick={() =>
          window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" })
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer group"
      >
        <motion.svg
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red/70 group-hover:text-red transition-colors"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>
    </section>
  );
}
