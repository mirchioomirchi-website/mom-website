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
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-20 md:pb-28 text-white">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <div className="w-16 h-16 rounded-full bg-mom-green/15 border border-mom-green/30 mx-auto flex items-center justify-center mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7BB55E"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-green mb-3 font-semibold">
            {isCod ? "Order placed" : "Payment received"}
          </p>
          <h1 className="text-4xl md:text-6xl font-quirk uppercase leading-[0.9] mb-5">
            Your mirchi is on the way.
          </h1>
          <p className="text-base text-white/80 leading-relaxed mb-8">
            We&apos;ve got your order. You&apos;ll receive a confirmation email
            shortly, and a shipping update once it ships (3–7 business days
            pan-India).
            {isCod && " Keep the order amount ready in cash for the delivery."}
          </p>

          {order && (
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/75 mb-2 break-all">
              Order: <span className="text-white">{order}</span>
            </p>
          )}
          {payment_id && (
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/55 mb-8 break-all">
              Payment ID: <span className="text-white/75">{payment_id}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders/track"
              className="inline-block px-8 py-4 rounded-full bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk hover:bg-mom-pink/90 transition-colors"
            >
              Track my order
            </Link>
            <Link
              href="/shop"
              className="inline-block px-8 py-4 rounded-full border border-white/15 text-white text-xs uppercase tracking-[0.2em] font-quirk hover:border-mom-pink hover:text-mom-pink transition-colors"
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
