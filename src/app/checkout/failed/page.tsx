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
      <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
        <div className="max-w-2xl mx-auto px-5 md:px-9 text-center">
          <div className="w-16 h-16 rounded-full bg-red/10 mx-auto flex items-center justify-center mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9B1E15"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <p className="text-tag text-red uppercase tracking-[0.08em] mb-3">
            Payment didn&apos;t go through
          </p>
          <h1 className="text-h1 text-red mb-5">Don&apos;t worry — try again.</h1>
          <p className="text-body text-dark/80 mb-8">
            We couldn&apos;t complete your payment. Your cart is still saved, so
            you can retry without re-entering anything. If you were charged but
            didn&apos;t get a confirmation, email us with the payment ID below
            and we&apos;ll sort it within 24 hours.
          </p>

          {payment_id && (
            <p className="text-body-sm text-dark/70 mb-1 break-all">
              Payment ID: <span className="font-bold text-dark">{payment_id}</span>
            </p>
          )}
          {reason && (
            <p className="text-body-sm text-dark/60 mb-8 break-all">
              Reason: <span className="text-dark/70">{reason}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center text-btn font-bold bg-green text-cream px-8 py-4 hover:bg-green/90 transition-colors"
            >
              Try again
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center text-btn font-bold bg-cream-dark text-dark px-8 py-4 hover:text-red transition-colors"
            >
              Review my cart
            </Link>
          </div>

          <p className="text-body-sm text-dark/60">
            Still stuck?{" "}
            <a
              href={`mailto:${SITE_SUPPORT_EMAIL}`}
              className="text-red underline underline-offset-2 hover:text-red/80 transition-colors"
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
