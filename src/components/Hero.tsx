"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import MagneticButton from "@/components/primitives/MagneticButton";
import { SITE_CONTENT } from "@/lib/content";

// 241 source frames on disk, but we only sample every 3rd one in code.
// 80 frames over the 350vh scroll feels just as smooth (each frame ≈ 4.4vh)
// and cuts the network/decode load by ~3× — huge win on low-end laptops.
const SOURCE_FRAMES = 241;
const FRAME_STRIDE = 3;
const TOTAL_FRAMES = Math.ceil(SOURCE_FRAMES / FRAME_STRIDE);
const FRAME_PATH = "/frames/hero-";

function getFrameSrc(index: number) {
  const clamped = Math.min(Math.max(index, 1), TOTAL_FRAMES);
  const sourceIndex = Math.min((clamped - 1) * FRAME_STRIDE + 1, SOURCE_FRAMES);
  return `${FRAME_PATH}${String(sourceIndex).padStart(4, "0")}.webp`;
}

export default function Hero() {
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const currentFrameRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = cw / scale;
    const sh = ch / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let resizeRaf = 0;
    const resize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        // Source frames are 1280×720. Match canvas to that exactly — no
        // upscale. drawImage then 1:1 blits → no GPU resample cost per frame,
        // 60% less canvas backing memory than the previous 1920×1080 cap.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const targetW = Math.min(window.innerWidth * dpr, 1280);
        const targetH = Math.min(window.innerHeight * dpr, 720);
        if (canvas.width !== targetW) canvas.width = targetW;
        if (canvas.height !== targetH) canvas.height = targetH;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        if (imagesRef.current.length > 0) {
          renderFrame(currentFrameRef.current);
        }
      });
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", resize);
    };
  }, [renderFrame, imagesLoaded]);

  useEffect(() => {
    // Reduced-motion users skip the canvas entirely — the static first-frame
    // <img> stays as the hero. No 80 frame downloads, no GPU canvas work.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const images: HTMLImageElement[] = [];
    imagesRef.current = images;
    let firstReady = false;
    let cancelled = false;

    const onSettled = () => {
      // Show the canvas as soon as the first frame decodes — don't wait for all 241
      if (!firstReady && images[0]?.complete && images[0]?.naturalWidth) {
        firstReady = true;
        if (!cancelled) {
          setImagesLoaded(true);
          renderFrame(0);
        }
      }
    };

    const createImage = (i: number) => {
      const img = new Image();
      img.decoding = "async";
      img.src = getFrameSrc(i);
      img.onload = onSettled;
      img.onerror = onSettled;
      images[i - 1] = img;
    };

    // Front-load 16 frames eagerly — enough to cover the first ~25% of the
    // scroll (one frame per ~22vh) so the scrub stays smooth before idle
    // load finishes the rest. Lower than the previous 30 to free up the
    // network for layout-blocking resources (fonts, JS).
    const eager = Math.min(16, TOTAL_FRAMES);
    for (let i = 1; i <= eager; i++) createImage(i);

    // Defer the rest until after first paint
    const idle = (cb: () => void) => {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void) => number };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(cb);
      } else {
        setTimeout(cb, 50);
      }
    };

    idle(() => {
      if (cancelled) return;
      for (let i = eager + 1; i <= TOTAL_FRAMES; i++) createImage(i);
    });

    return () => {
      cancelled = true;
    };
  }, [renderFrame]);

  // Direct frame mapping (no lerp loop). Motion's useMotionValueEvent already
  // fires inside a rAF — drawing inline avoids both an extra frame of lag AND
  // a continuous rAF loop that runs even when Hero is off-screen.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!imagesLoaded) return;
    const frameIndex = Math.min(
      Math.floor(progress * (TOTAL_FRAMES - 1)),
      TOTAL_FRAMES - 1
    );
    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      renderFrame(frameIndex);
    }
  });

  const headingOpacity = useTransform(scrollYProgress, [0, 0.15, 0.35], [1, 1, 0]);
  const headingY = useTransform(scrollYProgress, [0, 0.35], [0, -100]);
  const headingScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.05]);

  // Eyebrow fades almost immediately on scroll start so it doesn't fight the headline/marquee
  const subOpacity = useTransform(scrollYProgress, [0, 0.02, 0.06], [1, 1, 0]);
  const subY = useTransform(scrollYProgress, [0, 0.08], [0, -30]);

  const taglineOpacity = useTransform(scrollYProgress, [0, 0.12, 0.28], [1, 1, 0]);
  const taglineY = useTransform(scrollYProgress, [0, 0.28], [0, -40]);

  const ctaOpacity = useTransform(scrollYProgress, [0, 0.1, 0.22], [1, 1, 0]);
  const ctaY = useTransform(scrollYProgress, [0, 0.22], [0, -30]);

  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.06], [0.5, 0]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);

  return (
    <section ref={outerRef} className="relative h-[350vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-mom-black">
        {/* Static first frame — always visible until canvas takes over */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: imagesLoaded ? 0 : 1,
            pointerEvents: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getFrameSrc(1)}
            alt=""
            fetchPriority="high"
            decoding="sync"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Canvas */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: canvasOpacity }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </motion.div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-mom-black/40 via-transparent to-mom-black/60 pointer-events-none" />

        {/* Text overlay — centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-6">
          <motion.p
            className="text-[10px] md:text-sm uppercase tracking-[0.18em] md:tracking-[0.22em] text-white/85 mb-10 md:mb-16 font-semibold whitespace-nowrap flex gap-x-1.5 md:gap-x-2"
            style={{ opacity: subOpacity, y: subY }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {SITE_CONTENT.hero.eyebrow.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </motion.p>

          <motion.h1
            className="text-[15vw] md:text-[11vw] lg:text-[9vw] font-quirk leading-[0.88] text-center uppercase"
            style={{
              opacity: headingOpacity,
              y: headingY,
              scale: headingScale,
              textShadow:
                "0 0 80px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <motion.span
              className="block text-gradient-pink"
              initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Mirchi
            </motion.span>
            <motion.span
              className="block text-gradient-pink text-[5vw] md:text-[4vw] lg:text-[3vw] my-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              O
            </motion.span>
            <motion.span
              className="block text-gradient-pink"
              initial={{ opacity: 0, y: -60, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Mirchi
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-sm md:text-lg font-quirk text-white/80 mt-5 text-center tracking-[0.1em] uppercase"
            style={{ opacity: taglineOpacity, y: taglineY }}
          >
            {SITE_CONTENT.hero.tagline.split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>

          <motion.div
            className="flex flex-row gap-3 md:gap-4 mt-7 md:mt-8 pointer-events-auto"
            style={{ opacity: ctaOpacity, y: ctaY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton
                as="button"
                className="px-5 py-2.5 md:px-8 md:py-3.5 bg-mom-pink text-white text-[11px] md:text-xs uppercase tracking-[0.2em] font-quirk rounded-full hover:bg-mom-pink/90 transition-colors duration-300 cursor-pointer hover:shadow-[0_0_28px_rgba(245,25,127,0.45)] whitespace-nowrap"
                onClick={() =>
                  document
                    .querySelector("#shop")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Shop Now
              </MagneticButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton
                as="button"
                className="px-5 py-2.5 md:px-8 md:py-3.5 bg-transparent border border-white/25 text-white text-[11px] md:text-xs uppercase tracking-[0.2em] font-quirk rounded-full hover:border-mom-pink hover:text-mom-pink transition-colors duration-300 cursor-pointer whitespace-nowrap"
                onClick={() =>
                  document
                    .querySelector("#flavours")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Flavours
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator — clickable */}
        <motion.button
          type="button"
          aria-label="Scroll down"
          onClick={() =>
            window.scrollBy({ top: window.innerHeight * 0.95, behavior: "smooth" })
          }
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 cursor-pointer group pointer-events-auto"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/70 group-hover:text-mom-pink transition-colors"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
