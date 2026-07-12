"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  onClick: () => void;
  color: string;
  className?: string;
  /** Optional label override. Defaults to "Add to Cart" */
  label?: string;
  /** Optional secondary label (e.g. price). Shown after the main label. */
  priceSuffix?: string;
  /** Pulse intensity multiplier (1 = default). */
  size?: "sm" | "md" | "lg";
}

export default function AddToCartButton({
  onClick,
  color,
  className = "",
  label = "Add to Cart",
  priceSuffix,
  size = "md",
}: Props) {
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    if (timerRef.current) clearTimeout(timerRef.current);
    setAdded(true);
    timerRef.current = setTimeout(() => setAdded(false), 1400);
  };

  const sizeClass =
    size === "sm"
      ? "py-2 text-[10px]"
      : size === "lg"
      ? "py-3.5 text-xs"
      : "py-3 text-[11px] md:text-xs";

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-full font-quirk uppercase tracking-[0.18em] text-white cursor-pointer hover:opacity-90 transition-opacity duration-300 hover:shadow-lg ${sizeClass} ${className}`}
      style={{ background: color }}
    >
      {/* Ripple pulse */}
      <AnimatePresence>
        {added && (
          <motion.span
            key="ripple"
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/35 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <motion.span
            key="added"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </svg>
            Added
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative block"
          >
            {label}
            {priceSuffix && <span className="opacity-90 ml-1">— {priceSuffix}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
