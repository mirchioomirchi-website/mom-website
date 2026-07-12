"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { getProduct } from "@/lib/products";
import {
  CART_DISCOUNT_PCT,
  CART_DISCOUNT_THRESHOLD,
  SHIPPING_FLAT_RATE,
  SHIPPING_FREE_THRESHOLD,
} from "@/lib/products";
import { trackViewCart } from "@/lib/analytics-events";

const DISCOUNT_THRESHOLD = CART_DISCOUNT_THRESHOLD;
const DISCOUNT_PCT = CART_DISCOUNT_PCT;

export default function CartPageClient() {
  const { lines, subtotal, itemCount, setQty, remove, add, goToCheckout } = useCart();

  useEffect(() => {
    if (lines.length > 0) trackViewCart(lines);
    // Fire only on mount — re-running on every cart edit would double-count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============= UPSELL LOGIC =============
  const upsells = useMemo(() => {
    const inCart = new Set(lines.map((l) => l.slug));
    const result: Array<{
      reason: string;
      product: ReturnType<typeof getProduct>;
      savings?: number;
    }> = [];

    // Logic 1: If cart has any individual jars but NOT the combo, show combo upsell
    const individualSlugs = ["green-chilli-thecha", "mixed-chilli-thecha", "red-chilli-thecha"];
    const individualsInCart = individualSlugs.filter((s) => inCart.has(s));
    const combo = getProduct("combo-pack");

    if (combo && !inCart.has("combo-pack") && individualsInCart.length >= 1) {
      // If they have individuals, suggest combo
      const wouldSave = combo.originalPrice ? combo.originalPrice - combo.price : 98;
      result.push({
        reason:
          individualsInCart.length === 3
            ? "You'd save ₹98 with the Combo Pack"
            : "Get all 3 flavours for less",
        product: combo,
        savings: wouldSave,
      });
    }

    // Logic 2: Suggest missing individual flavours (if no combo + missing flavours)
    if (!inCart.has("combo-pack")) {
      individualSlugs.forEach((slug) => {
        if (!inCart.has(slug)) {
          const p = getProduct(slug);
          if (p) {
            result.push({
              reason:
                slug === "green-chilli-thecha"
                  ? "Sharp + bright. Best with bhakri."
                  : slug === "red-chilli-thecha"
                  ? "Smoky + slow burn. Try it with dosa."
                  : "Two heats in one. Try the middle path.",
              product: p,
            });
          }
        }
      });
    }

    // Cap to 3 suggestions
    return result.slice(0, 3);
  }, [lines]);

  const discountProgress = Math.min(1, subtotal / DISCOUNT_THRESHOLD);
  const discountUnlocked = subtotal >= DISCOUNT_THRESHOLD;
  const discount = discountUnlocked ? Math.round(subtotal * (DISCOUNT_PCT / 100)) : 0;
  const itemsTotal = subtotal - discount;
  const shippingFree = itemsTotal >= SHIPPING_FREE_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_FLAT_RATE;
  const total = itemsTotal + shipping;

  return (
    <SmoothScroll>
      <Navigation />
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-20 md:pb-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Heading */}
          <div className="mb-10 md:mb-14">
            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-3 font-semibold">
              Your bag
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-quirk uppercase leading-[0.9] text-white">
              {itemCount > 0 ? "Almost there." : "Your cart is empty."}
            </h1>
            {itemCount > 0 && (
              <p className="text-sm md:text-base text-white/85 mt-3">
                {itemCount} {itemCount === 1 ? "jar" : "jars"} · Review before
                checkout.
              </p>
            )}
          </div>

          {itemCount === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
              {/* LEFT — line items + upsells */}
              <div>
                {/* Discount-unlock bar */}
                <div className="mb-6 p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-xs uppercase tracking-[0.2em] text-white">
                      {discountUnlocked
                        ? `🎉 ${DISCOUNT_PCT}% discount unlocked`
                        : `Shop over ₹${DISCOUNT_THRESHOLD} to get a ${DISCOUNT_PCT}% discount`}
                    </span>
                    <span className="text-xs font-quirk text-white">
                      ₹{subtotal} / ₹{DISCOUNT_THRESHOLD}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: `${discountProgress * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background: discountUnlocked
                          ? "#7BB55E"
                          : "linear-gradient(90deg, #FF9A1E, #F5197F)",
                      }}
                    />
                  </div>
                </div>

                {/* Line items */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {lines.map((line) => {
                      const product = getProduct(line.slug);
                      if (!product) return null;
                      return (
                        <motion.div
                          key={line.slug}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 md:p-5"
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <Link
                              href={`/products/${product.slug}`}
                              className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl bg-white/[0.04] overflow-hidden"
                            >
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain p-1.5"
                              />
                            </Link>

                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="font-quirk text-sm md:text-base uppercase tracking-wide hover:text-white"
                                  style={{ color: product.color }}
                                >
                                  {product.name}
                                </Link>
                                <button
                                  onClick={() => remove(line.slug)}
                                  className="text-white/65 hover:text-white text-base leading-none cursor-pointer transition-colors"
                                  aria-label="Remove"
                                >
                                  ×
                                </button>
                              </div>
                              <p className="text-xs uppercase tracking-[0.2em] text-white/75 mb-3">
                                {product.weight}
                              </p>

                              <div className="flex items-center justify-between mt-auto">
                                {/* Qty */}
                                <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-full">
                                  <button
                                    onClick={() => setQty(line.slug, line.qty - 1)}
                                    className="w-8 h-9 text-white/85 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Decrease"
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center font-quirk text-sm">
                                    {line.qty}
                                  </span>
                                  <button
                                    onClick={() => setQty(line.slug, line.qty + 1)}
                                    className="w-8 h-9 text-white/85 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Increase"
                                  >
                                    +
                                  </button>
                                </div>
                                <span
                                  className="text-base md:text-lg font-quirk"
                                  style={{ color: product.color }}
                                >
                                  ₹{product.price * line.qty}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* UPSELLS */}
                {upsells.length > 0 && (
                  <div className="mt-10 md:mt-14">
                    <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-3 font-semibold">
                      You might also like
                    </p>
                    <h3 className="text-2xl md:text-3xl font-quirk uppercase mb-5 text-white">
                      Complete your order.
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {upsells.map((u) => {
                        const p = u.product;
                        if (!p) return null;
                        return (
                          <div
                            key={p.slug}
                            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all duration-500 group flex flex-col"
                          >
                            <div className="flex gap-3 mb-3">
                              <div className="relative w-14 h-14 shrink-0 rounded-lg bg-white/[0.04] overflow-hidden">
                                <Image
                                  src={p.image}
                                  alt={p.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="font-quirk text-xs uppercase tracking-wide truncate"
                                  style={{ color: p.color }}
                                >
                                  {p.shortName}
                                </h4>
                                <p
                                  className="text-base font-quirk mt-0.5"
                                  style={{ color: p.color }}
                                >
                                  ₹{p.price}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs md:text-sm text-white/85 leading-relaxed mb-3 flex-1">
                              {u.reason}
                            </p>
                            {u.savings && (
                              <p className="text-xs uppercase tracking-[0.2em] text-mom-green mb-3">
                                Save ₹{u.savings}
                              </p>
                            )}
                            <button
                              onClick={() => add(p.slug, 1)}
                              className="w-full py-2 rounded-full text-xs uppercase tracking-[0.15em] font-quirk text-white border transition-all cursor-pointer hover:opacity-90"
                              style={{
                                background: `rgba(${p.accentRgb}, 0.15)`,
                                borderColor: `rgba(${p.accentRgb}, 0.4)`,
                                color: p.color,
                              }}
                            >
                              + Add to cart
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — order summary */}
              <div className="lg:sticky lg:top-28 self-start">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:p-6">
                  <h3 className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/75 mb-5">
                    Order summary
                  </h3>
                  <div className="space-y-2.5 pb-4 border-b border-white/[0.08]">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/85">Subtotal</span>
                      <span className="text-white font-quirk">₹{subtotal}</span>
                    </div>
                    {discountUnlocked && (
                      <div className="flex justify-between text-sm">
                        <span className="text-mom-green">{DISCOUNT_PCT}% discount</span>
                        <span className="font-quirk text-mom-green">
                          −₹{discount}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-white/85">Shipping</span>
                      <span
                        className={`font-quirk ${
                          shippingFree ? "text-mom-green" : "text-white"
                        }`}
                      >
                        {shippingFree ? "Free" : `₹${shipping}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 mb-5">
                    <span className="text-base font-quirk uppercase tracking-wide text-white">
                      Total
                    </span>
                    <span className="text-2xl font-quirk text-mom-pink">
                      ₹{total}
                    </span>
                  </div>

                  <button
                    onClick={goToCheckout}
                    className="w-full py-4 rounded-full bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk hover:bg-mom-pink/90 transition-colors cursor-pointer hover:shadow-[0_0_30px_rgba(245,25,127,0.4)]"
                  >
                    Checkout — ₹{total}
                  </button>

                  <p className="text-xs uppercase tracking-[0.2em] text-white/70 text-center mt-4">
                    Secure checkout
                  </p>

                  {/* Pan-India shipping note */}
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] leading-relaxed text-white/70">
                    <p>
                      Ships pan-India in 3–7 business days. ₹{SHIPPING_FLAT_RATE} flat shipping, free over ₹{SHIPPING_FREE_THRESHOLD}.
                    </p>
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="block text-center mt-4 text-xs md:text-sm uppercase tracking-[0.25em] text-white/75 hover:text-white transition-colors"
                >
                  ← Continue shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16 md:py-24">
      <p className="text-base md:text-lg text-white/85 mb-8 max-w-md mx-auto">
        Looks like you haven&apos;t picked your heat yet. Three flavours,
        zero filler — go grab one.
      </p>
      <Link
        href="/shop"
        className="inline-block px-8 py-4 rounded-full bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk hover:bg-mom-pink/90 transition-colors"
      >
        Shop the heat
      </Link>
    </div>
  );
}
