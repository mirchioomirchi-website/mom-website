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
      <main className="min-h-screen bg-cream pt-28 md:pt-36 pb-24 md:pb-32 cv-auto">
        <div className="max-w-2xl mx-auto px-5 md:px-9 text-center">
          <p className="text-tag text-red uppercase tracking-[0.08em] mb-4">
            Lost in the spice rack
          </p>
          <h1 className="text-h1 text-green mb-6">404</h1>
          <p className="text-body text-dark/80 mb-10 max-w-md mx-auto">
            This page doesn&apos;t exist — or it ran for the door because the
            thecha was too spicy. Either way, head back to the good stuff.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center text-btn font-bold bg-green text-cream px-8 py-4 hover:bg-green/90 transition-colors"
            >
              Shop the jars
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center text-btn font-bold bg-cream-dark text-dark px-8 py-4 hover:text-red transition-colors"
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
