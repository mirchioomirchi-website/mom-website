"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { SITE_WHATSAPP_NUMBER } from "@/lib/site";
import { COUPONS } from "@/lib/discounts";

// The coupon itself lives in discounts.ts (the single source of truth the
// checkout/order endpoints validate against) — reading pct/label from there
// instead of hardcoding "5%" here means this banner can never drift out of
// sync with what the code actually gives at checkout.
const WHATSAPP_COUPON_CODE = "WHATSAPP5";
const whatsappCoupon = COUPONS[WHATSAPP_COUPON_CODE];

const { bodyMobile, bodyDesktopLines } = SITE_CONTENT.ctaBanner;
const heading = `Claim your ${whatsappCoupon.pct}% off`;

// The code is embedded in the pre-filled WhatsApp message itself, so it's
// saved in the customer's chat history as a durable reference even after
// they navigate away from the site.
const WHATSAPP_HREF = `https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  `Hi Mirchi O Mirchi — I'd like to join your WhatsApp community for updates and offers \u{1F336}️ (my ${whatsappCoupon.pct}% off code: ${WHATSAPP_COUPON_CODE})`
)}`;

export default function CtaBanner() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(WHATSAPP_COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) — the code is
      // already visible on-screen and in the WhatsApp message, so this is a
      // convenience feature only, not the only way to get the code.
    }
  }

  return (
    <section className="relative bg-cream py-10 md:py-14 cv-auto">
      <div className="w-full max-w-[1400px] mx-auto px-5 md:px-9">
        {/* Same dotted-divider pattern as the navbar's bottom border. */}
        <div className="dotted-divider text-green" />

        <div className="my-3 md:my-4">
          <ScrollReveal>
            <div className="bg-cream-dark px-6 md:px-14 py-10 md:py-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
                <h2 className="text-h2 text-green text-center md:text-left shrink-0">
                  {heading}
                </h2>

                <div className="flex flex-col items-center md:items-end gap-5 w-full md:w-auto">
                  <p className="text-body text-dark/80 text-center md:text-right max-w-sm md:max-w-md">
                    <span className="md:hidden">{bodyMobile}</span>
                    <span className="hidden md:block">
                      {bodyDesktopLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </p>

                  {revealed ? (
                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
                      <p className="text-body-sm text-dark/70 text-center md:text-right">
                        Your code — use it at checkout:
                      </p>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-btn font-bold bg-cream text-green px-5 py-3 tracking-[0.06em] flex-1 md:flex-none text-center">
                          {WHATSAPP_COUPON_CODE}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="text-btn font-bold bg-green text-cream px-5 py-3 hover:bg-green/90 transition-colors cursor-pointer shrink-0"
                        >
                          {copied ? "Copied ✓" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={WHATSAPP_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setRevealed(true)}
                      className="text-btn inline-flex items-center justify-center gap-2 bg-green text-cream px-8 py-3.5 hover:bg-green/90 transition-colors w-full md:w-auto"
                    >
                      Join on WhatsApp
                      <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="dotted-divider text-green" />
      </div>
    </section>
  );
}
