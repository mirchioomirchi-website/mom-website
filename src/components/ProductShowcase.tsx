"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useCart } from "@/lib/cart-context";

const PRODUCTS = [
  {
    slug: "green-chilli-thecha",
    name: "Green Chilli",
    subtitle: "Thecha",
    tagline: "Fresh. Garlicky. Addictive.",
    description:
      "Hand-pounded green chillies, fresh garlic and olive oil. The OG — fresh, garlicky and dangerously addictive.",
    image: "/images/jar-green-final.webp",
    color: "#7BB55E",
    accentRgb: "123, 181, 94",
    speech: "Classy. Sassy. Thodi bad-assy.",
  },
  {
    slug: "red-chilli-thecha",
    name: "Red Chilli",
    subtitle: "Thecha",
    tagline: "Bold. Fiery. Garlicky.",
    description:
      "Whole red chillies, fresh garlic and olive oil. A bold red thecha with fiery heat, a garlicky kick and a heat that builds.",
    image: "/images/jar-red-final.webp",
    color: "#E53935",
    accentRgb: "229, 57, 53",
    speech: "Too hot to handle, baby.",
  },
  {
    slug: "mixed-chilli-thecha",
    name: "Mixed Chilli",
    subtitle: "Thecha",
    tagline: "Punchy. Complex. Full Power.",
    description:
      "Green and red chillies, fresh garlic and olive oil come together in one full-flavour thecha — bright, bold, layered and made for people who want the best of both mirchis.",
    image: "/images/jar-mixed-final.webp",
    color: "#FF9A1E",
    accentRgb: "255, 154, 30",
    speech: "Mirchi lagi toh? IDGAFlying Chappal!",
  },
];

