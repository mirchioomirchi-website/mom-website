import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page not found — Mirchi O Mirchi",
  description: "The page you were looking for doesn't exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-mom-black text-white pt-28 md:pt-36 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-4 font-semibold">
            Lost in the spice rack
          </p>
          <h1 className="text-6xl md:text-8xl font-quirk uppercase leading-[0.9] mb-6">
            404
          </h1>
          <p className="text-base md:text-lg text-white/85 leading-relaxed mb-10 max-w-md mx-auto">
            This page doesn&apos;t exist — or it ran for the door because the
            thecha was too spicy. Either way, head back to the good stuff.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-7 py-3 bg-mom-pink text-white text-[12px] uppercase tracking-[0.2em] font-quirk rounded-full hover:bg-mom-pink/90 transition-colors"
            >
              Shop the jars
            </Link>
            <Link
              href="/"
              className="px-7 py-3 border border-white/15 text-white text-[12px] uppercase tracking-[0.2em] font-quirk rounded-full hover:bg-white/[0.04] transition-colors"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
