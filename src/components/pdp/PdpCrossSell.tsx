"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { useCart } from "@/lib/cart-context";
import { PDP_ACCENT_COLOR, PRODUCT_CARD_IMAGES, type Product } from "@/lib/products";

// How long each product stays highlighted before auto-advancing.
const ROTATE_MS = 4500;

function ChiliIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 1.5C3.5 1.5 10.5 4.8 10.5 10C10.5 15.2 3.5 18.5 3.5 18.5C3.5 18.5 7.8 13.2 7.8 10C7.8 6.8 3.5 1.5 3.5 1.5Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={filled ? 0 : 1.2}
        opacity={filled ? 1 : 0.4}
      />
    </svg>
  );
}

// The active product — full details + direct Add to Cart, matching the
// "first highlighted card" treatment in the design.
function HighlightedCard({ product }: { product: Product }) {
  const { add } = useCart();
  const accentColor = product.pdpAccentColor ?? PDP_ACCENT_COLOR[product.flavor];
  return (
    <div
      className="relative md:h-[380px] flex items-center justify-center gap-8 md:gap-12 rounded-lg overflow-hidden p-6 md:p-8 transition-transform duration-300 hover:scale-[1.01]"
      style={{ background: accentColor }}
    >
      {/* Full-card link, sitting under the Add to Cart button (same
          hotspot-overlay pattern used on the homepage Shop section). */}
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />

      <div className="relative z-10 w-36 md:w-48 aspect-[3/4] shrink-0 pointer-events-none">
        <Image
          src={product.mainImage ?? PRODUCT_CARD_IMAGES[product.slug] ?? product.image}
          alt={product.name}
          fill
          className="object-contain"
          sizes="200px"
        />
      </div>
      <div className="relative z-10 flex flex-col gap-3 md:gap-3.5 min-w-0">
        <h3 className="text-h3 text-cream pointer-events-none">{product.shortName}</h3>
        <p className="text-body-sm font-bold text-cream/80 uppercase tracking-[0.06em] pointer-events-none">{product.tagline}</p>
        <div className="flex gap-1.5 pointer-events-none">
          {[1, 2, 3, 4, 5].map((i) => (
            <ChiliIcon key={i} filled={i <= product.spiceLevel} color="#EF4444" />
          ))}
        </div>
        <p className="text-body-sm font-semibold text-cream/70 uppercase tracking-[0.06em] pointer-events-none">{product.weight}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-h4 font-bold text-cream pointer-events-none">₹{product.price}</span>
          <button
            type="button"
            onClick={() => add(product.slug)}
            className="text-btn font-bold relative bg-cream text-dark px-5 py-2.5 rounded-full uppercase tracking-[0.06em] hover:bg-cream/90 transition-colors cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// A non-active product — image + name only, click to bring it into focus.
function CollapsedCard({ product, onSelect }: { product: Product; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full md:h-[380px] flex flex-col items-center justify-center gap-4 rounded-lg bg-cream-dark p-5 hover:bg-cream-dark/70 transition-colors cursor-pointer"
    >
      <div className="relative w-28 md:w-36 aspect-[3/4]">
        <Image
          src={product.mainImage ?? PRODUCT_CARD_IMAGES[product.slug] ?? product.image}
          alt={product.name}
          fill
          className="object-contain"
          sizes="150px"
        />
      </div>
      <p className="text-lg md:text-xl font-semibold text-dark text-center">{product.shortName}</p>
    </button>
  );
}

export default function PdpCrossSell({
  relatedProducts,
}: {
  relatedProducts: Product[];
}) {
  const related = relatedProducts;
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Desktop only — the mobile carousel below is swipe/tap-driven instead,
  // so auto-advancing it out from under the user's thumb would be jarring.
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (related.length < 2) return;
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % related.length);
    }, ROTATE_MS);
  }, [related.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  // Mobile carousel — tracks whichever card is most centered in the
  // horizontal scroller so taps know which card is already "active" vs.
  // which one should just be scrolled into view first.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || related.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.6] }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [related.length]);

  if (related.length === 0) return null;

  const activeProduct = related[activeIndex] ?? related[0];
  const others = related.filter((_, i) => i !== activeIndex);

  const handleSelect = (slug: string) => {
    const idx = related.findIndex((p) => p.slug === slug);
    if (idx >= 0) setActiveIndex(idx);
    startTimer();
  };

  const scrollToCard = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section className="relative bg-cream py-16 md:py-24 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-5">
        <ScrollReveal>
          <h2 className="text-h2 text-green mb-8 md:mb-10">{SITE_CONTENT.productPage.crossSell.heading}</h2>
        </ScrollReveal>

        {/* Mobile — swipeable carousel: the active card fills the view with
            a sliver of the next card peeking at the edge. Tapping a card
            that isn't fully centered yet just brings it into focus first
            (rather than immediately navigating or adding to cart), tapping
            it again while centered behaves normally. */}
        <div
          ref={scrollRef}
          className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {related.map((p, i) => (
            <div
              key={p.slug}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              data-index={i}
              className="snap-center shrink-0 w-[85%]"
              onClickCapture={(e) => {
                if (i !== activeIndex) {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollToCard(i);
                }
              }}
            >
              <HighlightedCard product={p} />
            </div>
          ))}
        </div>

        {/* Desktop — one big highlighted card (auto-rotating) + two
            collapsed cards, click any collapsed card to bring it forward. */}
        <div className="hidden md:grid md:grid-cols-[1.7fr_1fr_1fr] md:gap-5">
          <HighlightedCard product={activeProduct} />
          {others.map((p) => (
            <CollapsedCard key={p.slug} product={p} onSelect={() => handleSelect(p.slug)} />
          ))}
        </div>
      </div>
    </section>
  );
}
