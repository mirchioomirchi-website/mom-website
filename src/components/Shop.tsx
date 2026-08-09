"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { getProduct } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { HighlightedCard } from "@/components/pdp/PdpCrossSell";

const { eyebrowDevanagari, eyebrowEnglish, mobileHeading, shopAllLabel, shopAllHref, marqueeText, jars } =
  SITE_CONTENT.shop;

const CUTOUT_SRC: Record<string, string> = {
  green: "/images/shop/green-jar.webp",
  red: "/images/shop/red-jar.webp",
  mixed: "/images/shop/orange-jar.webp",
};

// Same pink starburst as the product showcase's Add to Cart button, sized up
// a little and given a second line for price.
function JarBoom({ price, onAdd }: { price: number; onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdd();
        if (timerRef.current) clearTimeout(timerRef.current);
        setAdded(true);
        timerRef.current = setTimeout(() => setAdded(false), 1200);
      }}
      aria-label="Add to cart"
      className="relative w-[112px] h-[77px] md:w-[136px] md:h-[94px] cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      <svg viewBox="0 0 148 102" className="absolute inset-0 w-full h-full">
        <path
          d="M62.5446 19.2911L76.8611 0.912855L90.5595 26.3861L124.021 14.853L122.542 41.0504L146.13 50.371L115.304 67.2677L121.662 89.4084L84.407 76.7822L67.2596 100.342L58.582 75.2859L17.9936 83.0515L24.7288 62.8803L1.10555 43.4855L30.9197 36.6666L23.5144 14.5296L62.5446 19.2911Z"
          fill="var(--color-pink)"
          stroke="var(--color-yellow)"
        />
      </svg>
      <span className="relative z-10 flex flex-col items-center justify-center w-full h-full text-yellow font-quirk leading-tight px-3 text-center gap-0.5">
        {added ? (
          <span className="text-[12px] md:text-[14px] font-medium uppercase tracking-[0.06em]">
            Added!
          </span>
        ) : (
          <>
            <span className="text-[14px] md:text-[16px] font-medium">₹{price}</span>
            <span className="text-[9px] md:text-[10.5px] uppercase tracking-[0.06em] underline underline-offset-2">
              Add to Cart
            </span>
          </>
        )}
      </span>
    </button>
  );
}

