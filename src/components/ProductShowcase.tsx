"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { PDP_ACCENT_COLOR, type Product } from "@/lib/products";

// Presentation-only extras that don't belong in the shared checkout-critical
// products.ts (dark showcase background + rotation frame count). Keyed by
// flavor so this stays in sync automatically if a slug is renamed. Frame
// images in public/images/jar-frames are true transparent (alpha) cutouts of
// the real multi-angle jar photography, so bgDark just needs to be a
// good-looking backdrop — no pixel-matching required. The Devanagari name
// used to live here too but now comes live from Shopify (product.nameHi).
const SHOWCASE_EXTRAS: Record<string, { bgDark: string; frames: number }> = {
  green: { bgDark: "#114A22", frames: 14 },
  red: { bgDark: "#9B1E15", frames: 11 },
  mixed: { bgDark: "#B44800", frames: 14 },
};

function framePath(flavor: string, n: number) {
  return `/images/jar-frames/${flavor}-${n}.webp`;
}

function plateau(p: number, center: number, halfFlat: number, halfFade: number) {
  const d = Math.abs(p - center);
  if (d <= halfFlat) return 1;
  if (d >= halfFlat + halfFade) return 0;
  const t = (d - halfFlat) / halfFade;
  return Math.cos((t * Math.PI) / 2) ** 2;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}

