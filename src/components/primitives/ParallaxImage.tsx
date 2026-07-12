"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.3,
  fill = true,
  width,
  height,
}: ParallaxImageProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="relative w-full h-full">
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width || 800}
            height={height || 600}
            className="object-cover w-full h-full"
          />
        )}
      </motion.div>
    </div>
  );
}
