"use client";

import Image from "next/image";
import { ScrollReveal, Eyebrow } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { getProduct } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

const { eyebrow, eyebrowSecondary, heading, body, ctaLabel } = SITE_CONTENT.shopPage.combo;
const { trustBadges } = SITE_CONTENT.shopPage;

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

// Real icon set supplied for this section — swapped in for the earlier
// hand-drawn placeholders.
const BADGE_ICON_SRC: Record<string, string> = {
  jar: "/images/shop/icons/jar.svg",
  chili: "/images/shop/icons/ingredients.svg",
  shipping: "/images/shop/icons/shipping.svg",
  badge: "/images/shop/icons/certified.svg",
};

export default function ShopCombo() {
  const { add } = useCart();
  const product = getProduct("combo-pack");
  if (!product) return null;

  return (
    <section className="relative bg-cream cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        <div className="dotted-divider text-green" />

        <div className="grid md:grid-cols-[3fr_2fr] gap-10 md:gap-16 md:items-stretch py-8 md:py-12">
          {/* Eyebrow + title + body grouped together at the top; price/CTA
              pinned to the bottom of the same column height (via
              justify-between), with its own inset padding so content
              doesn't touch the row's top/bottom edges. */}
          <div className="flex flex-col md:justify-between py-4 md:py-8">
            <ScrollReveal>
              <Eyebrow devanagari={eyebrow} english={eyebrowSecondary} color="red" className="mb-3" />
              <h2 className="text-h2 font-bold text-green max-w-lg mb-4">{heading}</h2>
              <p className="text-body text-dark/70 max-w-md">{body}</p>
            </ScrollReveal>

            <ScrollReveal delay={0.06}>
              <div className="flex items-center gap-5 mt-8 md:mt-0">
                <p className="flex items-baseline gap-2">
                  <span className="text-h4 font-bold text-green">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-body-sm text-dark/60 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => add(product.slug)}
                  className="text-btn font-bold inline-flex items-center gap-2 bg-green text-cream px-6 py-3.5 hover:bg-green/90 transition-colors cursor-pointer"
                >
                  {ctaLabel}
                  <CartIcon />
                </button>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1}>
            {/* aspect-[1000/1497] matches the source photo's own dimensions
                exactly, so object-contain never has to crop it — the full
                image is always visible regardless of column height. */}
            <div className="relative w-full aspect-[1000/1497]">
              <Image
                src="/images/shop/all-flavours.webp"
                alt="Green, Red and Mixed Chilli Thecha jars with fresh chillies"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </ScrollReveal>
        </div>

        <div className="dotted-divider text-green" />

        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-items-center md:justify-center gap-x-10 md:gap-x-16 gap-y-8 py-12 md:py-16">
          {trustBadges.map((item) => (
            <ScrollReveal key={item.label} className="flex flex-col items-center gap-3 text-dark">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image src={BADGE_ICON_SRC[item.icon]} alt="" fill className="object-contain" />
              </div>
              <span className="text-body-sm font-bold uppercase tracking-[0.08em]">
                {item.label}
              </span>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
