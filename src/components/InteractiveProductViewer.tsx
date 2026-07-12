"use client";

/**
 * InteractiveProductViewer
 * ----------------------------------------------------------------
 * Auto-playing 360° rotation video for the jar. Loops seamlessly,
 * muted, playsinline. If the video fails to load, falls back to the
 * static poster image — no tilt, no drag, no pseudo-3D. The video IS
 * the product photography.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  /** Front-facing fallback image (always required) */
  src: string;
  /** 360° rotation video URL (auto-rotation mode) */
  videoSrc?: string;
  /** Alt text */
  alt: string;
  /** RGB triplet for ambient glow tint */
  accentRgb?: string;
  /** Playback rate for the 360 video. Default 1.0. Lower = slower spin. */
  playbackRate?: number;
  className?: string;
}

export default function InteractiveProductViewer({
  src,
  videoSrc,
  alt,
  accentRgb = "245, 25, 127",
  playbackRate = 1,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const showVideo = Boolean(videoSrc) && !videoFailed;

  // Apply playbackRate whenever the source changes or the video starts playing.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
  }, [playbackRate, videoSrc]);

  return (
    <div
      className={`relative w-full h-full select-none ${className}`}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Ambient color glow behind jar */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 70% at 50% 55%, rgba(${accentRgb}, 0.22) 0%, rgba(${accentRgb}, 0.08) 35%, transparent 65%)`,
        }}
      />

      {/* Floor shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[60%] h-[8%] rounded-[50%] pointer-events-none blur-md"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, transparent 75%)",
        }}
      />

      {/* Poster fallback — visible until the video starts (or forever if no video). */}
      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{ opacity: showVideo && videoReady ? 0 : 1 }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          draggable={false}
          sizes="(max-width: 768px) 80vw, 600px"
          className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
        />
      </div>

      {showVideo && videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={src}
          onLoadedMetadata={(e) => {
            (e.currentTarget as HTMLVideoElement).playbackRate = playbackRate;
          }}
          onPlaying={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          aria-label={alt}
          // Radial mask fades the outer ring of the video into the page bg —
          // hides any soft background gradient Higgsfield bakes in, so the
          // jar appears to float in pure black.
          style={{
            maskImage:
              "radial-gradient(circle at 50% 50%, #000 55%, transparent 92%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 50%, #000 55%, transparent 92%)",
          }}
          className="relative w-full h-full object-contain"
        />
      )}
    </div>
  );
}
