import type { Metadata } from "next";
import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Order confirmed — Mirchi O Mirchi",
  description: "Thanks for ordering. We're packing it now.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  payment_id?: string;
  order?: string;
  method?: string;
}>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { payment_id, order, method } = await searchParams;
  const isCod = method === "cod";

  return (
    <SmoothScroll>
      <Navigation />
      <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
        <div className="max-w-2xl mx-auto px-5 md:px-9 text-center">
          <div className="w-16 h-16 rounded-full bg-green/10 mx-auto flex items-center justify-center mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#24451F"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p className="text-tag text-green uppercase tracking-[0.08em] mb-3">
            {isCod ? "Order placed" : "Payment received"}
          </p>
          <h1 className="text-h1 text-red mb-5">Your mirchi is on the way.</h1>
          <p className="text-body text-dark/80 mb-8">
            We&apos;ve got your order. You&apos;ll receive a confirmation email
            shortly, and a shipping update once it ships (1–2 business days,
            Mumbai delivery).
            {isCod && " Keep the order amount ready in cash for the delivery."}
          </p>

          {order && (
            <p className="text-body-sm text-dark/70 mb-1 break-all">
              Order: <span className="font-bold text-dark">{order}</span>
            </p>
          )}
          {payment_id && (
            <p className="text-body-sm text-dark/60 mb-8 break-all">
              Payment ID: <span className="text-dark/70">{payment_id}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders/track"
              className="inline-flex items-center justify-center text-btn font-bold bg-green text-cream px-8 py-4 hover:bg-green/90 transition-colors"
            >
              Track my order
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center text-btn font-bold bg-cream-dark text-dark px-8 py-4 hover:text-red transition-colors"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
