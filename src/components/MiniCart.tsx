"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS, PRODUCT_CARD_IMAGES } from "@/lib/products";

// Thumbnail backdrop is a flat neutral cream, not tinted per flavor — matches
// the actual design (product photography already carries the color).
const THUMB_BG = "#F2E4C4";

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
    <div style={{
      padding: "18px 0",
      borderBottom: "1px solid #F2E4C4",
      display: "flex", gap: 14, alignItems: "flex-start",
    }}>
      {/* Product image */}
      <div style={{
        width: 80, height: 80, borderRadius: 6, flexShrink: 0,
        background: THUMB_BG,
        position: "relative", overflow: "hidden",
      }}>
        <Image
          src={PRODUCT_CARD_IMAGES[slug] || product.image}
          alt={product.name} fill
          style={{ objectFit: "contain", padding: 4 }}
        />
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <p style={{
            fontFamily: "Afacad, Arial, sans-serif", fontWeight: 600,
            fontSize: "1.075rem", color: "#1A0D04", margin: 0,
            lineHeight: 1.2,
          }}>
            {product.name}
          </p>
          <button
            onClick={() => remove(slug)}
            aria-label="Remove"
            style={{ background: "none", border: "none", cursor: "pointer",
                     color: "#1A0D04", opacity: 0.35, padding: "2px 0 0 8px",
                     flexShrink: 0, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
          >
            <TrashIcon />
          </button>
        </div>

        <p style={{
          fontFamily: "GreycliffCF, Inter, sans-serif",
          fontSize: "0.875rem", color: "#1A0D04", opacity: 1,
          margin: "0 0 12px",
        }}>
          ₹{product.price} /{product.weight.replace("g", "G")}
        </p>

        {/* Qty + total row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            borderBottom: "1.5px solid #1A0D04", paddingBottom: 4,
          }}>
            <button
              onClick={() => setQty(slug, qty - 1)}
              style={{
                width: 34, height: 34, border: "none",
                background: "none", cursor: "pointer", color: "#1A0D04",
                borderRadius: "50%", fontSize: "1.4rem", lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1A0D04"; e.currentTarget.style.color = "#FFF3D7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#1A0D04"; }}
            >−</button>
            <span style={{
              fontFamily: "Afacad, Arial, sans-serif", fontWeight: 600,
              fontSize: "1rem", color: "#1A0D04", minWidth: 16, textAlign: "center",
            }}>
              {qty}
            </span>
            <button
              onClick={() => setQty(slug, qty + 1)}
              style={{
                width: 34, height: 34, border: "none",
                background: "none", cursor: "pointer", color: "#1A0D04",
                borderRadius: "50%", fontSize: "1.4rem", lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1A0D04"; e.currentTarget.style.color = "#FFF3D7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#1A0D04"; }}
            >+</button>
          </div>
          <span style={{
            fontFamily: "Afacad, Arial, sans-serif", fontWeight: 700,
            fontSize: "1rem", color: "#1A0D04",
          }}>
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
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 0", borderBottom: "1px solid #F2E4C4",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 6, flexShrink: 0,
        background: THUMB_BG,
        position: "relative", overflow: "hidden",
      }}>
        <Image
          src={PRODUCT_CARD_IMAGES[slug] || product.image}
          alt={product.name} fill
          style={{ objectFit: "contain", padding: 4 }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "Afacad, Arial, sans-serif", fontWeight: 600,
          fontSize: "0.88rem", color: "#1A0D04", margin: "0 0 2px",
        }}>
          {product.name}
        </p>
        <p style={{
          fontFamily: "GreycliffCF, Inter, sans-serif",
          fontSize: "0.72rem", color: "#1A0D04", opacity: 0.5, margin: 0,
        }}>
          ₹{product.price} /{product.weight.replace("g", "G")}
        </p>
      </div>
      <button
        onClick={() => add(product.slug)}
        style={{
          background: "#9B1E15", color: "#FFF3D7", border: "none",
          borderRadius: 4, padding: "7px 14px", cursor: "pointer",
          fontFamily: "GreycliffCF, Inter, sans-serif", fontWeight: 600,
          fontSize: "0.7rem", letterSpacing: "0.06em",
          flexShrink: 0, transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#7a1710")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#9B1E15")}
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMini(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMini]);

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
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(26,13,4,0.6)",
              backdropFilter: "blur(3px)", cursor: "pointer",
            }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: 420, maxWidth: "100vw", zIndex: 300,
              background: "#FFF3D7",
              display: "flex", flexDirection: "column",
              boxShadow: "-12px 0 60px rgba(26,13,4,0.2)",
            }}
          >
            {/* ── HEADER ── */}
            <div style={{ padding: "20px 24px 16px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{
                  fontFamily: "Afacad, Arial, sans-serif", fontWeight: 700,
                  fontSize: "1rem", color: "#1A0D04", margin: 0,
                  letterSpacing: "0.02em",
                }}>
                  Your Cart
                  <span style={{ fontWeight: 400, opacity: 0.5, marginLeft: 8 }}>
                    · {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </span>
                </p>
                <button
                  onClick={closeMini}
                  aria-label="Close cart"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#1A0D04", opacity: 0.4, fontSize: "1.2rem",
                    lineHeight: 1, padding: 4, transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
                >
                  ✕
                </button>
              </div>
            </div>

            <DottedDivider />

            {/* ── BODY ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>

              {isEmpty ? (
                /* EMPTY STATE — the message sits at top; everything else
                   (quick-add list, combo banner, WhatsApp link) is pushed to
                   the bottom of the drawer via the flexible spacer below. */
                <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
                  {/* Empty message */}
                  <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
                    <h3 style={{
                      fontFamily: "Afacad, Arial, sans-serif", fontWeight: 700,
                      fontSize: "1.6rem", color: "#1A0D04", margin: "0 0 8px",
                    }}>
                      Your Cart is Empty
                    </h3>
                    <p style={{
                      fontFamily: "GreycliffCF, Inter, sans-serif",
                      fontSize: "0.85rem", color: "#1A0D04", opacity: 0.5,
                      margin: "0 0 24px",
                    }}>
                      No thecha means no flavour.
                    </p>
                    <Link
                      href="/shop"
                      onClick={closeMini}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#9B1E15", color: "#FFF3D7",
                        fontFamily: "GreycliffCF, Inter, sans-serif", fontWeight: 600,
                        fontSize: "0.85rem",
                        textDecoration: "none", padding: "12px 28px", borderRadius: 4,
                      }}
                    >
                      Shop shopping <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  {/* Spacer — pushes the block below to the bottom of the drawer */}
                  <div style={{ flex: 1 }} />

                  <div>
                    <DottedDivider />

                    {/* Quick-add products */}
                    <div style={{ padding: "8px 0" }}>
                      <QuickAddRow slug="green-chilli-thecha" />
                      <QuickAddRow slug="red-chilli-thecha" />
                      <QuickAddRow slug="mixed-chilli-thecha" />
                    </div>

                    {/* Grab all three — banner card, matching the Upgrade-to-Combo treatment */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12, padding: "14px 16px", margin: "16px 0",
                      background: "#F2E4C4", borderRadius: 6,
                    }}>
                      <div>
                        <p style={{
                          fontFamily: "Afacad, Arial, sans-serif", fontWeight: 700,
                          fontSize: "0.9rem", color: "#1A0D04", margin: "0 0 2px",
                        }}>
                          Grab all three.
                        </p>
                        <p style={{
                          fontFamily: "GreycliffCF, Inter, sans-serif",
                          fontSize: "0.72rem", color: "#1A0D04", opacity: 0.55, margin: 0,
                        }}>
                          Green + Red + Mixed. Save ₹98.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => add("combo-pack")}
                        style={{
                          fontFamily: "GreycliffCF, Inter, sans-serif", fontWeight: 600,
                          fontSize: "0.78rem", background: "none", cursor: "pointer",
                          color: "#9B1E15", textDecoration: "none",
                          border: "1.5px solid #9B1E15", borderRadius: 4,
                          padding: "8px 14px", whiteSpace: "nowrap", flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#9B1E15"; e.currentTarget.style.color = "#FFF3D7"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9B1E15"; }}
                      >
                        Add Combo
                      </button>
                    </div>

                    {/* WhatsApp */}
                    <div style={{ textAlign: "center", padding: "0 0 24px" }}>
                      <a
                        href="https://wa.me/918850816448?text=Hi%20Mirchi%20O%20Mirchi%20%E2%80%94%20I%20want%20to%20order%20%F0%9F%8C%B6%EF%B8%8F"
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          fontFamily: "GreycliffCF, Inter, sans-serif",
                          fontSize: "0.78rem", color: "#1A0D04", opacity: 1,
                          textDecoration: "none",
                        }}
                      >
                        Prefer WhatsApp?{" "}
                        <span style={{ color: "#9B1E15", textDecoration: "underline" }}>Order via chat →</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* FILLED STATE */
                <>
                  <div style={{ padding: "8px 0" }}>
                    {lines.map((line) => (
                      <CartItem key={line.slug} slug={line.slug} qty={line.qty} />
                    ))}
                  </div>

                  {/* Upgrade to Combo upsell */}
                  {!lines.find((l) => l.slug === "combo-pack") && (
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: 12, padding: "14px 16px", margin: "8px 0 16px",
                      background: "#F2E4C4", borderRadius: 6,
                      border: "1px solid #E8D9B8",
                    }}>
                      <div style={{ fontSize: "1.2rem", lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
                        💡
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: "Afacad, Arial, sans-serif", fontWeight: 600,
                          fontSize: "0.85rem", color: "#1A0D04", margin: "0 0 2px",
                        }}>
                          Upgrade to Combo. Save ₹98
                        </p>
                        <p style={{
                          fontFamily: "GreycliffCF, Inter, sans-serif",
                          fontSize: "0.7rem", color: "#1A0D04", opacity: 0.55, margin: 0,
                        }}>
                          Switch to the Combo Pack at ₹799 instead of ₹897
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          clear();
                          add("combo-pack");
                        }}
                        style={{
                          fontFamily: "GreycliffCF, Inter, sans-serif", fontWeight: 600,
                          fontSize: "0.75rem", background: "none", cursor: "pointer",
                          color: "#9B1E15", textDecoration: "none",
                          border: "1.5px solid #9B1E15", borderRadius: 4,
                          padding: "6px 12px", flexShrink: 0, whiteSpace: "nowrap",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#9B1E15"; e.currentTarget.style.color = "#FFF3D7"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9B1E15"; }}
                      >
                        Upgrade
                      </button>
                    </div>
                  )}

                  {/* Spacer */}
                  <div style={{ height: 16 }} />
                </>
              )}
            </div>

            {/* ── FOOTER (only in filled state) ── */}
            {!isEmpty && (
              <div style={{ flexShrink: 0 }}>
                <DottedDivider />
                <div style={{ padding: "16px 24px 24px" }}>
                  {/* Checkout button */}
                  <button
                    onClick={goToCheckout}
                    style={{
                      width: "100%", padding: "15px 20px",
                      background: "#9B1E15", color: "#FFF3D7",
                      border: "none", borderRadius: 6, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: 14, transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#7a1710")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#9B1E15")}
                  >
                    <span style={{
                      fontFamily: "Afacad, Arial, sans-serif", fontWeight: 700,
                      fontSize: "0.95rem", letterSpacing: "0.02em",
                    }}>
                      Secure Checkout · ₹{subtotal}
                    </span>
                    <Image
                      src="/images/payment-options.png"
                      alt="Visa Mastercard GPay PhonePe"
                      width={100} height={24}
                      style={{ height: 22, width: "auto", objectFit: "contain" }}
                    />
                  </button>

                  {/* WhatsApp */}
                  <div style={{ textAlign: "center" }}>
                    <a
                      href="https://wa.me/918850816448?text=Hi%20Mirchi%20O%20Mirchi%20%E2%80%94%20I%20want%20to%20order%20%F0%9F%8C%B6%EF%B8%8F"
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        fontFamily: "GreycliffCF, Inter, sans-serif",
                        fontSize: "0.78rem", color: "#1A0D04", opacity: 1,
                        textDecoration: "none",
                      }}
                    >
                      Prefer WhatsApp?{" "}
                      <span style={{ color: "#9B1E15", textDecoration: "underline" }}>Order via chat →</span>
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