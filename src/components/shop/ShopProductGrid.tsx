"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { PRODUCTS, PRODUCT_CARD_IMAGES } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { trackSelectItem } from "@/lib/analytics-events";

const SHOP_LIST_ID = "shop_grid";
const SHOP_LIST_NAME = "Shop";

const { allProductsLabel, availabilityLabel, deliverToLabel, deliverToCta } =
  SITE_CONTENT.shopPage;

// Per-flavor styling — the panel background is the exact brand-palette color
// each jar was shot against elsewhere on the site, reused here for the
// card's image panel background, price color and Add to Cart button. The
// jar photo itself comes from the shared PRODUCT_CARD_IMAGES map (clean,
// tightly-cropped studio shot — the same asset used for the cart drawer and
// PDP cross-sell cards) rather than the wide hover-composite cutouts, which
// have a lot of dead space baked in and read too small on a card.
const FLAVOR_STYLE: Record<string, { panelBg: string; text: string; button: string }> = {
  green: { panelBg: "bg-green", text: "text-green", button: "bg-green" },
  red: { panelBg: "bg-red", text: "text-red", button: "bg-red" },
  mixed: { panelBg: "bg-orange", text: "text-orange", button: "bg-orange" },
};

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function ShopProductGrid() {
  const { add } = useCart();
  const flavours = PRODUCTS.filter((p) => !p.isCombo);

  return (
    <section className="relative bg-cream pt-14 md:pt-20 pb-24 md:pb-32 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        {/* Header row — title left, decorative availability/delivery info
            right (no delivery-PIN backend exists yet, so these are static
            display only, matching the design without faking functionality). */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12">
            <h2 className="text-h3 font-bold text-dark">{allProductsLabel}</h2>
            <div className="flex items-center gap-6 text-body-sm text-dark/70">
              <span className="inline-flex items-center gap-1.5">
                {availabilityLabel}
                <ChevronDown />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PinIcon />
                {deliverToLabel}
                <span className="underline underline-offset-2 text-dark font-semibold">
                  {deliverToCta}
                </span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
          {flavours.map((product, i) => {
            const style = FLAVOR_STYLE[product.flavor];
            return (
              <ScrollReveal key={product.slug} delay={i * 0.06}>
                <div className="flex flex-col h-full">
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => trackSelectItem(product, SHOP_LIST_NAME, SHOP_LIST_ID, i)}
                    className={`relative flex items-center justify-center w-full aspect-square md:aspect-[4/5] ${style.panelBg} overflow-hidden`}
                  >
                    <div className="relative w-[52%] md:w-[50%] aspect-[1200/1631]">
                      <Image
                        src={PRODUCT_CARD_IMAGES[product.slug] ?? product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 40vw, 15vw"
                      />
                    </div>
                  </Link>

                  <div className="flex items-baseline justify-between gap-2 mt-3 md:mt-5 mb-1 md:mb-2">
                    <Link href={`/products/${product.slug}`} className="min-w-0">
                      <h3 className="text-base md:text-2xl font-medium md:font-bold text-dark hover:opacity-80 transition-opacity truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <span className={`text-xs md:text-body font-bold ${style.text} uppercase shrink-0`}>
                      {product.weight.replace("g", "G")}
                    </span>
                  </div>

                  <p className="hidden md:block text-body text-dark/70 mb-3 md:mb-4">{product.description}</p>

                  <div className="mt-auto flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                    <p className="flex items-baseline gap-2">
                      <span className={`text-lg md:text-2xl font-bold ${style.text}`}>₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm md:text-xl text-dark/40 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => add(product.slug)}
                      className={`text-sm md:text-btn font-bold inline-flex items-center justify-center gap-1.5 md:gap-2 w-full md:w-auto md:h-9 ${style.button} text-cream px-3 py-1.5 md:px-5 md:py-0 hover:opacity-90 transition-opacity cursor-pointer shrink-0`}
                    >
                      Add to Cart
                      <CartIcon />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
