"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS, PRODUCT_CARD_IMAGES } from "@/lib/products";
import { CART_DISCOUNT_THRESHOLD, CART_DISCOUNT_PCT } from "@/lib/discounts";
import { SITE_WHATSAPP_NUMBER } from "@/lib/site";
import { useModalA11y } from "@/lib/use-modal-a11y";

// Same "order via chat" preset used by both the empty-cart and full-cart
// WhatsApp links below — kept in one place so the two never drift.
const WHATSAPP_ORDER_HREF = `https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Mirchi O Mirchi — I want to order 🌶️"
)}`;

/* ── Trash icon ── */
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}

/* ── Single cart item ── */
function CartItem({ slug, qty }: { slug: string; qty: number }) {
  const product = PRODUCTS.find((p) => p.slug === slug);
  const { setQty, remove } = useCart();
  if (!product) return null;

  return (
    <div className="flex gap-3.5 items-start py-[18px] border-b border-cream-dark">
      {/* Product image — flat cream-dark backdrop, no tint per flavor
          (product photography already carries the color). */}
      <div className="relative w-20 h-20 shrink-0 bg-cream-dark overflow-hidden">
        <Image
          src={PRODUCT_CARD_IMAGES[slug] || product.image}
          alt={product.name}
          fill
          className="object-contain p-1"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="font-quirk font-semibold text-[1.075rem] text-dark m-0 leading-tight">
            {product.name}
          </p>
          <button
            type="button"
            onClick={() => remove(slug)}
            aria-label="Remove"
            className="bg-transparent border-none cursor-pointer text-dark/35 hover:text-dark/80 pt-0.5 pl-2 shrink-0 transition-colors"
          >
            <TrashIcon />
          </button>
        </div>

        <p className="text-body-sm text-dark mb-3">
          ₹{product.price} /{product.weight.replace("g", "G")}
        </p>

        {/* Qty + total row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5 border-b-[1.5px] border-dark pb-1">
            <button
              type="button"
              onClick={() => setQty(slug, qty - 1)}
              className="w-[34px] h-[34px] border-none bg-transparent cursor-pointer text-dark rounded-full text-[1.4rem] leading-none flex items-center justify-center transition-colors hover:bg-dark hover:text-cream"
            >
              −
            </button>
            <span className="font-quirk font-semibold text-base text-dark min-w-4 text-center">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(slug, qty + 1)}
              className="w-[34px] h-[34px] border-none bg-transparent cursor-pointer text-dark rounded-full text-[1.4rem] leading-none flex items-center justify-center transition-colors hover:bg-dark hover:text-cream"
            >
              +
            </button>
          </div>
          <span className="font-quirk font-bold text-base text-dark">
            ₹{product.price * qty}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Quick-add row (empty state) ── */
function QuickAddRow({ slug }: { slug: string }) {
  const product = PRODUCTS.find((p) => p.slug === slug);
  const { add } = useCart();
  if (!product) return null;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-cream-dark">
      <div className="relative w-[52px] h-[52px] shrink-0 bg-cream-dark overflow-hidden">
        <Image
          src={PRODUCT_CARD_IMAGES[slug] || product.image}
          alt={product.name}
          fill
          className="object-contain p-1"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-quirk font-semibold text-[0.88rem] text-dark mb-0.5">
          {product.name}
        </p>
        <p className="text-[0.72rem] text-dark/60">
          ₹{product.price} /{product.weight.replace("g", "G")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => add(product.slug)}
        className="font-quirk bg-red text-cream border-none px-3.5 py-1.5 cursor-pointer font-bold text-[0.7rem] tracking-[0.06em] shrink-0 transition-colors hover:bg-red/85"
      >
        + ADD
      </button>
    </div>
  );
}

/* ── Dotted divider — the site's one shared dotted-line pattern (3px dots,
   10px gap, red), defined once in globals.css as `.dotted-divider` and
   reused everywhere (navbar, CTA banner, PDP, cart drawer) so the dotted
   rule is consistent — and stays consistent automatically if the pattern
   is ever tweaked again. ── */
function DottedDivider() {
  return <div className="dotted-divider" />;
}

/* ── Main component ── */
export default function MiniCart() {
  const { miniOpen, closeMini, lines, subtotal, itemCount, goToCheckout, add, clear } = useCart();

  const isEmpty = lines.length === 0;

  const drawerRef = useModalA11y(miniOpen, closeMini);

  useEffect(() => {
    document.body.style.overflow = miniOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [miniOpen]);

  return (
    <AnimatePresence>
      {miniOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeMini}
            className="fixed inset-0 z-[200] bg-dark/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mini-cart-title"
            tabIndex={-1}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-[420px] max-w-[100vw] z-[300] bg-cream flex flex-col outline-none"
            style={{ boxShadow: "-12px 0 60px rgba(26,13,4,0.2)" }}
          >
            {/* ── HEADER ── */}
            <div className="shrink-0 px-6 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <p id="mini-cart-title" className="font-quirk font-bold text-base text-dark m-0 tracking-[0.02em]">
                  Your Cart
                  <span className="font-normal text-dark/60 ml-2">
                    · {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={closeMini}
                  aria-label="Close cart"
                  className="bg-transparent border-none cursor-pointer text-dark/60 hover:text-dark text-[1.2rem] leading-none p-1 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <DottedDivider />

            {/* ── BODY ── */}
            <div className="flex-1 overflow-y-auto px-6">

              {isEmpty ? (
                /* EMPTY STATE — the message sits at top; everything else
                   (quick-add list, combo banner, WhatsApp link) is pushed to
                   the bottom of the drawer via the flexible spacer below. */
                <div className="flex flex-col min-h-full">
                  {/* Empty message */}
                  <div className="text-center pt-10 pb-8">
                    <h3 className="font-quirk font-bold text-[1.6rem] text-dark mb-2">
                      Your Cart is Empty
                    </h3>
                    <p className="text-[0.85rem] text-dark/60 mb-6">
                      No thecha means no flavour.
                    </p>
                    <Link
                      href="/shop"
                      onClick={closeMini}
                      className="font-quirk inline-flex items-center gap-1.5 bg-red text-cream font-semibold text-[0.85rem] no-underline px-7 py-3"
                    >
                      Shop shopping <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  {/* Spacer — pushes the block below to the bottom of the drawer */}
                  <div className="flex-1" />

                  <div>
                    <DottedDivider />

                    {/* Quick-add products */}
                    <div className="py-2">
                      <QuickAddRow slug="green-chilli-thecha" />
                      <QuickAddRow slug="red-chilli-thecha" />
                      <QuickAddRow slug="mixed-chilli-thecha" />
                    </div>

                    {/* Grab all three — banner card, matching the Upgrade-to-Combo treatment */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5 my-4 bg-cream-dark">
                      <div>
                        <p className="font-quirk font-bold text-[0.9rem] text-dark mb-0.5">
                          Grab all three.
                        </p>
                        <p className="text-[0.72rem] text-dark/55">
                          Green + Red + Mixed. Save ₹98.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => add("combo-pack")}
                        className="font-quirk font-semibold text-[0.78rem] bg-transparent cursor-pointer text-red border-[1.5px] border-red px-3.5 py-2 whitespace-nowrap shrink-0 transition-colors hover:bg-red hover:text-cream"
                      >
                        Add Combo
                      </button>
                    </div>

                    {/* Auto discount nudge — small, informational only (no
                        button, nothing to click — the discount applies by
                        itself at checkout once the threshold is hit). */}
                    <p className="text-body-sm font-semibold text-dark/70 text-center px-2 mb-4">
                      Spend ₹{CART_DISCOUNT_THRESHOLD}+ and get {CART_DISCOUNT_PCT}% off
                      automatically at checkout.
                    </p>

                    {/* WhatsApp */}
                    <div className="text-center pb-6">
                      <a
                        href={WHATSAPP_ORDER_HREF}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[0.78rem] text-dark no-underline"
                      >
                        Prefer WhatsApp?{" "}
                        <span className="text-red underline">Order via chat →</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* FILLED STATE */
                <>
                  <div className="py-2">
                    {lines.map((line) => (
                      <CartItem key={line.slug} slug={line.slug} qty={line.qty} />
                    ))}
                  </div>

                  {/* Upgrade to Combo upsell */}
                  {!lines.find((l) => l.slug === "combo-pack") && (
                    <div className="flex items-center gap-3 px-4 py-3.5 my-2 mb-4 bg-cream-dark">
                      <div className="text-[1.2rem] leading-none shrink-0" aria-hidden="true">
                        💡
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-quirk font-semibold text-[0.85rem] text-dark mb-0.5">
                          Upgrade to Combo. Save ₹98
                        </p>
                        <p className="text-[0.7rem] text-dark/55">
                          Switch to the Combo Pack at ₹799 instead of ₹897
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          clear();
                          add("combo-pack");
                        }}
                        className="font-quirk font-semibold text-[0.75rem] bg-transparent cursor-pointer text-red border-[1.5px] border-red px-3 py-1.5 shrink-0 whitespace-nowrap transition-colors hover:bg-red hover:text-cream"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="h-4" />
                </>
              )}
            </div>

            {/* ── FOOTER (only in filled state) ── */}
            {!isEmpty && (
              <div className="shrink-0">
                <DottedDivider />
                <div className="px-6 pt-4 pb-6">
                  {/* Checkout button */}
                  <button
                    type="button"
                    onClick={goToCheckout}
                    className="w-full py-[15px] px-5 bg-red text-cream border-none cursor-pointer flex items-center justify-between mb-3.5 transition-colors hover:bg-red/85"
                  >
                    <span className="font-quirk font-bold text-[0.95rem] tracking-[0.02em]">
                      Secure Checkout · ₹{subtotal}
                    </span>
                    <Image
                      src="/images/payment-options.png"
                      alt="Visa Mastercard GPay PhonePe"
                      width={100} height={24}
                      className="h-[22px] w-auto object-contain"
                    />
                  </button>

                  {/* WhatsApp */}
                  <div className="text-center">
                    <a
                      href={WHATSAPP_ORDER_HREF}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[0.78rem] text-dark no-underline"
                    >
                      Prefer WhatsApp?{" "}
                      <span className="text-red underline">Order via chat →</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
