"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { useScroll, useMotionValueEvent } from "motion/react";

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

const BEATS = [
  {
    image: "/images/character-1-nobg.webp",
    alt: "MOM character 1",
    line1: "Real thecha.",
    line2: "Made fresh.",
    accent: "#7BB55E",
    accentRgb: "123, 181, 94",
    side: "left" as const,
    speech: "Six real ingredients. Read 'em yourself.",
    bgLetter: "M",
  },
  {
    image: "/images/character-2-nobg.webp",
    alt: "MOM character 2",
    line1: "No factory.",
    line2: "No fillers.",
    accent: "#FF9A1E",
    accentRgb: "255, 154, 30",
    side: "right" as const,
    speech: "If grandma can't pronounce it — we don't use it.",
    bgLetter: "O",
  },
  {
    image: "/images/character-3-nobg.webp",
    alt: "MOM character 3",
    line1: "Made for",
    line2: "the bold.",
    accent: "#F5197F",
    accentRgb: "245, 25, 127",
    side: "left" as const,
    speech: "Mirchi lagi? Good. That's the point.",
    bgLetter: "M",
  },
];

const CENTERS = [0.18, 0.5, 0.82];
const HALF_FLAT = 0.08;
const HALF_FADE = 0.18;
const RGB = [
  [123, 181, 94],
  [255, 154, 30],
  [245, 25, 127],
];

