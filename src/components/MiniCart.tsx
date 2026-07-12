"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS } from "@/lib/products";

const DISCOUNT_THRESHOLD = 1000;
const DISCOUNT_PCT = 10;

export default function MiniCart() {
  const { miniOpen, miniProduct, closeMini, subtotal, itemCount } = useCart();

  // Auto-dismiss after 5s of being open (unless hovered — keep simple for now)
  useEffect(() => {
    if (!miniOpen) return;
    const t = setTimeout(() => closeMini(), 6000);
    return () => clearTimeout(t);
  }, [miniOpen, closeMini]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMini();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMini]);

  const remaining = Math.max(0, DISCOUNT_THRESHOLD - subtotal);
  const discountProgress = Math.min(1, subtotal / DISCOUNT_THRESHOLD);
  const discountUnlocked = subtotal >= DISCOUNT_THRESHOLD;

  return (
    <AnimatePresence>
      {miniOpen && miniProduct && (
        <motion.div
          key="minicart"
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-20 right-4 md:right-6 z-[150] w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] rounded-2xl overflow-hidden bg-mom-black/95 backdrop-blur-xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        >
          {/* Header strip with product color */}
          <div
            className="h-1 w-full"
            style={{ background: miniProduct.color }}
          />

          <div className="p-4 md:p-5">
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-mom-black"
                  style={{ background: miniProduct.color }}
                >
                  ✓
                </span>
                <p className="text-xs uppercase tracking-[0.3em] text-white font-semibold">
                  Added to cart
                </p>
              </div>
              <button
                onClick={closeMini}
                className="text-white/65 hover:text-white text-lg leading-none cursor-pointer transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Product preview */}
            <div className="flex gap-3 mb-4">
              <div className="relative w-16 h-16 shrink-0 rounded-lg bg-white/[0.04] overflow-hidden">
                <Image
                  src={miniProduct.image}
                  alt={miniProduct.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-quirk text-sm uppercase tracking-wide leading-tight truncate">
                  {miniProduct.name}
                </h4>
                <p className="text-xs text-white/75 tracking-[0.15em] uppercase mt-0.5">
                  {miniProduct.weight}
                </p>
                <p
                  className="text-base font-quirk mt-1"
                  style={{ color: miniProduct.color }}
                >
                  ₹{miniProduct.price}
                </p>
              </div>
            </div>

            {/* Discount-unlock progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] uppercase tracking-[0.2em] text-white/80">
                  {discountUnlocked
                    ? `🎉 ${DISCOUNT_PCT}% discount unlocked`
                    : `₹${remaining} away from ${DISCOUNT_PCT}% off`}
                </span>
                <span className="text-xs font-quirk text-white">
                  ₹{subtotal}
                </span>
              </div>
              <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${discountProgress * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background: discountUnlocked
                      ? "#7BB55E"
                      : `linear-gradient(90deg, ${miniProduct.color}, #F5197F)`,
                  }}
                />
              </div>
            </div>

            {/* Cart count */}
            <p className="text-xs uppercase tracking-[0.2em] text-white/75 mb-3">
              {itemCount} {itemCount === 1 ? "item" : "items"} in cart
            </p>

            {/* Buttons */}
            <div className="flex gap-2">
              <Link
                href="/cart"
                onClick={closeMini}
                className="flex-1 py-2.5 rounded-full bg-mom-pink text-white text-xs uppercase tracking-[0.15em] font-quirk text-center hover:bg-mom-pink/90 transition-colors"
              >
                View cart
              </Link>
              <button
                onClick={closeMini}
                className="flex-1 py-2.5 rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/30 text-xs uppercase tracking-[0.15em] font-quirk transition-all cursor-pointer"
              >
                Keep shopping
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper to compute total items (used elsewhere)
export function getCartTotal(lines: { slug: string; qty: number }[]) {
  return lines.reduce((sum, l) => {
    const p = PRODUCTS.find((p) => p.slug === l.slug);
    return sum + (p?.price ?? 0) * l.qty;
  }, 0);
}
