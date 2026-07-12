import type { Metadata } from "next";
import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import {
  SITE_LEGAL_NAME,
  SITE_REGISTERED_ADDRESS,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_PHONE,
  SITE_SUPPORT_HOURS,
  SITE_URL,
  SITE_WHATSAPP_NUMBER,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us — Mirchi O Mirchi",
  description:
    "Get in touch with Mirchi O Mirchi (Vivenza Marketing LLP). Email, phone, and registered office address for customer support and business enquiries.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <SmoothScroll>
      <Navigation />
      <main className="min-h-screen bg-mom-black pt-28 md:pt-36 pb-24 md:pb-32 text-white">
        <article className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-mom-pink mb-4 font-semibold">
            Get in touch
          </p>
          <h1 className="text-4xl md:text-6xl font-quirk uppercase leading-[0.95] mb-5">
            Contact Us
          </h1>
          <p className="text-base md:text-lg text-white/85 leading-relaxed mb-12 max-w-2xl">
            Question about an order? Wholesale enquiry? Press? We respond to every email
            within one working day.
          </p>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-12">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-mom-pink mb-3">
                Email
              </p>
              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className="block text-xl md:text-2xl font-quirk hover:text-mom-pink transition-colors break-all"
              >
                {SITE_SUPPORT_EMAIL}
              </a>
              <p className="text-[12px] text-white/55 mt-3 leading-relaxed">
                For order help, wholesale enquiries, partnerships, and anything else.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-mom-pink mb-3">
                WhatsApp / Phone
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href={`https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Mirchi O Mirchi — I had a question")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xl md:text-2xl font-quirk text-[#25D366] hover:text-[#1eb95a] transition-colors"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${SITE_SUPPORT_PHONE.replace(/[^+\d]/g, "")}`}
                  className="block text-base md:text-lg font-quirk text-white/85 hover:text-mom-pink transition-colors"
                >
                  {SITE_SUPPORT_PHONE}
                </a>
              </div>
              <p className="text-[12px] text-white/55 mt-3 leading-relaxed">
                {SITE_SUPPORT_HOURS}
              </p>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-mom-pink mb-3">
                Registered office
              </p>
              <p className="text-lg md:text-xl font-quirk leading-snug">
                {SITE_LEGAL_NAME}
              </p>
              <p className="text-sm md:text-base text-white/80 mt-2 leading-relaxed">
                {SITE_REGISTERED_ADDRESS}
              </p>
            </div>
          </div>

          {/* Support categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              {
                title: "Order help",
                body: "Status, tracking, refunds, replacements. Include your order ID.",
                href: `mailto:${SITE_SUPPORT_EMAIL}?subject=Order%20help`,
              },
              {
                title: "Wholesale + B2B",
                body: "Bulk pricing, distribution, retail partnerships, HoReCa enquiries.",
                href: `mailto:${SITE_SUPPORT_EMAIL}?subject=Wholesale%20enquiry`,
              },
              {
                title: "Press + collabs",
                body: "Media, creator collabs, brand partnerships, podcast invites.",
                href: `mailto:${SITE_SUPPORT_EMAIL}?subject=Press%20%2F%20collab`,
              },
            ].map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="block rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 hover:border-mom-pink/40 hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-[13px] uppercase tracking-[0.2em] text-white mb-2 font-semibold">
                  {c.title}
                </p>
                <p className="text-[13px] text-white/60 leading-relaxed">{c.body}</p>
              </a>
            ))}
          </div>

          {/* Contact form — Razorpay reviewers expect an actual form on /contact */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-quirk uppercase tracking-[0.05em] mb-2">
              Send us a message
            </h2>
            <p className="text-sm text-white/65 mb-6 max-w-xl">
              We respond to every message within one working day. Your message
              goes straight to {SITE_SUPPORT_EMAIL}.
            </p>
            <ContactForm />
          </section>

          {/* Grievance officer — required for India consumer law */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-7 md:p-8 mb-10">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45 mb-3">
              Grievance officer
            </p>
            <p className="text-sm md:text-base text-white/80 leading-relaxed">
              Under the Consumer Protection (E-Commerce) Rules 2020, you can reach our
              grievance officer for unresolved complaints at{" "}
              <a
                href={`mailto:${SITE_SUPPORT_EMAIL}`}
                className="text-mom-pink hover:underline"
              >
                {SITE_SUPPORT_EMAIL}
              </a>
              . We acknowledge every complaint within 48 hours and resolve within 30 days.
            </p>
          </div>

          <div className="pt-8 border-t border-white/[0.06]">
            <Link
              href="/"
              className="inline-block text-xs uppercase tracking-[0.25em] text-white/75 hover:text-white transition-colors"
            >
              ← Back home
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
