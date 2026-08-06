"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { SITE_CONTENT } from "@/lib/content";
import { useCart } from "@/lib/cart-context";
import { PDP_ACCENT_COLOR, PRODUCT_CARD_IMAGES, type Product } from "@/lib/products";

// Label — dotted leader line — value. Classic spec-sheet row, matching the
// design's "Heat Level ⋯⋯⋯⋯⋯⋯⋯⋯ Medium - Hot" treatment exactly. The leader
// line reuses the site's one shared dotted-line pattern (same as the navbar
// bottom border), not a browser-native dotted border.
function DetailRow({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-body text-dark/70 whitespace-nowrap">{label}</span>
      <span
        className="flex-1 dotted-divider translate-y-[-4px]"
        style={{ color: accentColor }}
      />
      <span className="text-tag font-bold whitespace-nowrap" style={{ color: accentColor }}>
        {value}
      </span>
    </div>
  );
}

export default function PdpHero({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const { devanagariLabel } = SITE_CONTENT.productPage;
  const accentColor = product.pdpAccentColor ?? PDP_ACCENT_COLOR[product.flavor];
  const mainImage = product.mainImage ?? PRODUCT_CARD_IMAGES[product.slug] ?? product.image;
  const hindiName = product.nameHi ?? devanagariLabel;

  return (
    // Mobile: image + jar-overlay + content all sized to fit within the
    // first viewport (through the Add to Cart button) without scrolling —
    // `min-h-[100dvh]` guarantees the section fills the screen but still
    // grows instead of clipping if a device is unusually short.
    // Desktop: unchanged half-split, `md:h-screen` grid.
    <section className="relative bg-cream cv-auto">
      <div className="flex flex-col min-h-[100dvh] md:grid md:grid-cols-2 md:h-screen md:min-h-0">
        {/* Closeup product photo — falls back to a color-tinted panel with
            the front jar shot when a flavor doesn't have real macro
            photography yet (Shopify metafield placeholder). */}
        <div className="relative h-[36vh] shrink-0 md:h-full">
          {product.closeupImage ? (
            <Image
              src={product.closeupImage}
              alt={`${product.name} closeup`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: accentColor }}
            >
              <div className="relative w-1/2 aspect-square">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain opacity-95"
                />
              </div>
            </div>
          )}
        </div>

        {/* Info panel — grows to fill whatever's left of the viewport on
            mobile and vertically centers its (compact) content within it. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-1 flex flex-col items-center text-center px-5 md:px-5 pt-0 pb-6 md:pt-[88px] md:pb-10 justify-start md:justify-center gap-5 md:gap-6"
        >
          {/* Hindi name is hero-only decoration on desktop — dropped on
              mobile to save vertical space now that the jar overlaps the
              photo above it. */}
          <p
            className="hidden md:block font-sura text-[1.4rem]"
            style={{ color: accentColor }}
          >
            {hindiName}
          </p>

          {/* Pulled up over the closeup photo's bottom edge on mobile so it
              reads as overlaying the image, half in/half out. */}
          <div className="relative z-10 w-48 md:w-44 aspect-[3/4] -mt-32 md:mt-0 mb-3 md:mb-1">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              priority
              className="object-contain"
            />
          </div>

          <h1 className="text-h3 font-bold uppercase" style={{ color: accentColor }}>
            {product.name}
          </h1>

          <p className="text-body text-dark/75 max-w-xl mt-2">{product.longDescription}</p>

          <div className="w-full max-w-xl space-y-1.5 md:space-y-2 mt-4 md:mt-5">
            <DetailRow label="Heat Level" value={product.heatLevel} accentColor={accentColor} />
            <DetailRow label="Volume" value={product.weight} accentColor={accentColor} />
            <DetailRow label="Price" value={`₹${product.price}`} accentColor={accentColor} />
          </div>

          <div className="flex items-center gap-3 w-full max-w-xl mt-4 md:mt-6">
            <div className="shrink-0">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-11 text-xl md:text-2xl font-semibold text-dark/70 hover:text-dark transition-colors cursor-pointer"
                >
                  −
                </button>
                <span className="w-8 text-center text-body font-semibold text-dark">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-11 text-xl md:text-2xl font-semibold text-dark/70 hover:text-dark transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
              <div className="dotted-divider" style={{ color: accentColor }} />
            </div>

            <button
              type="button"
              onClick={() => add(product.slug, qty)}
              className="text-btn font-bold flex-1 h-11 text-cream uppercase tracking-[0.06em] hover:opacity-90 transition-opacity cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              Add to Cart
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