export default function CharacterDivider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const charRefs = useRef<(HTMLDivElement | null)[]>([]);
  const speechRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgLetterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const lastGlowRef = useRef({ r: -1, g: -1, b: -1 });

  const apply = (progress: number) => {
    const bgY = lerp(progress, [0, 1], [60, -60]);
    if (bgRef.current) {
      bgRef.current.style.transform = `translate3d(0, ${bgY.toFixed(1)}px, 0)`;
    }

    const rawW = CENTERS.map((c) => plateau(progress, c, HALF_FLAT, HALF_FADE));
    const wSum = rawW.reduce((a, b) => a + b, 0) || 1;
    const w = rawW.map((x) => x / wSum);
    const r = Math.round(RGB[0][0] * w[0] + RGB[1][0] * w[1] + RGB[2][0] * w[2]);
    const g = Math.round(RGB[0][1] * w[0] + RGB[1][1] * w[1] + RGB[2][1] * w[2]);
    const b = Math.round(RGB[0][2] * w[0] + RGB[1][2] * w[1] + RGB[2][2] * w[2]);
    // Skip the gradient rewrite when RGB hasn't moved meaningfully — see
    // ProductShowcase for the same trick.
    const last = lastGlowRef.current;
    if (
      glowRef.current &&
      (Math.abs(r - last.r) >= 3 ||
        Math.abs(g - last.g) >= 3 ||
        Math.abs(b - last.b) >= 3)
    ) {
      glowRef.current.style.background = `radial-gradient(circle at 50% 55%, rgba(${r},${g},${b},0.18) 0%, rgba(${r},${g},${b},0.05) 38%, transparent 68%)`;
      lastGlowRef.current = { r, g, b };
    }

    const eyebrowOpacity = lerp(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
    const descOpacity = lerp(progress, [0, 0.08, 0.92, 1], [0, 0.85, 0.85, 0]);
    if (eyebrowRef.current) eyebrowRef.current.style.opacity = String(eyebrowOpacity);
    if (descRef.current) descRef.current.style.opacity = String(descOpacity);

    for (let i = 0; i < BEATS.length; i++) {
      const center = CENTERS[i];
      const local = (progress - center) / HALF_FADE;
      const visibility = rawW[i];
      const dir = BEATS[i].side === "left" ? -1 : 1;

      const beat = beatRefs.current[i];
      if (beat) {
        beat.style.opacity = String(visibility);
        beat.style.zIndex = String(10 + Math.round(visibility * 10));
      }

      const headline = headlineRefs.current[i];
      if (headline) {
        const headlineY = lerp(local, [-2, 0, 2], [40, 0, -40]);
        const headlineScale = lerp(Math.abs(local), [0, 1.2], [1, 0.92]);
        headline.style.transform = `translateY(${headlineY}px) scale(${headlineScale})`;
      }

      const char = charRefs.current[i];
      if (char) {
        const charX = local < 0
          ? lerp(local, [-1.2, 0], [dir * 80, 0])
          : lerp(local, [0, 1.2], [0, -dir * 70]);
        const charRot = lerp(local, [-1, 0, 1], [dir * -10, 0, dir * 8]);
        const charScale = lerp(Math.abs(local), [0, 0.5, 1.2], [1, 0.96, 0.85]);
        char.style.transform = `translateX(${charX}%) rotate(${charRot}deg) scale(${charScale})`;
      }

      const speech = speechRefs.current[i];
      if (speech) {
        const speechOpacity = lerp(Math.abs(local), [0, 0.4, 0.9], [1, 0.9, 0]);
        const speechScale = local < 0
          ? lerp(local, [-1, -0.3, 0], [0.6, 0.85, 1])
          : lerp(local, [0, 1], [1, 0.9]);
        speech.style.opacity = String(speechOpacity);
        speech.style.transform = `scale(${speechScale})`;
      }

      const dot = dotRefs.current[i];
      if (dot) {
        dot.style.width = `${24 + visibility * 16}px`;
        dot.style.background = `rgba(${RGB[i][0]},${RGB[i][1]},${RGB[i][2]},${0.3 + visibility * 0.7})`;
      }

      // Per-beat ghost letter (M / O / M) fades in with the active beat
      const bgLetter = bgLetterRefs.current[i];
      if (bgLetter) {
        bgLetter.style.opacity = String(visibility);
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
      ref={sectionRef}
      className="relative h-[180vh] md:h-[260vh] bg-mom-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vh] pointer-events-none"
        />

        {/* Per-beat giant ghost letter — together they spell M-O-M as you scroll */}
        <div
          ref={bgRef}
          className="absolute inset-0 pointer-events-none select-none will-change-transform"
        >
          {BEATS.map((b, i) => (
            <div
              key={i}
              ref={(el) => {
                bgLetterRefs.current[i] = el;
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: 0 }}
            >
              <span
                className="font-quirk text-[60vw] md:text-[42vw] uppercase leading-none tracking-tighter"
                style={{ color: `rgba(${b.accentRgb}, 0.06)` }}
              >
                {b.bgLetter}
              </span>
            </div>
          ))}
        </div>

        <div
          ref={eyebrowRef}
          className="absolute top-[6vh] md:top-[12vh] left-0 right-0 text-center z-30 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <p className="text-[11px] md:text-lg uppercase tracking-[0.4em] md:tracking-[0.5em] text-mom-pink font-semibold">
            Why MOM
          </p>
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none">
          {BEATS.map((b, i) => (
            <div
              key={i}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              className="absolute inset-0"
              style={{ opacity: 0 }}
            >
              {/* HEADLINE — top of viewport. Stays clear of character below. */}
              <div
                ref={(el) => {
                  headlineRefs.current[i] = el;
                }}
                className="absolute inset-x-0 top-[10vh] md:top-1/2 md:-translate-y-1/2 flex items-start md:items-center justify-center px-6 will-change-transform"
              >
                <h2 className="text-center font-quirk uppercase leading-[0.92]">
                  <span className="block text-[12vw] md:text-[8vw] text-white">
                    {b.line1}
                  </span>
                  <span
                    className="block text-[12vw] md:text-[8vw]"
                    style={{ color: b.accent }}
                  >
                    {b.line2}
                  </span>
                </h2>
              </div>

              {/* CHARACTER — fills most of the lower viewport on mobile so the section
                  feels populated. Aspect 3:4 means w-[78vw] gives ~104vw height — the
                  character extends from bottom to near the headline. */}
              <div
                ref={(el) => {
                  charRefs.current[i] = el;
                }}
                className={`absolute bottom-0 ${
                  b.side === "left"
                    ? "left-[-12vw] md:left-[6vw]"
                    : "right-[-12vw] md:right-[6vw]"
                } w-[78vw] md:w-[24vw] max-w-[360px] aspect-[3/4] will-change-transform`}
                style={{
                  transformOrigin: b.side === "left" ? "left bottom" : "right bottom",
                  filter: `drop-shadow(0 30px 40px rgba(${b.accentRgb}, 0.25))`,
                }}
              >
                <Image
                  src={b.image}
                  alt={b.alt}
                  fill
                  className="object-contain object-bottom"
                  sizes="(max-width: 768px) 78vw, 24vw"
                />
              </div>

              {/* SPEECH BUBBLE — pinned right next to character's head/upper torso on mobile,
                  visually emerging from the character. */}
              <div
                ref={(el) => {
                  speechRefs.current[i] = el;
                }}
                className={`absolute ${
                  b.side === "left"
                    ? "right-[4vw] md:left-[12vw] md:right-auto top-[34vh] md:top-auto md:bottom-[58vh]"
                    : "left-[4vw] md:right-[12vw] md:left-auto top-[34vh] md:top-auto md:bottom-[58vh]"
                } max-w-[170px] md:max-w-[220px] will-change-transform`}
                style={{
                  transformOrigin: b.side === "left" ? "right bottom" : "left bottom",
                }}
              >
                <div
                  className="relative px-3 py-2 md:px-4 md:py-3 rounded-2xl"
                  style={{
                    background: `rgba(${b.accentRgb}, 0.18)`,
                    border: `1px solid rgba(${b.accentRgb}, 0.45)`,
                  }}
                >
                  <p
                    className="text-[10px] md:text-xs font-quirk uppercase tracking-[0.05em] leading-snug text-center"
                    style={{ color: b.accent }}
                  >
                    {b.speech}
                  </p>
                  <div
                    className={`absolute -bottom-2 ${
                      b.side === "left" ? "right-6 md:left-8 md:right-auto" : "left-6 md:right-8 md:left-auto"
                    } w-0 h-0`}
                    style={{
                      borderLeft: "7px solid transparent",
                      borderRight: "7px solid transparent",
                      borderTop: `9px solid rgba(${b.accentRgb}, 0.45)`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Description — hidden on mobile (would overlap character), shown on desktop */}
        <div
          ref={descRef}
          className="hidden md:block absolute bottom-[10vh] left-0 right-0 text-center px-6 z-30 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            Stone-ground in small batches. The same six ingredients your
            grandmother trusted. No factory, no fillers, no shortcuts.
          </p>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-40">
          {BEATS.map((b, i) => (
            <div
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="h-[3px] rounded-full"
              style={{
                width: "24px",
                background: `rgba(${b.accentRgb}, 0.3)`,
                transition: "width 200ms ease-out, background 200ms ease-out",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
