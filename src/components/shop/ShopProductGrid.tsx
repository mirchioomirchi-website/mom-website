"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { PRODUCT_CARD_IMAGES, type Product } from "@/lib/products";
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

type PincodeStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; codAvailable: boolean }
  | { state: "unavailable"; reason: string };

export default function ShopProductGrid({ products }: { products: Product[] }) {
  const { add } = useCart();
  const flavours = products.filter((p) => !p.isCombo);

  // "Availability" — real filter now that Product.available reflects live
  // Shopify stock. Defaults to showing everything (sold-out items still
  // visible with their sold-out treatment) since hiding products by default
  // could look like the catalogue shrank.
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "in-stock">("all");
  const visibleFlavours =
    availabilityFilter === "in-stock"
      ? flavours.filter((p) => p.available !== false)
      : flavours;

  // "Enter PIN code" — reuses the same Mumbai-aware /api/pincode endpoint the
  // checkout page's live serviceability check calls, so the answer here is
  // never out of sync with what checkout will actually allow.
  const [showAvailabilityMenu, setShowAvailabilityMenu] = useState(false);
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus>({ state: "idle" });
  const lastChecked = useRef("");

  useEffect(() => {
    const pin = pincode.replace(/[^0-9]/g, "");
    if (!/^\d{6}$/.test(pin)) {
      // Same reset-to-idle guard used by the checkout page's identical
      // pincode-check effect — only fires when state actually needs to
      // change (guarded above), not on every render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPincodeStatus((prev) => (prev.state === "idle" ? prev : { state: "idle" }));
      lastChecked.current = "";
      return;
    }
    if (lastChecked.current === pin) return;
    lastChecked.current = pin;

    const controller = new AbortController();
    setPincodeStatus({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode?pincode=${pin}`, { signal: controller.signal });
        if (!res.ok) {
          setPincodeStatus({ state: "available", codAvailable: true });
          return;
        }
        const data = (await res.json()) as
          | { available: true; codAvailable: boolean }
          | { available: false; reason: string };
        if (data.available) {
          setPincodeStatus({ state: "available", codAvailable: data.codAvailable });
        } else {
          setPincodeStatus({ state: "unavailable", reason: data.reason });
        }
      } catch {
        setPincodeStatus({ state: "available", codAvailable: true });
      }
    }, 400);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [pincode]);

  return (
    <section className="relative bg-cream pt-14 md:pt-20 pb-24 md:pb-32 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-9">
        {/* Header row — title left, Availability filter + PIN-code
            serviceability check right. */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12">
            <h2 className="text-h3 font-bold text-dark">{allProductsLabel}</h2>
            {/* Row on every size now, not just desktop — Availability stays
                pinned to the left edge and the PIN-code check to the right,
                on the same line, instead of stacking on mobile. */}
            <div className="flex flex-row items-center justify-between md:justify-start gap-3 md:gap-6 text-body-sm text-dark/70">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityMenu((v) => !v)}
                  aria-expanded={showAvailabilityMenu}
                  aria-haspopup="listbox"
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {availabilityLabel}: {availabilityFilter === "in-stock" ? "In stock only" : "All"}
                  <ChevronDown />
                </button>

                {showAvailabilityMenu && (
                  <ul
                    role="listbox"
                    className="absolute right-0 md:left-0 top-full mt-2 z-20 bg-cream border border-dark/10 shadow-lg py-1 w-max"
                  >
                    {(["all", "in-stock"] as const).map((value) => (
                      <li key={value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={availabilityFilter === value}
                          onClick={() => {
                            setAvailabilityFilter(value);
                            setShowAvailabilityMenu(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-body-sm hover:bg-cream-dark transition-colors cursor-pointer ${
                            availabilityFilter === value ? "text-dark font-semibold" : "text-dark/70"
                          }`}
                        >
                          {value === "in-stock" ? "In stock only" : "All"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPincodeInput((v) => !v)}
                  aria-expanded={showPincodeInput}
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <PinIcon />
                  {deliverToLabel}
                  <span className="underline underline-offset-2 text-dark font-semibold">
                    {pincodeStatus.state === "available" || pincodeStatus.state === "unavailable"
                      ? pincode
                      : deliverToCta}
                  </span>
                </button>

                {showPincodeInput && (
                  <div className="absolute right-0 top-full mt-2 z-20 bg-cream border border-dark/10 shadow-lg p-4 w-64">
                    <label htmlFor="shop-pincode-input" className="sr-only">
                      Enter your pincode
                    </label>
                    <input
                      id="shop-pincode-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="6-digit pincode"
                      autoFocus
                      className="w-full bg-cream-dark border-0 px-3 py-2 text-body-sm text-dark placeholder:text-dark/60 outline-none focus:ring-2 focus:ring-green/40"
                    />
                    <p role="status" className="text-body-sm mt-2 min-h-5">
                      {pincodeStatus.state === "checking" && (
                        <span className="text-dark/60">Checking…</span>
                      )}
                      {pincodeStatus.state === "available" && (
                        <span className="text-green">
                          We deliver here
                          {pincodeStatus.codAvailable ? " — COD available." : " (online payment only)."}
                        </span>
                      )}
                      {pincodeStatus.state === "unavailable" && (
                        <span className="text-red">{pincodeStatus.reason}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {visibleFlavours.length === 0 && (
          <p className="text-body text-dark/60 py-16 text-center">
            Nothing in stock right now with this filter — check back soon, or view all products.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
          {visibleFlavours.map((product, i) => {
            const style = FLAVOR_STYLE[product.flavor];
            const soldOut = product.available === false;
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
                        className={`object-contain ${soldOut ? "opacity-50" : ""}`}
                        sizes="(max-width: 768px) 40vw, 15vw"
                      />
                    </div>
                    {soldOut && (
                      <span className="absolute top-3 left-3 bg-dark text-cream text-[11px] font-bold uppercase tracking-[0.06em] px-2.5 py-1">
                        Sold out
                      </span>
                    )}
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
                        <span className="text-sm md:text-xl text-dark/60 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => add(product.slug)}
                      className={`text-sm md:text-btn font-bold inline-flex items-center justify-center gap-1.5 md:gap-2 w-full md:w-auto md:h-9 ${style.button} text-cream px-3 py-1.5 md:px-5 md:py-0 hover:opacity-90 transition-opacity cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50`}
                    >
                      {soldOut ? "Sold Out" : "Add to Cart"}
                      {!soldOut && <CartIcon />}
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