// Underlined step control (not a pill/rounded box) — matches the design
// reference exactly: "− 1 +" sitting on a single underline, no fill/border
// box around it. Replaces the CTA in place once a product has been added.
function QtyStepper({
  qty,
  onDecrease,
  onIncrease,
}: {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-4 md:gap-5 border-b-2 border-cream/40 pb-1.5">
      <button
        type="button"
        onClick={onDecrease}
        className="text-2xl md:text-3xl leading-none text-cream/80 hover:text-cream transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-5 text-center font-quirk font-bold text-lg md:text-xl text-cream">
        {qty}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="text-2xl md:text-3xl leading-none text-cream/80 hover:text-cream transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

// Standard rectangular Add to Cart CTA — same shape/weight used everywhere
// else on the site (shop grid, PDP), on the brand yellow (#F8B532) so it
// reads clearly against every dark per-flavor backdrop. The label color is
// per-product (same accent used for PDP details/marquee text) so it shifts
// as the shopper scrolls between flavours, instead of a single fixed color.
function AddToCartCta({ onClick, accentColor }: { onClick: () => void; accentColor: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-btn font-bold inline-flex items-center justify-center bg-yellow px-7 py-3.5 md:px-8 md:py-4 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
      style={{ color: accentColor }}
    >
      Add to Cart
    </button>
  );
}

export default function ProductShowcase({ products }: { products: Product[] }) {
  const flavours = products.filter((p) => !p.isCombo).slice(0, 3);
  const N = flavours.length;
  const segWidth = N > 0 ? 1 / N : 1;
  const centers = flavours.map((_, i) => i * segWidth + segWidth / 2);
  const rgbDark = flavours.map((p) => hexToRgb(SHOWCASE_EXTRAS[p.flavor]?.bgDark ?? "#1A0D04"));
  const frameCounts = flavours.map((p) => SHOWCASE_EXTRAS[p.flavor]?.frames ?? 1);

  const outerRef = useRef<HTMLDivElement>(null);
  const sectionBgRef = useRef<HTMLDivElement>(null);
  const jarWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const jarFrameRefs = useRef<(HTMLImageElement | null)[][]>(flavours.map(() => []));
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(-1);
  const lastFrameIdxRef = useRef<number[]>(flavours.map(() => -1));
  const { add, setQty, lines } = useCart();

  const qtyForSlug = (slug: string) => lines.find((l) => l.slug === slug)?.qty ?? 0;

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  const lastBgRef = useRef({ r: -1, g: -1, b: -1 });

  const apply = (progress: number) => {
    const rawWeights = centers.map((c) => plateau(progress, c, segWidth * 0.24, segWidth * 0.55));
    const wSum = rawWeights.reduce((a, b) => a + b, 0) || 1;
    const weights = rawWeights.map((w) => w / wSum);

    let bgR = 0;
    let bgG = 0;
    let bgB = 0;
    for (let i = 0; i < rgbDark.length; i++) {
      bgR += rgbDark[i][0] * weights[i];
      bgG += rgbDark[i][1] * weights[i];
      bgB += rgbDark[i][2] * weights[i];
    }
    bgR = Math.round(bgR);
    bgG = Math.round(bgG);
    bgB = Math.round(bgB);

    const last = lastBgRef.current;
    if (
      sectionBgRef.current &&
      (Math.abs(bgR - last.r) >= 2 || Math.abs(bgG - last.g) >= 2 || Math.abs(bgB - last.b) >= 2)
    ) {
      sectionBgRef.current.style.backgroundColor = `rgb(${bgR}, ${bgG}, ${bgB})`;
      lastBgRef.current = { r: bgR, g: bgG, b: bgB };
    }

    // Text is static — it doesn't slide or continuously crossfade. It just
    // snaps to whichever product currently has the most scroll weight, with
    // a short opacity+lift transition (see the CSS transition classes below)
    // so the swap reads as a soft settle-in rather than an abrupt cut.
    let activeIndex = 0;
    let bestWeight = -1;
    for (let i = 0; i < rawWeights.length; i++) {
      if (rawWeights[i] > bestWeight) {
        bestWeight = rawWeights[i];
        activeIndex = i;
      }
    }
    if (activeIndex !== activeIndexRef.current) {
      activeIndexRef.current = activeIndex;
      for (let i = 0; i < flavours.length; i++) {
        const isActive = i === activeIndex;
        const title = titleRefs.current[i];
        if (title) {
          title.style.opacity = isActive ? "1" : "0";
          title.style.transform = isActive ? "translateY(0)" : "translateY(6px)";
          title.style.pointerEvents = isActive ? "auto" : "none";
        }
        const detail = detailRefs.current[i];
        if (detail) {
          detail.style.opacity = isActive ? "1" : "0";
          detail.style.transform = isActive ? "translateY(0)" : "translateY(6px)";
          detail.style.pointerEvents = isActive ? "auto" : "none";
        }
        // Jar sits in one fixed center position the whole time — it never
        // slides or blurs. It just appears in place once it becomes the
        // active product, then cycles through its own rotation frames as
        // the user keeps scrolling (see the frame-index loop below).
        const wrapper = jarWrapperRefs.current[i];
        if (wrapper) {
          wrapper.style.opacity = isActive ? "1" : "0";
          wrapper.style.zIndex = isActive ? "2" : "1";
        }
      }
    }

    for (let i = 0; i < centers.length; i++) {
      const segStart = i * segWidth;
      const visibility = rawWeights[i];

      // t sweeps 0→1 across this product's own dedicated third of the
      // scroll track — this drives the real rotation frame index, so the
      // jar keeps turning as the user scrolls through its segment.
      const t = Math.max(0, Math.min(1, (progress - segStart) / segWidth));

      const frameCount = frameCounts[i];
      const frameIdx = Math.max(0, Math.min(frameCount - 1, Math.round(t * (frameCount - 1))));
      if (frameIdx !== lastFrameIdxRef.current[i]) {
        const frames = jarFrameRefs.current[i];
        const prevIdx = lastFrameIdxRef.current[i];
        if (prevIdx >= 0 && frames[prevIdx]) frames[prevIdx]!.style.opacity = "0";
        if (frames[frameIdx]) frames[frameIdx]!.style.opacity = "1";
        lastFrameIdxRef.current[i] = frameIdx;
      }

      const dot = dotRefs.current[i];
      if (dot) {
        dot.style.width = `${(24 + visibility * 16).toFixed(0)}px`;
        dot.style.background = `rgba(${rgbDark[i][0]},${rgbDark[i][1]},${rgbDark[i][2]},${(0.4 + visibility * 0.6).toFixed(2)})`;
      }
    }
  };

  useMotionValueEvent(scrollYProgress, "change", apply);

  useEffect(() => {
    apply(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="flavours"
      ref={outerRef}
      className="relative h-[200vh] md:h-[240vh]"
    >
      <div
        ref={sectionBgRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col"
        style={{ backgroundColor: SHOWCASE_EXTRAS[flavours[0]?.flavor]?.bgDark ?? "#114A22" }}
      >
        <div className="relative flex-1 z-10 pointer-events-none">
          <div className="w-full max-w-[1400px] h-full mx-auto px-5 md:px-9 pt-[13vh] md:pt-0 flex flex-col md:grid md:grid-cols-[1fr_1.1fr_1fr] md:gap-14 lg:gap-20 md:items-center">
            {/* TITLE LANE — name, Hindi name, price + size (live from Shopify) */}
            <div className="relative w-full flex items-center justify-center md:justify-start h-[17vh] mb-8 md:mb-0 md:basis-auto md:h-full order-1 md:order-1">
              {flavours.map((p, i) => (
                <div
                  key={p.slug}
                  ref={(el) => {
                    titleRefs.current[i] = el;
                  }}
                  className="absolute inset-0 flex flex-col items-center md:items-start justify-center text-center md:text-left transition-[opacity,transform] duration-300 ease-out"
                  style={{ opacity: 0 }}
                >
                  <h3 className="text-[7.5vw] md:text-[2.7vw] font-quirk leading-[1.15] uppercase text-cream">
                    {p.name}
                  </h3>
                  {p.nameHi && (
                    <p className="font-sura text-[17px] md:text-[22px] text-cream/70 mt-2 md:mt-3.5">
                      {p.nameHi}
                    </p>
                  )}
                  <p className="font-quirk font-bold text-cream text-xl md:text-2xl mt-4 md:mt-6">
                    ₹{p.price}
                    <span className="text-cream/40 text-sm md:text-base font-normal">
                      {" "}
                      /{p.weight.replace("g", "G")}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* JAR LANE — real per-flavor rotation photography, frame-swapped on scroll */}
            <div className="relative w-full flex items-center justify-center h-[32vh] md:basis-auto md:h-full order-2 md:order-2">
              {flavours.map((p, i) => {
                const frameCount = frameCounts[i];
                return (
                  <div
                    key={p.slug}
                    ref={(el) => {
                      jarWrapperRefs.current[i] = el;
                    }}
                    className="absolute inset-0 m-auto h-[32vh] md:h-[60vh] max-h-[600px] aspect-[800/1105]"
                    style={{ opacity: 0 }}
                  >
                    {Array.from({ length: frameCount }).map((_, f) => (
                      <Image
                        key={f}
                        ref={(el) => {
                          jarFrameRefs.current[i][f] = el;
                        }}
                        src={framePath(p.flavor, f + 1)}
                        alt={p.name}
                        fill
                        priority={i === 0 && f === 0}
                        unoptimized
                        className="object-contain"
                        style={{ opacity: f === 0 ? 1 : 0 }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* DETAIL LANE — flavour title (desktop only), description (desktop
                only), CTA/qty + Learn more. pointer-events is intentionally
                NOT set on any element in here — it's controlled entirely by
                the ref-toggled inline style on the wrapper below, so only the
                currently-active product's buttons/links are clickable. Adding
                pointer-events-auto here would make all three stacked panes
                clickable at once and every click would hit whichever one is
                topmost in the DOM (a bug we hit once already — don't reintroduce it). */}
            <div className="relative w-full flex items-start md:items-center h-[22vh] md:basis-auto md:h-full order-3 md:order-3">
              {flavours.map((p, i) => {
                const qty = qtyForSlug(p.slug);
                return (
                  <div
                    key={p.slug}
                    ref={(el) => {
                      detailRefs.current[i] = el;
                    }}
                    className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left px-2 md:px-0 transition-[opacity,transform] duration-300 ease-out"
                    style={{ opacity: 0 }}
                  >
                    <p
                      className="hidden md:block font-quirk font-bold text-lg md:text-2xl uppercase tracking-[0.1em] mb-3 md:mb-5"
                      style={{ color: "#FFF3D7" }}
                    >
                      {p.tagline}
                    </p>
                    <p className="hidden md:block text-body leading-relaxed text-cream/60 max-w-xs md:max-w-sm mb-6">
                      {p.description}
                    </p>
                    <div className="flex items-center gap-5 md:gap-7">
                      {qty > 0 ? (
                        <QtyStepper
                          qty={qty}
                          onDecrease={() => setQty(p.slug, qty - 1)}
                          onIncrease={() => setQty(p.slug, qty + 1)}
                        />
                      ) : (
                        <AddToCartCta
                          onClick={() => add(p.slug, 1)}
                          accentColor={PDP_ACCENT_COLOR[p.flavor]}
                        />
                      )}
                      <Link
                        href={`/products/${p.slug}`}
                        className="text-btn text-cream underline decoration-cream/50 decoration-2 underline-offset-4 hover:decoration-cream transition-colors"
                      >
                        Learn more →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 md:gap-3 z-30">
          {flavours.map((p, i) => (
            <div
              key={p.slug}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="h-[3px] rounded-full"
              style={{
                width: "24px",
                background: `rgba(${rgbDark[i][0]},${rgbDark[i][1]},${rgbDark[i][2]},0.4)`,
                transition: "width 200ms ease-out, background 200ms ease-out",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
