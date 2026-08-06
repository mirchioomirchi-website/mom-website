"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { PDP_ACCENT_COLOR, PRODUCT_CARD_IMAGES, type Product } from "@/lib/products";

// How many times the tagline repeats along the path. Needs to be enough
// that the path is always fully covered with text as it flows.
const REPEATS = 10;
// Path-space units advanced per animation frame.
const SPEED = 0.6;

export default function PdpStory({ product }: { product: Product }) {
  const reactId = useId();
  const pathId = `pdp-wave-${reactId}`;
  const textRef = useRef<SVGTextElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);

  // The path itself never moves — only the text's startOffset animates,
  // measured so the loop wraps exactly on a repeat boundary. That makes the
  // scroll mathematically seamless: no CSS-transform restart, no glitch.
  useEffect(() => {
    let raf = 0;
    let cancelled = false;

    const start = () => {
      const textEl = textRef.current;
      const textPathEl = textPathRef.current;
      if (!textEl || !textPathEl || cancelled) return;

      let unitLength = 0;
      try {
        unitLength = textEl.getComputedTextLength() / REPEATS;
      } catch {
        return;
      }
      if (!unitLength || !Number.isFinite(unitLength)) return;

      let offset = 0;
      const tick = () => {
        offset -= SPEED;
        if (offset <= -unitLength) offset += unitLength;
        textPathEl.setAttribute("startOffset", String(offset));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [product.tagline]);

  const repeated = `${product.tagline}    `.repeat(REPEATS);
  const accentColor = product.pdpAccentColor ?? PDP_ACCENT_COLOR[product.flavor];
  const mainImage = product.mainImage ?? PRODUCT_CARD_IMAGES[product.slug] ?? product.image;

  return (
    <section className="relative bg-cream cv-auto">
      <div className="grid md:grid-cols-2">
        {/* Wavy tagline marquee + story copy — plain cream background, no
            invented color block. Text itself carries the product's color. */}
        <div className="relative flex flex-col gap-8 md:gap-10 py-16 md:py-0 md:justify-center md:min-h-[520px]">
          <svg
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            className="w-full h-28 md:h-36"
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            <path
              id={pathId}
              d="M0,110 Q150,70 300,110 T600,110 T900,110 T1200,110"
              fill="none"
            />
            <text
              ref={textRef}
              fontSize="100"
              fontWeight="500"
              fill={accentColor}
              style={{ fontFamily: "var(--font-quirk)" }}
            >
              <textPath ref={textPathRef} href={`#${pathId}`} startOffset="0">
                {repeated}
              </textPath>
            </text>
          </svg>

          <p className="text-body text-dark/80 max-w-md relative z-10 px-5 md:px-5">{product.storyText}</p>
        </div>

        {/* Secondary lifestyle photo — falls back to a color-tinted panel
            with the front jar shot when a flavor doesn't have one yet. */}
        <div className="relative h-[42vh] md:h-auto md:min-h-[520px]">
          {product.secondaryImage ? (
            <Image
              src={product.secondaryImage}
              alt={`${product.name} lifestyle`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ filter: "brightness(0.88)", background: accentColor }}
            >
              <div className="relative w-1/2 aspect-square">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain opacity-95"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
