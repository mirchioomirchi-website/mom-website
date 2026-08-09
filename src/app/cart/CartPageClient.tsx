"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { getProduct, PRODUCT_CARD_IMAGES, PDP_ACCENT_COLOR } from "@/lib/products";
import {
  computeCartTotal,
  computeShipping,
  CART_DISCOUNT_PCT,
  CART_DISCOUNT_THRESHOLD,
  SHIPPING_FLAT_RATE,
  SHIPPING_FREE_THRESHOLD,
} from "@/lib/discounts";
import { trackViewCart } from "@/lib/analytics-events";

export default function CartPageClient() {
  const { lines, itemCount, setQty, remove, add, goToCheckout } = useCart();

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

    return result.slice(0, 3);
  }, [lines]);

  // Computed through the same shared functions the server re-runs
  // authoritatively at checkout (discounts.ts) — this page used to
  // re-implement the discount/shipping formula inline, which meant it could
  // silently drift from the real rules if that logic ever changed here.
  const cartTotal = useMemo(() => computeCartTotal(lines), [lines]);
  const subtotal = cartTotal.subtotal;
  const discountProgress = Math.min(1, subtotal / CART_DISCOUNT_THRESHOLD);
  const discountUnlocked = cartTotal.discount > 0;
  const discount = cartTotal.discount;
  const itemsTotal = cartTotal.total;
  const shippingInfo = useMemo(
    () => computeShipping({ itemsSubtotal: subtotal }),
    [subtotal]
  );
  const shippingFree = shippingInfo.isFree;
  const shipping = shippingInfo.price;
  const total = itemsTotal + shipping;

  if (itemCount === 0) {
    return (
      <SmoothScroll>
        <Navigation />
        <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
          <div className="max-w-2xl mx-auto px-5 md:px-9 text-center">
            <h1 className="text-h1 text-red mb-4">Your cart is empty.</h1>
            <p className="text-body text-dark/70 mb-8">
              Looks like you haven&apos;t picked your heat yet. Three flavours,
              zero filler — go grab one.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center text-btn font-bold bg-green text-cream px-8 py-4 hover:bg-green/90 transition-colors"
            >
              Shop the heat
            </Link>
          </div>
        </main>
        <Footer />
      </SmoothScroll>
    );
  }

  return (
    <SmoothScroll>
      <Navigation />
      <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
        <div className="max-w-[1400px] mx-auto px-5 md:px-9">
          <div className="mb-10 md:mb-14">
            <h1 className="text-h1 text-red mb-2">Your bag</h1>
            <p className="text-body text-dark/70">
              {itemCount} {itemCount === 1 ? "jar" : "jars"} · Review before checkout.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-12 items-start">
            {/* LEFT — line items + upsells */}
            <div>
              {/* Discount-unlock bar */}
              <div className="bg-cream-dark p-5 md:p-6 mb-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-body-sm font-bold text-dark">
                    {discountUnlocked
                      ? `${CART_DISCOUNT_PCT}% discount unlocked`
                      : `Shop over ₹${CART_DISCOUNT_THRESHOLD} to get ${CART_DISCOUNT_PCT}% off`}
                  </span>
                  <span className="text-body-sm text-dark/60 shrink-0">
                    ₹{subtotal} / ₹{CART_DISCOUNT_THRESHOLD}
                  </span>
                </div>
                <div className="h-1.5 bg-cream overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: `${discountProgress * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-green"
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-4">
                <AnimatePresence>
                  {lines.map((line) => {
                    const product = getProduct(line.slug);
                    if (!product) return null;
                    return (
                      <motion.div
                        key={line.slug}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-cream-dark p-5 md:p-6"
                      >
                        <div className="flex gap-4">
                          <Link
                            href={`/products/${product.slug}`}
                            className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 bg-cream overflow-hidden"
                          >
                            <Image
                              src={PRODUCT_CARD_IMAGES[product.slug] ?? product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                            />
                          </Link>

                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <Link
                                href={`/products/${product.slug}`}
                                className="text-body font-bold hover:opacity-80 transition-opacity"
                                style={{ color: PDP_ACCENT_COLOR[product.flavor] }}
                              >
                                {product.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() => remove(line.slug)}
                                className="text-body-sm text-dark/60 hover:text-red transition-colors shrink-0 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-body-sm text-dark/60 mb-4">{product.weight}</p>

                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => setQty(line.slug, line.qty - 1)}
                                  aria-label="Decrease quantity"
                                  className="w-7 h-7 flex items-center justify-center border border-dark/20 text-dark hover:border-red hover:text-red transition-colors cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="w-5 text-center text-body font-bold text-dark">
                                  {line.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQty(line.slug, line.qty + 1)}
                                  aria-label="Increase quantity"
                                  className="w-7 h-7 flex items-center justify-center border border-dark/20 text-dark hover:border-red hover:text-red transition-colors cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-body font-bold text-dark">
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

              {/* Upsells */}
              {upsells.length > 0 && (
                <div className="mt-12 md:mt-16">
                  <h2 className="text-h4 font-bold text-green mb-6">Complete your order</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upsells.map((u) => {
                      const p = u.product;
                      if (!p) return null;
                      return (
                        <div key={p.slug} className="bg-cream-dark p-5 flex flex-col">
                          <div className="flex gap-3 mb-3">
                            <div className="relative w-14 h-14 shrink-0 bg-cream overflow-hidden">
                              <Image
                                src={PRODUCT_CARD_IMAGES[p.slug] ?? p.image}
                                alt={p.name}
                                fill
                                className="object-contain p-1.5"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-body-sm font-bold truncate"
                                style={{ color: PDP_ACCENT_COLOR[p.flavor] }}
                              >
                                {p.name}
                              </h3>
                              <p className="text-body font-bold text-dark mt-0.5">₹{p.price}</p>
                            </div>
                          </div>
                          <p className="text-body-sm text-dark/70 mb-3 flex-1">{u.reason}</p>
                          {u.savings && (
                            <p className="text-body-sm font-bold text-green mb-3">
                              Save ₹{u.savings}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => add(p.slug, 1)}
                            className="w-full text-btn font-bold bg-green text-cream py-2.5 hover:bg-green/90 transition-colors cursor-pointer"
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
            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-cream-dark p-6 md:p-7">
                <h3 className="text-tag font-bold text-dark uppercase tracking-[0.06em] mb-5">
                  Order summary
                </h3>
                <div className="space-y-2 mb-5">
                  <Row label="Subtotal" value={`₹${subtotal}`} />
                  {discountUnlocked && (
                    <Row
                      label={`${CART_DISCOUNT_PCT}% discount`}
                      value={`−₹${discount}`}
                      accent
                    />
                  )}
                  <Row
                    label="Shipping"
                    value={shippingFree ? "Free" : `₹${shipping}`}
                    accent={shippingFree}
                  />
                </div>
                <div className="dotted-divider text-dark/15 mb-4" />
                <div className="flex justify-between items-baseline">
                  <span className="text-body font-bold text-dark">Total</span>
                  <span className="text-h4 font-bold text-red">₹{total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                className="w-full text-btn font-bold bg-green text-cream py-4 hover:bg-green/90 transition-colors cursor-pointer mt-5"
              >
                Checkout — ₹{total}
              </button>

              <p className="text-body-sm text-dark/60 mt-4">
                Ships within Mumbai in 1–2 business days. ₹{SHIPPING_FLAT_RATE} flat shipping,
                free over ₹{SHIPPING_FREE_THRESHOLD}.
              </p>

              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 text-btn text-dark/70 hover:text-red transition-colors mt-5"
              >
                <span aria-hidden="true">←</span> Continue shopping
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-body-sm">
      <span className="text-dark/70">{label}</span>
      <span className={`font-bold ${accent ? "text-green" : "text-dark"}`}>{value}</span>
    </div>
  );
}
