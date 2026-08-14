"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { SITE_WHATSAPP_NUMBER } from "@/lib/site";
import { NAV_SCROLL_OFFSET } from "@/components/SmoothScroll";
import { useModalA11y } from "@/lib/use-modal-a11y";

const NAV_LINKS = [
  { label: "Shop",        href: "/shop" },
  { label: "Our Story",   href: "/about" },
  { label: "Recipes",     href: "/#recipes" },
  { label: "Ingredients", href: "/#ingredients" },
];

const BULK_WHATSAPP_HREF = `https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Mirchi O Mirchi — I'm interested in a bulk order \u{1F336}️"
)}`;

// Shared small-caps nav typography — distinct from the content type scale
// (text-h1..text-btn) since nav chrome is compact/all-caps by design, not
// editorial copy. One class here instead of repeating the same five
// utilities on every link/button below.
const NAV_ITEM_CLASS =
  "font-quirk font-medium text-[0.88rem] tracking-[0.01em] uppercase text-dark hover:text-red transition-colors duration-200";

// Recipes/Ingredients are same-page anchors ("/#recipes", "/#ingredients").
// When already on the homepage, a plain Link click doesn't cleanly land on
// the section — Lenis owns scroll position and fights the browser's native
// hash jump (see SmoothScroll.tsx). So on the homepage we intercept the
// click and drive the scroll through Lenis directly; navigating in from
// another page is left alone since SmoothScroll's own route-change effect
// picks up the hash once the homepage mounts.
function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;
  if (typeof window === "undefined" || window.location.pathname !== "/") return;

  const id = href.slice(hashIndex + 1);
  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset: -NAV_SCROLL_OFFSET });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function CartIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { itemCount, openCart } = useCart();
  const bulkDialogRef = useModalA11y(bulkOpen, () => setBulkOpen(false));

  // Hide the bar on scroll-down, bring it back on the very next scroll-up —
  // a small threshold keeps trackpad/momentum jitter from flickering it,
  // and it's always forced visible near the top of the page.
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (currentY < 80) {
          setNavHidden(false);
        } else if (delta > 4) {
          setNavHidden(true);
        } else if (delta < -4) {
          setNavHidden(false);
        }

        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the bar visible whenever the mobile menu or bulk popup is open —
  // hiding it mid-interaction would be disorienting.
  const isHidden = navHidden && !menuOpen && !bulkOpen;

  return (
    <>
      {/* ── NAV BAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] bg-cream transition-transform duration-300 ease-out ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Shared dotted-divider pattern — also reused by CtaBanner. */}
        <div aria-hidden className="dotted-divider absolute bottom-0 left-0 right-0 pointer-events-none" />

        <div className="w-full max-w-[1400px] mx-auto px-5 md:px-6 lg:px-9 flex items-center justify-between gap-3 h-[68px]">
          {/* Logo — shrink-0 so it never loses ground to the nav links/cart
              group on medium (tablet/small-laptop) widths, where all three
              groups are fighting for the same row. */}
          <Link href="/" aria-label="Mirchi O Mirchi — home" className="shrink-0">
            <Image
              src="/MOM_logo.svg"
              alt="Mirchi O Mirchi"
              width={130}
              height={56}
              priority
              className="h-9 w-auto"
            />
          </Link>

          {/* ── DESKTOP CENTER NAV ── */}
          {/* flex-1 + justify-center (rather than a fixed gap sitting between
              two other fixed-width groups) lets this group genuinely shrink
              its own gap first as the viewport narrows, instead of the whole
              row overflowing/wrapping on ~1024–1280px laptop widths. */}
          <div className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-4 lg:gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className={`${NAV_ITEM_CLASS} whitespace-nowrap`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── DESKTOP RIGHT ── */}
          <div className="hidden md:flex items-center gap-3 lg:gap-5 shrink-0">
            <button type="button" onClick={() => setBulkOpen(true)} className={`${NAV_ITEM_CLASS} whitespace-nowrap bg-transparent border-none cursor-pointer p-0`}>
              Bulk Orders
            </button>

            <div className="w-px h-4 bg-dark/20" aria-hidden="true" />

            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-dark hover:text-red transition-colors duration-200"
            >
              <CartIcon />
              <span className="font-quirk font-medium text-[0.78rem] tracking-[0.1em]">({itemCount})</span>
            </button>
          </div>

          {/* ── MOBILE RIGHT ── */}
          <div className="md:hidden flex items-center gap-4">
            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              className="relative bg-transparent border-none cursor-pointer text-dark"
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red text-cream text-[9px] font-bold font-quirk flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-0.5"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-[22px] h-0.5 bg-dark transition-all duration-300"
                  style={{
                    transform:
                      i === 0 && menuOpen
                        ? "rotate(45deg) translateY(7px)"
                        : i === 2 && menuOpen
                          ? "rotate(-45deg) translateY(-7px)"
                          // The middle bar doesn't just fade — it also
                          // collapses to zero width. Opacity alone left a
                          // faint sliver of it visible between the two
                          // rotated bars; scaling it away too makes sure
                          // there's nothing left to show regardless.
                          : i === 1 && menuOpen
                            ? "scaleX(0)"
                            : "none",
                    opacity: i === 1 && menuOpen ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 top-[68px] z-[99] bg-cream flex flex-col items-center justify-center gap-9"
          >
            {[...NAV_LINKS, { label: "Bulk Orders", href: "#bulk" }].map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                {link.href === "#bulk" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setBulkOpen(true);
                    }}
                    className="font-quirk font-medium text-[2.2rem] tracking-[0.04em] uppercase text-dark bg-transparent border-none cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      setMenuOpen(false);
                      handleAnchorClick(e, link.href);
                    }}
                    className="font-quirk font-medium text-[2.2rem] tracking-[0.04em] uppercase text-dark"
                  >
                    {link.label}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BULK ORDERS POPUP ── */}
      <AnimatePresence>
        {bulkOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBulkOpen(false)}
              className="fixed inset-0 z-[200] bg-dark/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              ref={bulkDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="bulk-orders-title"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="fixed top-1/2 left-1/2 z-[201] -translate-x-1/2 -translate-y-1/2 bg-cream border-[1.5px] border-cream-dark py-12 px-10 max-w-[440px] w-[90vw] text-center shadow-[0_24px_64px_rgba(26,13,4,0.18)] outline-none"
            >
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-5 bg-transparent border-none cursor-pointer text-dark/35 text-lg leading-none"
              >
                ✕
              </button>

              <div className="text-4xl mb-3.5">🌶️</div>

              <h3 id="bulk-orders-title" className="text-h4 font-bold text-dark mb-2.5">Bulk Orders</h3>
              <p className="text-body text-dark/65 leading-relaxed mb-7">
                Weddings, corporates, gifting — we do it all. Drop us a message on WhatsApp and we&apos;ll get you sorted.
              </p>

              <a
                href={BULK_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="font-quirk inline-flex items-center gap-2.5 bg-[#25D366] text-white font-bold text-[0.85rem] tracking-[0.07em] uppercase no-underline px-8 py-3.5"
              >
                <WaIcon /> Chat on WhatsApp
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
