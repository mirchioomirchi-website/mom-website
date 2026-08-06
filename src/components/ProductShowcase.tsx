"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

// Presentation-only extras that don't belong in the shared checkout-critical
// products.ts (dark showcase background + Devanagari subtitle + rotation
// frame count). Keyed by flavor so this stays in sync automatically if a
// slug is renamed. Frame images in public/images/jar-frames are true
// transparent (alpha) cutouts of the real multi-angle jar photography, so
// bgDark just needs to be a good-looking backdrop — no pixel-matching
// required, unlike a flattened/baked-background crop.
const SHOWCASE_EXTRAS: Record<string, { bgDark: string; devanagari: string; frames: number }> = {
  green: { bgDark: "#114A22", devanagari: "मिर्ची चा ठेचा", frames: 14 },
  red: { bgDark: "#9B1E15", devanagari: "मिर्ची चा ठेचा", frames: 11 },
  mixed: { bgDark: "#B44800", devanagari: "मिर्ची चा ठेचा", frames: 14 },
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

// Small crescent "chili pod" glyph used for the spice-level indicator —
// matches the curved icon row in the design reference (not a simple dot).
function ChiliIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 1.5C3.5 1.5 10.5 4.8 10.5 10C10.5 15.2 3.5 18.5 3.5 18.5C3.5 18.5 7.8 13.2 7.8 10C7.8 6.8 3.5 1.5 3.5 1.5Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={filled ? 0 : 1.3}
        opacity={filled ? 1 : 0.4}
      />
    </svg>
  );
}

function QtyStepper({
  qty,
  setQty,
  color,
}: {
  qty: number;
  setQty: (fn: (q: number) => number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center bg-white/[0.08] border border-white/15 rounded-full">
      <button
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="w-9 h-10 md:w-10 md:h-11 text-white/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center font-quirk text-sm md:text-base" style={{ color }}>
        {qty}
      </span>
      <button
        onClick={() => setQty((q) => q + 1)}
        className="w-9 h-10 md:w-10 md:h-11 text-white/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

// "Boom" starburst Add to Cart button — the exact pink shape supplied in the
// design assets, with the label overlaid on top instead of a plain pill.
function BoomAddToCart({ onClick }: { onClick: () => void }) {
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        if (timerRef.current) clearTimeout(timerRef.current);
        setAdded(true);
        timerRef.current = setTimeout(() => setAdded(false), 1200);
      }}
      aria-label="Add to cart"
      className="relative w-[118px] h-[60px] md:w-[145px] md:h-[74px] shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      <svg viewBox="0 0 145 74" className="absolute inset-0 w-full h-full">
        <path
          d="M61.5225 13.6456L75.9025 0L89.5126 19.0001L123.014 10.5L121.444 30.0001L145 37.0001L114.116 49.5002L120.397 66.0002L83.1856 56.504L65.9567 74L57.366 55.3234L16.7509 61.0002L23.556 46.0001L0 31.4999L29.8375 26.5001L22.509 10L61.5225 13.6456Z"
          fill="var(--color-pink)"
        />
      </svg>
      <span className="relative z-10 flex items-center justify-center w-full h-full text-white text-[9px] md:text-[10.5px] font-quirk font-bold uppercase tracking-[0.06em] leading-none px-3 text-center">
        {added ? "Added!" : "Add to Cart"}
      </span>
    </button>
  );
}

