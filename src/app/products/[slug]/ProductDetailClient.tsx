"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import InteractiveProductViewer from "@/components/InteractiveProductViewer";
import { AddToCartButton } from "@/components/primitives";
import { useCart } from "@/lib/cart-context";
import { Product, getRelatedProducts } from "@/lib/products";
import { trackSelectItem, trackViewItem } from "@/lib/analytics-events";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const related = getRelatedProducts(product.slug);

  useEffect(() => {
    trackViewItem(product);
  }, [product]);

  return (
    <SmoothScroll>
      <Navigation />
      <main>
        {/* PRODUCT HERO */}
        <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 bg-mom-black overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[80vw] h-[80vh] pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(${product.accentRgb},0.18) 0%, rgba(${product.accentRgb},0.04) 40%, transparent 70%)`,
            }}
          />

          {/* Breadcrumb */}
          <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 mb-8 md:mb-12">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
              <Link
                href="/"
                className="text-white/75 hover:text-white transition-colors"
              >
                Home
              </Link>
              <span className="text-white/30">/</span>
              <Link
                href="/shop"
                className="text-white/75 hover:text-white transition-colors"
              >
                Shop
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white">{product.shortName}</span>
            </div>
          </div>

          <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* IMAGE */}
            <div className="relative w-full aspect-square md:aspect-[3/4] flex items-center justify-center">
              {product.isCombo && product.comboItems ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 -translate-x-[20%] translate-y-[3%] rotate-[-12deg] scale-[0.78]">
                    <Image
                      src={product.comboItems[0]}
                      alt="Green jar"
                      fill
                      className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                      priority
                    />
                  </div>
                  <div className="absolute inset-0 translate-x-[20%] translate-y-[3%] rotate-[12deg] scale-[0.78]">
                    <Image
                      src={product.comboItems[2]}
                      alt="Red jar"
                      fill
                      className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                      priority
                    />
                  </div>
                  <div className="absolute inset-0">
                    <Image
                      src={product.comboItems[1]}
                      alt="Mixed jar"
                      fill
                      className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
                      priority
                    />
                  </div>
                </div>
              ) : (
                <InteractiveProductViewer
                  src={product.image}
                  videoSrc={`/videos/360/${product.slug}.mp4`}
                  alt={product.name}
                  accentRgb={product.accentRgb}
                />
              )}
            </div>

            {/* INFO */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              {/* Badge */}
              {product.badge && (
                <span
                  className="self-start mb-4 px-3 py-1.5 rounded-full text-[12px] uppercase tracking-[0.2em] font-quirk text-white"
                  style={{ background: product.color }}
                >
                  {product.badge}
                </span>
              )}

              <p
                className="text-xs md:text-sm uppercase tracking-[0.4em] mb-3 font-semibold"
                style={{ color: product.color }}
              >
                Thecha
              </p>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-quirk leading-[0.9] uppercase mb-4"
                style={{ color: product.color }}
              >
                {product.name}
              </h1>

              <p
                className="text-base md:text-xl font-quirk uppercase tracking-[0.1em] mb-5"
                style={{ color: `rgba(${product.accentRgb}, 0.85)` }}
              >
                {product.tagline}
              </p>

              <p className="text-base md:text-lg text-white/85 leading-relaxed mb-6 max-w-md">
                {product.longDescription}
              </p>

              {/* Spice level */}
              <div className="flex items-center gap-2 mb-7">
                <span className="text-xs uppercase tracking-[0.3em] text-white/75">
                  Heat
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="text-base"
                      style={{
                        opacity: i <= product.spiceLevel ? 1 : 0.2,
                        color: product.color,
                      }}
                    >
                      🌶
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-7">
                <span
                  className="text-4xl md:text-5xl font-quirk"
                  style={{ color: product.color }}
                >
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-white/40 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-xs uppercase tracking-[0.2em] text-white/75">
                  / {product.weight}
                </span>
              </div>

              {/* Quantity + Add to cart */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-full">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-12 text-white/70 hover:text-white transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-quirk text-base">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-12 text-white/70 hover:text-white transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <AddToCartButton
                  onClick={() => add(product.slug, qty)}
                  color={product.color}
                  size="lg"
                  label="Add to Cart"
                  priceSuffix={`₹${product.price * qty}`}
                  className="flex-1 px-6"
                />
              </div>

            </motion.div>
          </div>
        </section>

        {/* INGREDIENTS + PAIRINGS — two columns */}
        <section className="relative py-20 md:py-28 bg-mom-dark overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Ingredients */}
            <div>
              <p
                className="text-xs md:text-sm uppercase tracking-[0.4em] mb-4 font-semibold"
                style={{ color: product.color }}
              >
                {product.isCombo ? "What's in the pack" : "What's in the jar"}
              </p>
              <h2 className="text-3xl md:text-4xl font-quirk uppercase mb-7 text-white leading-tight">
                {product.isCombo ? (
                  <>
                    Three jars.
                    <br />
                    One pack.
                  </>
                ) : (
                  <>
                    Real ingredients.
                    <br />
                    Nothing fake.
                  </>
                )}
              </h2>
              <ul className="space-y-3">
                {product.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="flex items-start gap-3 pb-3 border-b border-white/[0.06] last:border-0"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ background: product.color }}
                    />
                    <span className="text-sm md:text-base text-white/85">
                      {ing}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pairings */}
            <div>
              <p
                className="text-xs md:text-sm uppercase tracking-[0.4em] mb-4 font-semibold"
                style={{ color: product.color }}
              >
                {product.isCombo ? "Best for" : "Best with"}
              </p>
              <h2 className="text-3xl md:text-4xl font-quirk uppercase mb-7 text-white leading-tight">
                {product.isCombo ? (
                  <>
                    Three flavours.
                    <br />
                    One gift.
                  </>
                ) : (
                  <>
                    Put it on
                    <br />
                    everything.
                  </>
                )}
              </h2>
              <ul className="space-y-3">
                {product.pairings.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 pb-3 border-b border-white/[0.06] last:border-0"
                  >
                    <span className="text-sm font-quirk text-white/40 mt-1">
                      →
                    </span>
                    <span className="text-sm md:text-base text-white/85">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* RELATED — only show if not combo */}
        {related.length > 0 && (
          <section className="relative py-20 md:py-28 bg-mom-black overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <div className="text-center mb-10 md:mb-14">
                <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-3 font-semibold">
                  Try the others
                </p>
                <h2 className="text-3xl md:text-5xl font-quirk uppercase text-white">
                  Or get all three.
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={() => trackSelectItem(p, "Related products", "related_products")}
                    className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 text-center"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 30%, ${p.color}10 0%, transparent 70%)`,
                      }}
                    />
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <h3
                      className="font-quirk text-sm md:text-base uppercase tracking-wide mb-1"
                      style={{ color: p.color }}
                    >
                      {p.shortName}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/75 mb-3">
                      {p.weight}
                    </p>
                    <p
                      className="text-base md:text-lg font-quirk"
                      style={{ color: p.color }}
                    >
                      ₹{p.price}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </SmoothScroll>
  );
}
