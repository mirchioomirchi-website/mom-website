"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function PageLoader({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");

  useEffect(() => {
    const loadTimer = setTimeout(() => setPhase("exiting"), 2000);
    const doneTimer = setTimeout(() => setPhase("done"), 2600);
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <>
      {/* Loader overlay */}
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[200] bg-mom-black flex flex-col items-center justify-center"
          animate={{ opacity: phase === "exiting" ? 0 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo reveal */}
          <div className="overflow-hidden">
            <motion.h1
              className="text-[12vw] md:text-[8vw] font-quirk uppercase text-gradient-pink leading-none"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              MOM
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.p
            className="text-[12px] uppercase tracking-[0.5em] text-white/40 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Mirchi O Mirchi
          </motion.p>

          {/* Loading bar */}
          <motion.div
            className="w-24 h-[2px] bg-white/10 rounded-full mt-8 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.div
              className="h-full bg-mom-pink rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.7, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        animate={{ opacity: phase === "done" ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