function lerp(p: number, stops: number[], values: number[]) {
  if (p <= stops[0]) return values[0];
  if (p >= stops[stops.length - 1]) return values[values.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (p >= stops[i] && p <= stops[i + 1]) {
      const t = (p - stops[i]) / (stops[i + 1] - stops[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return values[values.length - 1];
}

function plateau(p: number, center: number, halfFlat: number, halfFade: number) {
  const d = Math.abs(p - center);
  if (d <= halfFlat) return 1;
  if (d >= halfFlat + halfFade) return 0;
  const t = (d - halfFlat) / halfFade;
  return Math.cos((t * Math.PI) / 2) ** 2;
}

const HALF_FLAT = 0.08;
const HALF_FADE = 0.22;
const CENTERS = [0, 0.5, 1];
const RGB = [
  [123, 181, 94],
  [229, 57, 53],
  [255, 154, 30],
];

export default function ProductShowcase() {
  const outerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const jarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { add } = useCart();

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // Last-applied state so we can skip redundant DOM writes — Lenis fires the
  // scroll change event on every frame even when nothing meaningful changed.
  const lastGlowRef = useRef({ r: -1, g: -1, b: -1 });

  const apply = (progress: number) => {
    const rawWeights = CENTERS.map((c) => plateau(progress, c, HALF_FLAT, HALF_FADE));
    const wSum = rawWeights.reduce((a, b) => a + b, 0) || 1;
    const weights = rawWeights.map((w) => w / wSum);

    const glowR = Math.round(
      RGB[0][0] * weights[0] + RGB[1][0] * weights[1] + RGB[2][0] * weights[2]
    );
    const glowG = Math.round(
      RGB[0][1] * weights[0] + RGB[1][1] * weights[1] + RGB[2][1] * weights[2]
    );
    const glowB = Math.round(
      RGB[0][2] * weights[0] + RGB[1][2] * weights[1] + RGB[2][2] * weights[2]
    );

    // Only rebuild the radial-gradient string if any RGB channel moved
    // ≥3 units — sub-3 deltas are invisible but cost a re-parse + paint
    // on a 140vw × 140vh element every frame.
    const last = lastGlowRef.current;
    if (
      glowRef.current &&
      (Math.abs(glowR - last.r) >= 3 ||
        Math.abs(glowG - last.g) >= 3 ||
        Math.abs(glowB - last.b) >= 3)
    ) {
      glowRef.current.style.background = `radial-gradient(circle at 50% 55%, rgba(${glowR},${glowG},${glowB},0.28) 0%, rgba(${glowR},${glowG},${glowB},0.08) 38%, transparent 68%)`;
      lastGlowRef.current = { r: glowR, g: glowG, b: glowB };
    }

    for (let i = 0; i < CENTERS.length; i++) {
      const center = CENTERS[i];
      const segmentWidth = 0.5;
      const local = (progress - center) / segmentWidth;
      const visibility = rawWeights[i];

      const jar = jarRefs.current[i];
      if (jar) {
        const y =
          lerp(Math.abs(local), [0, 0.5, 1], [0, 8, 35]) *
          (local > 0 ? -1 : 1);
        const scale = lerp(Math.abs(local), [0, 1], [1, 0.7]);
        const rotate = local * -8;
        const blur = lerp(Math.abs(local), [0, 0.6, 1], [0, 0, 8]);
        jar.style.opacity = String(visibility);
        // translate3d forces GPU layer; cheaper than translateY + scale + rotate composed
        jar.style.transform = `translate3d(0, ${y}%, 0) scale(${scale}) rotate(${rotate}deg)`;
        jar.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "";
        jar.style.zIndex = String(10 + Math.round(visibility * 10));
      }

      const copy = copyRefs.current[i];
      if (copy) {
        const x = local * 50;
        copy.style.opacity = String(visibility);
        copy.style.transform = `translate3d(${x}%, 0, 0)`;
        copy.style.pointerEvents = visibility > 0.5 ? "auto" : "none";
      }

      const dot = dotRefs.current[i];
      if (dot) {
        dot.style.width = `${(24 + visibility * 16).toFixed(0)}px`;
        dot.style.background = `rgba(${RGB[i][0]},${RGB[i][1]},${RGB[i][2]},${(0.3 + visibility * 0.7).toFixed(2)})`;
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
      className="relative h-[260vh] md:h-[350vh] bg-mom-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vh] pointer-events-none"
        />

        <div className="relative z-30 pt-[8vh] md:pt-[11vh] pb-[1vh] md:pb-[2vh] text-center pointer-events-none">
          <p className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/45 mb-1.5 md:mb-2">
            Three flavours
          </p>
          <h2 className="text-[8vw] md:text-[4.2vw] font-quirk uppercase leading-none">
            <span className="text-gradient-pink">Pick Your Mirchi.</span>
          </h2>
        </div>

        {/* Mobile: vertical stack with compact jar on top + tight copy below.
            Desktop: 2-column with large jar on left + copy on right. */}
        <div className="relative flex-1 z-10 pointer-events-none">
          <div className="w-full max-w-[1400px] h-full mx-auto px-5 md:px-12 pb-[6vh] md:pb-[8vh] flex flex-col md:grid md:grid-cols-2 md:gap-8 md:items-center">
            {/* JAR LANE */}
            <div className="relative w-full flex items-center justify-center md:justify-start basis-[42%] md:basis-auto md:h-full">
              {PRODUCTS.map((p, i) => (
                <div
                  key={p.name}
                  ref={(el) => {
                    jarRefs.current[i] = el;
                  }}
                  className="absolute will-change-transform"
                  style={{ opacity: 0 }}
                >
                  <Image
                    src={p.image}
                    alt={p.name + " " + p.subtitle}
                    width={700}
                    height={937}
                    priority={i === 0}
                    sizes="(max-width: 768px) 60vw, 600px"
                    // Reduced drop-shadow radius (60 → 28) — same depth read,
                    // ~half the GPU filter cost per transformed paint.
                    className="h-[32vh] md:h-[78vh] max-h-[700px] w-auto object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]"
                  />
                </div>
              ))}
            </div>

            {/* COPY LANE */}
            <div className="relative w-full flex items-start md:items-center basis-[58%] md:basis-auto md:h-full mt-2 md:mt-0">
              {PRODUCTS.map((p, i) => (
                <div
                  key={p.name}
                  ref={(el) => {
                    copyRefs.current[i] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center px-1 md:px-0 will-change-transform"
                  style={{ opacity: 0 }}
                >
                  <p
                    className="text-[10px] md:text-[12px] uppercase tracking-[0.35em] md:tracking-[0.5em] mb-1.5 md:mb-3"
                    style={{ color: p.color }}
                  >
                    {p.subtitle}
                  </p>
                  <h3
                    className="text-[11vw] md:text-[5.5vw] font-quirk leading-[0.9] mb-2 md:mb-3 uppercase"
                    style={{ color: p.color }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-[11px] md:text-base font-quirk uppercase tracking-[0.15em] mb-2.5 md:mb-5"
                    style={{ color: `rgba(${p.accentRgb}, 0.9)` }}
                  >
                    {p.tagline}
                  </p>
                  <p className="hidden md:block text-base text-white/60 leading-relaxed max-w-md mb-6">
                    {p.description}
                  </p>
                  <div
                    className="inline-block self-start px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-[12px] uppercase tracking-[0.25em] md:tracking-[0.3em] font-quirk mb-4 md:mb-5"
                    style={{
                      background: `rgba(${p.accentRgb}, 0.12)`,
                      border: `1px solid rgba(${p.accentRgb}, 0.4)`,
                      color: p.color,
                    }}
                  >
                    {p.speech}
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    <button
                      onClick={() => add(p.slug)}
                      className="px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-[0.18em] font-quirk text-white transition-opacity duration-300 hover:opacity-90 cursor-pointer whitespace-nowrap"
                      style={{ background: p.color }}
                    >
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${p.slug}`}
                      className="px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-[0.18em] font-quirk transition-colors duration-300 border hover:bg-white/[0.04] cursor-pointer whitespace-nowrap"
                      style={{
                        color: p.color,
                        borderColor: `rgba(${p.accentRgb}, 0.3)`,
                      }}
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 md:gap-3 z-30">
          {PRODUCTS.map((p, i) => (
            <div
              key={p.name}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="h-[3px] rounded-full"
              style={{
                width: "24px",
                background: `rgba(${p.accentRgb}, 0.3)`,
                transition: "width 200ms ease-out, background 200ms ease-out",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
