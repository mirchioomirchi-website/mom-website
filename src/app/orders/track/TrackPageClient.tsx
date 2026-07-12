"use client";

import { useState } from "react";
import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

type OrderResult = {
  orderName: string;
  fulfillmentStatus: string;
  financialStatus: string;
  createdAt: string;
  statusPageUrl?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  trackingCompany?: string;
  items: Array<{ title: string; quantity: number }>;
  totalRupees: number;
  currency: string;
};

const STATUS_LABEL: Record<string, string> = {
  FULFILLED: "Shipped",
  PARTIALLY_FULFILLED: "Partially shipped",
  UNFULFILLED: "Packing now",
  IN_PROGRESS: "Packing now",
  SCHEDULED: "Scheduled",
  ON_HOLD: "On hold",
  PENDING_FULFILLMENT: "Pending",
  RESTOCKED: "Restocked",
  OPEN: "Open",
};

function prettyStatus(s: string) {
  return STATUS_LABEL[s] || s.replace(/_/g, " ").toLowerCase();
}

function timeline(order: OrderResult) {
  const placed = new Date(order.createdAt);
  const isShipped =
    order.fulfillmentStatus === "FULFILLED" ||
    order.fulfillmentStatus === "PARTIALLY_FULFILLED" ||
    Boolean(order.trackingNumber);
  return [
    {
      label: "Order placed",
      done: true,
      date: placed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
    {
      label: "Packing",
      done: true,
      date: "",
    },
    {
      label: "Shipped",
      done: isShipped,
      date: order.trackingNumber
        ? `${order.trackingCompany || "Courier"} · ${order.trackingNumber}`
        : "",
    },
    {
      label: "Delivered",
      done: false,
      date: "Tracking updates here once delivered",
    },
  ];
}

export default function TrackPageClient() {
  const [orderName, setOrderName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/order/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderName, email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        order?: OrderResult;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.order) {
        throw new Error(data.error || `Lookup failed (${res.status})`);
      }
      setResult(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't look up your order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SmoothScroll>
      <Navigation />
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-20 md:pb-28 text-white">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          <div className="mb-10">
            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-3 font-semibold">
              Order tracking
            </p>
            <h1 className="text-4xl md:text-6xl font-quirk uppercase leading-[0.9] mb-3">
              Where&apos;s my mirchi?
            </h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Type your order number (from the confirmation email, like #1024) and
              the email you used to check out.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:p-6 space-y-4"
            noValidate
          >
            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.25em] text-white/75 mb-1.5">
                Order number
              </span>
              <input
                type="text"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                placeholder="#1024"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-mom-pink/60 transition-colors"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.25em] text-white/75 mb-1.5">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-mom-pink/60 transition-colors"
              />
            </label>

            {error && (
              <p className="text-sm text-mom-red bg-mom-red/10 border border-mom-red/30 rounded-2xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk hover:bg-mom-pink/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Looking it up…" : "Track order"}
            </button>
          </form>

          {result && (
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:p-6">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/55">
                    Order
                  </p>
                  <p className="text-2xl font-quirk text-white">{result.orderName}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-mom-pink">
                  {prettyStatus(result.fulfillmentStatus)}
                </span>
              </div>

              <ol className="space-y-3 mb-6">
                {timeline(result).map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span
                      className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                        step.done ? "bg-mom-green" : "bg-white/20"
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-quirk uppercase tracking-wide ${
                          step.done ? "text-white" : "text-white/55"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-[11px] text-white/55 mt-0.5">
                          {step.date}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {result.trackingUrl && (
                <a
                  href={result.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center py-3 rounded-full bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk hover:bg-mom-pink/90 transition-colors"
                >
                  Open carrier tracking ↗
                </a>
              )}

              <div className="mt-6 pt-5 border-t border-white/[0.08] text-[11px] text-white/55">
                <p className="mb-1">
                  <strong className="text-white/75 font-quirk uppercase tracking-wide">
                    Items
                  </strong>
                </p>
                <ul className="space-y-1">
                  {result.items.map((item, i) => (
                    <li key={i}>
                      {item.title} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  Total: ₹{result.totalRupees} · Payment{" "}
                  {prettyStatus(result.financialStatus)}
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-white/55 mt-8 text-center">
            Lost your order number? Email{" "}
            <a
              href={`mailto:${SITE_SUPPORT_EMAIL}`}
              className="text-mom-pink hover:underline"
            >
              {SITE_SUPPORT_EMAIL}
            </a>
            {" "}with the date and shipping address — we&apos;ll find it.
          </p>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.25em] text-white/75 hover:text-white transition-colors"
            >
              ← Back home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
