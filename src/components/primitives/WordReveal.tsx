"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface WordRevealProps {
  text: string;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function WordReveal({
  text,
  className = "",
  tag: Tag = "h2",
}: WordRevealProps) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 35%"],
  });

  const words = text.split(" ");

  return (
    <Tag ref={containerRef} className={className} style={{ position: "relative" }}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return <Word key={`${word}-${i}`} word={word} range={[start, end]} progress={scrollYProgress} />;
      })}
    </Tag>
  );
}

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}
