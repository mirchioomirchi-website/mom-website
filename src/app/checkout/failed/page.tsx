import type { Metadata } from "next";
import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Payment couldn't complete — Mirchi O Mirchi",
  description: "We couldn't process your payment. Your cart is safe.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ payment_id?: string; reason?: string }>;

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { payment_id, reason } = await searchParams;

  return (
    <SmoothScroll>
      <Navigation />
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-20 md:pb-28 text-white">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <div className="w-16 h-16 rounded-full bg-mom-red/15 border border-mom-red/30 mx-auto flex items-center justify-center mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E53935"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-red mb-3 font-semibold">
            Payment didn&apos;t go through
          </p>
          <h1 className="text-4xl md:text-6xl font-quirk uppercase leading-[0.9] mb-5">
            Don&apos;t worry — try again.
          </h1>
          <p className="text-base text-white/80 leading-relaxed mb-8">
            We couldn&apos;t complete your payment. Your cart is still saved, so
            you can retry without re-entering anything. If you were charged but
            didn&apos;t get a confirmation, email us with the payment ID below
            and we&apos;ll sort it within 24 hours.
          </p>

          {payment_id && (
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/75 mb-2 break-all">
              Payment ID: <span className="text-white">{payment_id}</span>
            </p>
          )}
          {reason && (
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/55 mb-8 break-all">
              Reason: <span className="text-white/75">{reason}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/checkout"
              className="inline-block px-8 py-4 rounded-full bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk hover:bg-mom-pink/90 transition-colors"
            >
              Try again
            </Link>
            <Link
              href="/cart"
              className="inline-block px-8 py-4 rounded-full border border-white/15 text-white text-xs uppercase tracking-[0.2em] font-quirk hover:border-mom-pink hover:text-mom-pink transition-colors"
            >
              Review my cart
            </Link>
          </div>

          <p className="text-xs text-white/55">
            Still stuck?{" "}
            <a
              href={`mailto:${SITE_SUPPORT_EMAIL}`}
              className="text-mom-pink hover:underline"
            >
              {SITE_SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
