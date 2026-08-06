"use client";

import { useState } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import ContactInfo from "@/components/contact/ContactInfo";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import {
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_HOURS,
  SITE_SUPPORT_PHONE,
  SITE_WHATSAPP_NUMBER,
} from "@/lib/site";

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
    { label: "Packing", done: true, date: "" },
    {
      label: "Shipped",
      done: isShipped,
      date: order.trackingNumber
        ? `${order.trackingCompany || "Courier"} · ${order.trackingNumber}`
        : "",
    },
    { label: "Delivered", done: false, date: "Tracking updates here once delivered" },
  ];
}

const { hero, lostOrder, form } = SITE_CONTENT.trackPage;

// Underline-field styling shared with the /contact form — the site's
// established minimal-input pattern (transparent bg, green rule).
const fieldClass =
  "w-full bg-transparent border-0 border-b-2 border-green py-3 text-lg text-dark placeholder:text-dark/40 outline-none focus:border-red transition-colors";

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
      <main>
        <section className="relative bg-cream pt-28 md:pt-36 pb-14 md:pb-20 cv-auto">
          <div className="max-w-[1400px] mx-auto px-5 md:px-9">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6 mb-6">
                <h1 className="order-last md:order-none text-[2.75rem] md:text-[5rem] font-bold text-green leading-[0.95]">
                  {hero.heading}
                </h1>
                <p className="order-first md:order-none font-sura text-red text-base md:text-lg whitespace-nowrap shrink-0 md:pt-4">
                  {hero.eyebrowDevanagari} <span aria-hidden="true">·</span> {hero.eyebrowEnglish}
                </p>
              </div>
              <p className="text-body text-dark max-w-xl">{hero.subheading}</p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-16 md:mt-20">
              <ScrollReveal>
                <h2 className="text-body font-bold text-red mb-1">{lostOrder.heading}</h2>
                <p className="text-body text-dark max-w-sm mb-8">
                  Email{" "}
                  <a
                    href={`mailto:${SITE_SUPPORT_EMAIL}`}
                    className="text-dark underline underline-offset-2 hover:text-red transition-colors"
                  >
                    {SITE_SUPPORT_EMAIL}
                  </a>{" "}
                  {lostOrder.note}
                </p>

                <p className="text-body font-bold text-red mb-1">Chat on Whatsapp</p>
                <a
                  href={`https://wa.me/${SITE_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xl font-bold text-dark hover:text-red transition-colors"
                >
                  {SITE_SUPPORT_PHONE}
                </a>
                <p className="text-body-sm text-dark/60 mt-2">{SITE_SUPPORT_HOURS}</p>
              </ScrollReveal>

              <ScrollReveal delay={0.08}>
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="bg-cream-dark rounded-2xl p-8 md:p-9"
                >
                  <label className="block mb-8">
                    <span className="block text-xl font-bold text-dark mb-2">
                      {form.orderNumberLabel}
                    </span>
                    <input
                      type="text"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder={form.orderNumberPlaceholder}
                      className={fieldClass}
                    />
                  </label>

                  <label className="block mb-8">
                    <span className="block text-xl font-bold text-dark mb-2">
                      {form.emailLabel}
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={form.emailPlaceholder}
                      className={fieldClass}
                    />
                  </label>

                  {error && (
                    <p className="text-body-sm text-red bg-red/10 rounded-lg px-4 py-3 mb-6">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="text-btn font-bold rounded-lg inline-flex items-center justify-center gap-2 bg-green text-cream px-8 py-3.5 hover:bg-green/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Looking it up…" : form.submitLabel}
                  </button>
                </form>
              </ScrollReveal>
            </div>

            {result && (
              <ScrollReveal delay={0.04} className="mt-10">
                <div className="bg-cream-dark rounded-2xl p-8 md:p-9">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <p className="text-tag text-dark/50 uppercase tracking-[0.06em]">Order</p>
                      <p className="text-h4 font-bold text-dark">{result.orderName}</p>
                    </div>
                    <span className="text-tag font-bold text-red uppercase tracking-[0.06em]">
                      {prettyStatus(result.fulfillmentStatus)}
                    </span>
                  </div>

                  <ol className="space-y-4 mb-7">
                    {timeline(result).map((step, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span
                          className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                            step.done ? "bg-green" : "bg-dark/20"
                          }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-body font-bold ${
                              step.done ? "text-dark" : "text-dark/45"
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-body-sm text-dark/55 mt-0.5">{step.date}</p>
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
                      className="block w-full text-center text-btn font-bold rounded-lg bg-green text-cream px-8 py-3.5 hover:bg-green/90 transition-colors"
                    >
                      Open carrier tracking ↗
                    </a>
                  )}

                  <div className="mt-7 pt-6">
                    <div className="dotted-divider text-dark/20 mb-6" />
                    <p className="text-tag text-dark/50 uppercase tracking-[0.06em] mb-2">
                      Items
                    </p>
                    <ul className="space-y-1 text-body-sm text-dark/70">
                      {result.items.map((item, i) => (
                        <li key={i}>
                          {item.title} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                    <p className="text-body-sm text-dark/70 mt-3">
                      Total: ₹{result.totalRupees} · Payment{" "}
                      {prettyStatus(result.financialStatus)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>

          <div className="max-w-[1400px] mx-auto px-5 md:px-9 mt-14 md:mt-20">
            <div className="dotted-divider text-red" />
          </div>
        </section>

        <ContactInfo />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
