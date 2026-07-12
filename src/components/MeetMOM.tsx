"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { SITE_CONTENT } from "@/lib/content";

// Visual layout (heights, rotations) stays in code — only copy/images come
// from content config so non-developers can edit names/traits without
// breaking the layout.
const LAYOUT = [
  { height: "h-72 md:h-96", rotation: -5 },
  { height: "h-80 md:h-[28rem]", rotation: 0 },
  { height: "h-72 md:h-96", rotation: 5 },
];

const CHARACTERS = SITE_CONTENT.meetMOM.characters.map((c, i) => ({
  src: c.image,
  name: c.name,
  trait: c.trait,
  bg: c.bg, // hex string, applied via inline style (Tailwind can't JIT dynamic classes)
  height: LAYOUT[i].height,
  rotation: LAYOUT[i].rotation,
}));

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const characterVariants = {
  hidden: (rotation: number) => ({
    y: 80,
    opacity: 0,
    rotate: rotation,
    scale: 0.95,
  }),
  visible: {
    y: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function MeetMOM() {
  return (
    <section
      className="relative py-24 md:py-40 px-6 md:px-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0A0A0A 0%, #1a0a14 50%, #0A0A0A 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Text */}
        <motion.div
          className="text-center mb-16 md:mb-24 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-mom-pink/60 mb-6">
            {SITE_CONTENT.meetMOM.eyebrow}
          </p>
          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-quirk leading-[1] mb-8 [&_em]:not-italic"
            dangerouslySetInnerHTML={{ __html: SITE_CONTENT.meetMOM.headingHtml }}
          />
          <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto">
            {SITE_CONTENT.meetMOM.body}
          </p>
        </motion.div>

        {/* Three characters */}
        <motion.div
          className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
        >
          {CHARACTERS.map((char) => (
            <motion.div
              key={char.name}
              custom={char.rotation}
              variants={characterVariants}
              className="relative group text-center"
            >
              <div
                className={`relative ${char.height} w-48 md:w-64 rounded-3xl overflow-hidden mx-auto`}
                style={{ backgroundColor: char.bg }}
              >
                <Image
                  src={char.src}
                  alt={char.name}
                  fill
                  className="object-contain object-bottom group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-lg font-quirk mt-4 text-white/80">
                {char.name}
              </h3>
              <p className="text-xs text-white/35 tracking-wider italic">
                {char.trait}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