export default function ProductShowcase({ products }: { products: Product[] }) {
  const flavours = products.filter((p) => !p.isCombo).slice(0, 3);
  const N = flavours.length;
  const segWidth = N > 0 ? 1 / N : 1;
  const centers = flavours.map((_, i) => i * segWidth + segWidth / 2);
  const rgbDark = flavours.map((p) => hexToRgb(SHOWCASE_EXTRAS[p.flavor]?.bgDark ?? p.color));
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
  const { add } = useCart();
  const [qtys, setQtys] = useState<number[]>(() => flavours.map(() => 1));

  const setQtyAt = (i: number, fn: (q: number) => number) => {
    setQtys((prev) => {
      const next = [...prev];
      next[i] = fn(prev[i] ?? 1);
      return next;
    });
  };

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
    // snaps to whichever product currently has the most scroll weight.
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
          title.style.pointerEvents = isActive ? "auto" : "none";
        }
        const detail = detailRefs.current[i];
        if (detail) {
          detail.style.opacity = isActive ? "1" : "0";
          detail.style.pointerEvents = isActive ? "auto" : "none";
        }
        // Jar sits in one fixed center position the whole time — it never
        // slides, scales or blurs. It just appears in place once it becomes
        // the active product, then cycles through its own rotation frames
        // as the user keeps scrolling (see the frame-index loop below).
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
      className="relative h-[280vh] md:h-[350vh]"
    >
      <div
        ref={sectionBgRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col"
        style={{ backgroundColor: SHOWCASE_EXTRAS[flavours[0]?.flavor]?.bgDark ?? "#114A22" }}
      >
        <div className="relative flex-1 z-10 pointer-events-none">
          <div className="w-full max-w-[1400px] h-full mx-auto px-5 md:px-9 pt-[7vh] md:pt-0 flex flex-col md:grid md:grid-cols-[1fr_1.1fr_1fr] md:gap-6 md:items-center">
            {/* TITLE LANE — name, Devanagari subtitle, spice level */}
            <div className="relative w-full flex items-center justify-center md:justify-start h-[16vh] md:basis-auto md:h-full order-1 md:order-1">
              {flavours.map((p, i) => {
                const extra = SHOWCASE_EXTRAS[p.flavor];
                return (
                  <div
                    key={p.slug}
                    ref={(el) => {
                      titleRefs.current[i] = el;
                    }}
                    className="absolute inset-0 flex flex-col items-center md:items-start justify-center text-center md:text-left transition-opacity duration-200"
                    style={{ opacity: 0 }}
                  >
                    <h3 className="text-[9vw] md:text-[3.2vw] font-quirk leading-[0.92] uppercase text-cream">
                      {p.name}
                    </h3>
                    {extra && (
                      <p className="font-sura text-[13px] md:text-[16px] text-cream/65 mt-1.5 md:mt-3">
                        {extra.devanagari}
                      </p>
                    )}
                    <div className="flex gap-1.5 mt-3 md:mt-5">
                      {Array.from({ length: 5 }).map((_, d) => (
                        <ChiliIcon key={d} filled={d < p.spiceLevel} color={p.color} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* JAR LANE — real per-flavor rotation photography, frame-swapped on scroll */}
            <div className="relative w-full flex items-center justify-center h-[36vh] md:basis-auto md:h-full order-2 md:order-2">
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

            {/* DETAIL LANE — tagline, description, qty (desktop only), price + boom CTA */}
            <div className="relative w-full flex items-start md:items-center h-[34vh] md:basis-auto md:h-full order-3 md:order-3">
              {flavours.map((p, i) => (
                <div
                  key={p.slug}
                  ref={(el) => {
                    detailRefs.current[i] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left px-2 md:px-0 transition-opacity duration-200"
                  style={{ opacity: 0 }}
                >
                  <p
                    className="text-sm md:text-lg font-quirk uppercase tracking-[0.15em] mb-2 md:mb-4"
                    style={{ color: "#FFF3D7" }}
                  >
                    {p.tagline}
                  </p>
                  <p className="block text-body leading-relaxed text-cream/60 max-w-xs md:max-w-sm mb-4 md:mb-6">
                    {p.description}
                  </p>
                  <div className="hidden md:block pointer-events-auto mb-5 md:mb-7">
                    <QtyStepper
                      qty={qtys[i] ?? 1}
                      setQty={(fn) => setQtyAt(i, fn)}
                      color={p.color}
                    />
                  </div>
                  <div className="flex items-center gap-5 md:gap-7 pointer-events-auto">
                    <p className="font-quirk text-cream text-xl md:text-3xl">
                      ₹{p.price}
                      <span className="text-cream/40 text-base md:text-lg"> /{p.weight.replace("g", "G")}</span>
                    </p>
                    <BoomAddToCart onClick={() => add(p.slug, qtys[i] ?? 1)} />
                  </div>
                </div>
              ))}
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
