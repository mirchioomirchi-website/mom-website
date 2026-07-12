"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  once?: boolean;
}

const directionMap = {
  up: { y: 1, x: 0 },
  down: { y: -1, x: 0 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 40,
  duration = 0.8,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();

  const { x: xDir, y: yDir } = directionMap[direction];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduce) {
      // Reduced motion: snap visible. Intentional one-shot sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) io.disconnect();
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, reduce]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        x: xDir * distance,
        y: yDir * distance,
      }}
      animate={
        revealed
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: xDir * distance, y: yDir * distance }
      }
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
