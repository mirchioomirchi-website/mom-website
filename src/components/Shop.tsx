"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal, WordReveal, AddToCartButton } from "@/components/primitives";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { SITE_CONTENT } from "@/lib/content";

export default function Shop() {
  const { add } = useCart();

  return (
    <section
      id="shop"
      className="relative py-16 md:py-28 bg-mom-dark overflow-hidden cv-auto"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-mom-pink/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="text-center mb-10 md:mb-16">
          <ScrollReveal>
            <p className="text-[12px] uppercase tracking-[0.4em] text-mom-pink mb-4 font-semibold">
              {SITE_CONTENT.shop.eyebrow}
            </p>
          </ScrollReveal>
          <WordReveal
            text={SITE_CONTENT.shop.heading}
            tag="h2"
            className="text-5xl md:text-7xl lg:text-8xl font-quirk leading-[0.85] uppercase text-white"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PRODUCTS.map((product, i) => (
            <ScrollReveal key={product.slug} delay={i * 0.1} distance={50}>
              <motion.div
                whileHover={{
                  y: -8,
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                }}
                className={`relative rounded-2xl border bg-white/[0.02] overflow-hidden group transition-all duration-500 hover:bg-white/[0.04] ${
                  product.isCombo
                    ? "border-mom-pink/20 hover:border-mom-pink/30"
                    : "border-white/[0.06] hover:border-white/[0.1]"
                }`}
              >
                {/* Badge */}
                {product.badge && (
                  <motion.div
                    className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-[12px] uppercase tracking-[0.1em] font-quirk text-white"
                    style={{ background: product.color }}
                    initial={{ scale: 0, rotate: -12 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.4 + i * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    {product.badge}
                  </motion.div>
                )}

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 30%, ${product.color}0A 0%, transparent 70%)`,
                  }}
                />

                <Link
                  href={`/products/${product.slug}`}
                  className="block relative p-6 md:p-8 flex flex-col items-center text-center"
                >
                  {/* Product image */}
                  <motion.div
                    className="relative w-32 h-32 md:w-44 md:h-44 mb-5"
                    whileHover={{ rotate: [0, -2, 2, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {product.isCombo ? (
                      <>
                        <div className="absolute inset-0 -translate-x-[28%] translate-y-[3%] rotate-[-10deg] scale-[0.78] transition-transform duration-700 group-hover:-translate-x-[34%] group-hover:rotate-[-14deg]">
                          <Image
                            src="/images/jar-green-final.webp"
                            alt="Green jar"
                            fill
                            sizes="(max-width: 768px) 35vw, 180px"
                            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                          />
                        </div>
                        <div className="absolute inset-0 translate-x-[28%] translate-y-[3%] rotate-[10deg] scale-[0.78] transition-transform duration-700 group-hover:translate-x-[34%] group-hover:rotate-[14deg]">
                          <Image
                            src="/images/jar-red-final.webp"
                            alt="Red jar"
                            fill
                            sizes="(max-width: 768px) 35vw, 180px"
                            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                          />
                        </div>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                          <Image
                            src="/images/jar-mixed-final.webp"
                            alt="Mixed jar"
                            fill
                            sizes="(max-width: 768px) 35vw, 180px"
                            className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                          />
                        </div>
                      </>
                    ) : (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 35vw, 180px"
                        className="object-contain group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-6 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                      style={{ background: product.color }}
                    />
                  </motion.div>

                  <h3 className="text-sm md:text-base font-quirk uppercase tracking-wide mb-0.5 group-hover:text-white transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[12px] text-white/55 tracking-[0.2em] uppercase mt-1 mb-4">
                    {product.weight}
                  </p>

                  <div className="flex items-baseline gap-2 mb-5">
                    <span
                      className="text-xl md:text-2xl font-quirk"
                      style={{ color: product.color }}
                    >
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[12px] text-white/40 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </Link>

                {/* CTA — outside the Link so it doesn't navigate */}
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  <AddToCartButton
                    onClick={() => add(product.slug)}
                    color={product.color}
                    size="md"
                    className="w-full"
                  />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-10 md:mt-14">
            {SITE_CONTENT.shop.trustSignals.map((signal) => (
              <span
                key={signal}
                className="text-[12px] uppercase tracking-[0.2em] text-white/55"
              >
                {signal}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