export default function Shop() {
  const { add } = useCart();
  const [hovered, setHovered] = useState<string | null>(null);
  const active = jars.find((j) => j.flavor === hovered) ?? null;

  return (
    <section
      id="shop"
      className="relative overflow-hidden cv-auto transition-colors duration-500"
      style={{ backgroundColor: active ? active.bgDark : "#FFF3D7" }}
    >
      <div className="relative w-full max-w-[1400px] mx-auto px-5 md:px-9 pt-10 md:pt-14 pb-16 md:pb-24">
        {/* Top row — eyebrow + Shop All link, always on top. Desktop keeps
            the Devanagari/English eyebrow pairing; mobile swaps it for a
            plain section title since there's no hover state to pair with a
            small eyebrow there. */}
        <div className="relative z-40 flex items-center justify-between mb-6 md:mb-10">
          <ScrollReveal className="hidden md:flex items-center gap-2.5">
            <span
              className={`font-sura text-[15px] md:text-base transition-colors duration-500 ${active ? "text-cream" : "text-pink"}`}
            >
              {eyebrowDevanagari}
            </span>
            <span
              className={`text-sm transition-colors duration-500 ${active ? "text-cream/50" : "text-pink/50"}`}
            >
              •
            </span>
            <span
              className={`font-sura text-[15px] md:text-base transition-colors duration-500 ${active ? "text-cream" : "text-pink"}`}
            >
              {eyebrowEnglish}
            </span>
          </ScrollReveal>

          <ScrollReveal className="md:hidden">
            <h2 className="text-h2 text-pink">{mobileHeading}</h2>
          </ScrollReveal>

          <Link
            href={shopAllHref}
            className={`text-btn inline-flex items-center gap-1.5 md:underline md:underline-offset-4 md:decoration-2 transition-colors duration-500 ${
              active ? "text-cream decoration-cream" : "text-dark decoration-dark"
            }`}
          >
            {shopAllLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Background marquee — "Pick Your Mirchi" tiled behind the photo,
            fades out on hover in favour of the active jar's title. Desktop
            only — mobile now has its own plain section title up top and no
            hover state, so the marquee has nothing to react to there. */}
        <div
          className="hidden md:flex absolute inset-0 z-0 flex-col justify-center gap-6 md:gap-10 transition-opacity duration-500 pointer-events-none"
          style={{ opacity: active ? 0 : 1 }}
          aria-hidden="true"
        >
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden"
            >
              <div
                className={`flex whitespace-nowrap font-quirk font-medium text-green text-[9vw] md:text-[64px] leading-none ${
                  row % 2 === 0 ? "animate-marquee-ltr" : "animate-marquee-rtl"
                }`}
                style={{ animationDuration: "40s" }}
              >
                <span className="pr-10">{`${marqueeText}    `.repeat(6)}</span>
                <span className="pr-10">{`${marqueeText}    `.repeat(6)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active jar title — desktop only, replaces the marquee up top
            while hovering. Mobile has no hover state to trigger this. */}
        <div
          className="hidden md:block absolute left-0 right-0 top-24 md:top-32 z-20 text-center transition-opacity duration-500 pointer-events-none"
          style={{ opacity: active ? 1 : 0 }}
        >
          <h2 className="text-h2 text-cream">
            {active?.title}
          </h2>
        </div>

        {/* Product composite — desktop only: full photo + per-jar cutouts +
            hover hotspots. On mobile there's no hover to discover the cutout
            with, so it's replaced below by a swipeable card slider instead. */}
        <div className="hidden md:block relative z-10 w-full aspect-[2400/1603] mt-2">
          <Image
            src="/images/shop/full.webp"
            alt="Mirchi O Mirchi jars and boxes"
            fill
            unoptimized
            className="object-contain transition-opacity duration-500"
            style={{ opacity: active ? 0.2 : 1 }}
          />

          {jars.map((jar) => (
            <Image
              key={jar.flavor}
              src={CUTOUT_SRC[jar.flavor]}
              alt=""
              fill
              unoptimized
              aria-hidden="true"
              className="object-contain transition-opacity duration-500 pointer-events-none"
              style={{ opacity: hovered === jar.flavor ? 1 : 0 }}
            />
          ))}

          {jars.map((jar) => {
            const product = getProduct(jar.slug);
            const isActive = hovered === jar.flavor;
            return (
              <div
                key={jar.flavor}
                className="absolute z-30"
                style={{
                  left: `${jar.hotspot.left}%`,
                  top: `${jar.hotspot.top}%`,
                  width: `${jar.hotspot.width}%`,
                  height: `${jar.hotspot.height}%`,
                }}
                onMouseEnter={() => setHovered(jar.flavor)}
                onMouseLeave={() => setHovered((h) => (h === jar.flavor ? null : h))}
              >
                <Link
                  href={`/products/${jar.slug}`}
                  className="absolute inset-0"
                  aria-label={`View ${jar.title}`}
                />
                <div
                  className={`absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 transition-all duration-300 ${
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                  }`}
                >
                  {product && <JarBoom price={product.price} onAdd={() => add(jar.slug)} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile — swipeable product cards (same design as the PDP
            cross-sell cards), sitting on top of the "Pick Your Mirchi"
            marquee running behind them. */}
        <div className="md:hidden relative z-10 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-5 px-5 mt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {jars.map((jar) => {
            const product = getProduct(jar.slug);
            if (!product) return null;
            return (
              <div key={jar.flavor} className="snap-center shrink-0 w-[85%]">
                <HighlightedCard product={product} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
