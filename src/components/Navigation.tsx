"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart-context";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolledRef = useRef(false);
  const { scrollY } = useScroll();
  const { itemCount } = useCart();

  // Only flip state when we actually cross the threshold — avoids React
  // bailing-out-but-still-evaluating overhead on every Lenis scroll tick.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 80;
    if (next !== scrolledRef.current) {
      scrolledRef.current = next;
      setScrolled(next);
    }
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled
          ? "bg-mom-black/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between h-[72px]">
        {/* Logo only — no wordmark */}
        <Link
          href="/"
          className="cursor-pointer flex items-center group"
          aria-label="Mirchi O Mirchi — home"
        >
          <Image
            src="/images/mom-logo-white.webp"
            alt="Mirchi O Mirchi"
            width={1769}
            height={772}
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100px, 140px"
            className="h-7 md:h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Desktop right: Shop + Cart */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/shop"
            className="px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-white hover:text-mom-pink transition-colors duration-300 font-quirk cursor-pointer"
          >
            Shop
          </Link>

          <Link
            href="/cart"
            className="relative ml-1 w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors group cursor-pointer"
            aria-label="Cart"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white group-hover:text-mom-pink transition-colors"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-mom-pink flex items-center justify-center text-[12px] font-quirk text-white font-semibold"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <Link
            href="/shop"
            className="ml-1 px-6 py-3 bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk rounded-full hover:bg-mom-pink/90 hover:shadow-[0_0_20px_rgba(245,25,127,0.3)] transition-all cursor-pointer"
          >
            Buy Now
          </Link>
        </div>

        {/* Mobile right: cart + hamburger */}
        <div className="md:hidden flex items-center gap-1">
          <Link
            href="/cart"
            className="relative w-11 h-11 flex items-center justify-center"
            aria-label="Cart"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-mom-pink flex items-center justify-center text-[12px] font-quirk text-white font-semibold"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 p-2 cursor-pointer"
            aria-label="Menu"
          >
            <span
              className={`w-5 h-[1.5px] bg-white transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`w-5 h-[1.5px] bg-white transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-5 h-[1.5px] bg-white transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu — minimal: Shop + Cart only */}
      <motion.div
        initial={false}
        animate={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden fixed inset-0 top-[72px] bg-mom-black/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-7 px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            delay: menuOpen ? 0.05 : 0,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full max-w-xs"
        >
          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            className="block w-full px-8 py-5 bg-mom-pink text-white text-base uppercase tracking-[0.2em] font-quirk rounded-full text-center hover:bg-mom-pink/90 transition-colors"
          >
            Shop
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            delay: menuOpen ? 0.12 : 0,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full max-w-xs"
        >
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-3 w-full px-8 py-5 border border-white/15 text-white text-base uppercase tracking-[0.2em] font-quirk rounded-full hover:border-mom-pink hover:text-mom-pink transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Cart{itemCount > 0 ? ` · ${itemCount}` : ""}
          </Link>
        </motion.div>
      </motion.div>
    </nav>
  );
}
