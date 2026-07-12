"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AddToCartButton } from "@/components/primitives";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { trackSelectItem, trackViewItemList } from "@/lib/analytics-events";

const SHOP_LIST_ID = "shop_grid";
const SHOP_LIST_NAME = "Shop";

export default function ShopPageClient() {
  const { add } = useCart();

  useEffect(() => {
    trackViewItemList(PRODUCTS, SHOP_LIST_NAME, SHOP_LIST_ID);
  }, []);

  return (
    <SmoothScroll>
      <Navigation />
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-20 md:pb-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Heading */}
          <div className="mb-14 md:mb-20 text-center">
            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-4 font-semibold">
              Shop the Range
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-quirk uppercase leading-[0.9] text-white mb-6">
              Three flavours.
              <br />
              <span className="text-mom-pink">Pick your Mirchi.</span>
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Handcrafted in small batches. Six real ingredients. No fillers,
              no shortcuts, no compromises.
            </p>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {PRODUCTS.map((product, i) => (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative rounded-2xl border bg-white/[0.02] overflow-hidden group transition-all duration-500 hover:bg-white/[0.04] ${
                  product.isCombo
                    ? "border-mom-pink/25 hover:border-mom-pink/40"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                {product.badge && (
                  <span
                    className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-[12px] uppercase tracking-[0.15em] font-quirk text-white font-semibold"
                    style={{ background: product.color }}
                  >
                    {product.badge}
                  </span>
                )}

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 30%, ${product.color}10 0%, transparent 70%)`,
                  }}
                />

                <Link
                  href={`/products/${product.slug}`}
                  onClick={() => trackSelectItem(product, SHOP_LIST_NAME, SHOP_LIST_ID, i)}
                  className="block relative p-7 md:p-9 flex flex-col items-center text-center"
                >
                  <div className="relative w-36 h-36 md:w-48 md:h-48 mb-6">
                    {product.isCombo ? (
                      <>
                        <div className="absolute inset-0 -translate-x-[28%] translate-y-[3%] rotate-[-10deg] scale-[0.78] transition-transform duration-700 group-hover:-translate-x-[34%] group-hover:rotate-[-14deg]">
                          <Image
                            src="/images/jar-green-final.webp"
                            alt="Green jar"
                            fill
                            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                          />
                        </div>
                        <div className="absolute inset-0 translate-x-[28%] translate-y-[3%] rotate-[10deg] scale-[0.78] transition-transform duration-700 group-hover:translate-x-[34%] group-hover:rotate-[14deg]">
                          <Image
                            src="/images/jar-red-final.webp"
                            alt="Red jar"
                            fill
                            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                          />
                        </div>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                          <Image
                            src="/images/jar-mixed-final.webp"
                            alt="Mixed jar"
                            fill
                            className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                          />
                        </div>
                      </>
                    ) : (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                      />
                    )}
                  </div>

                  <h3
                    className="text-lg md:text-xl font-quirk uppercase tracking-wide mb-1.5 transition-colors"
                    style={{ color: product.color }}
                  >
                    {product.shortName}
                  </h3>
                  <p className="text-sm md:text-base text-white/70 mb-1 leading-relaxed">
                    {product.tagline}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55 mb-5 font-semibold">
                    {product.weight}
                  </p>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-2xl md:text-3xl font-quirk"
                      style={{ color: product.color }}
                    >
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-white/50 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="px-7 md:px-9 pb-7 md:pb-9 flex gap-2">
                  <AddToCartButton
                    onClick={() => add(product.slug)}
                    color={product.color}
                    className="flex-1"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-16 md:mt-24">
            {["Secure Checkout", "Handcrafted in Maharashtra"].map((signal) => (
              <span
                key={signal}
                className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/65 font-semibold"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
