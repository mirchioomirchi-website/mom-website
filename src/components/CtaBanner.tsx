"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { useDiscountSignup, signupCoupon, SIGNUP_COUPON_CODE } from "@/lib/use-discount-signup";

// The coupon itself lives in discounts.ts (the single source of truth the
// checkout/order endpoints validate against) — reading pct from there
// instead of hardcoding "5%" here means this banner can never drift out of
// sync with what the code actually gives at checkout.
const heading = `Claim your ${signupCoupon.pct}% off`;

const { bodyMobile, bodyDesktopLines } = SITE_CONTENT.ctaBanner;

export default function CtaBanner() {
  const { phone, setPhone, honeypot, setHoneypot, status, errorMsg, submit } =
    useDiscountSignup("banner");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SIGNUP_COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the code is already visible on-screen,
      // this is a convenience feature only.
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
                <div className="text-center md:text-left shrink-0">
                  <h2 className="text-h2 text-green">{heading}</h2>
                  <p className="text-body text-dark/80 mt-2">
                    <span className="md:hidden">{bodyMobile}</span>
                    <span className="hidden md:block">
                      {bodyDesktopLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-5 w-full md:w-auto md:max-w-sm shrink-0">
                  {status === "done" ? (
                    <div className="w-full flex flex-col items-center md:items-end gap-2">
                      <p className="text-body-sm text-dark/70 text-center md:text-right">
                        You&apos;re in! Here&apos;s your code — use it at checkout:
                      </p>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-btn font-bold bg-cream text-green px-5 py-3 tracking-[0.06em] flex-1 md:flex-none text-center">
                          {SIGNUP_COUPON_CODE}
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
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void submit();
                      }}
                      className="w-full flex flex-col items-center md:items-end gap-2"
                    >
                      {/* Honeypot — hidden from real users, bots that fill
                          every field blindly will trip it. */}
                      <input
                        type="text"
                        name="website"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden"
                      />
                      <div className="flex w-full gap-2">
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Your 10-digit mobile number"
                          aria-label="Your 10-digit mobile number"
                          className="flex-1 min-w-0 bg-cream border-0 px-4 py-3 text-body-sm text-dark placeholder:text-dark/40 outline-none focus:ring-2 focus:ring-green/40"
                        />
                        <button
                          type="submit"
                          disabled={status === "submitting"}
                          className="text-btn font-bold bg-green text-cream px-6 py-3 hover:bg-green/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                        >
                          {status === "submitting" ? "Sending…" : "Get code"}
                        </button>
                      </div>
                      {status === "error" && (
                        <p role="alert" className="text-body-sm text-red">{errorMsg}</p>
                      )}
                      <p className="text-[0.72rem] text-dark/50 text-center md:text-right">
                        By submitting, you agree to get WhatsApp/SMS updates on new
                        batches, drops, and offers from Mirchi O Mirchi. No spam,
                        unsubscribe anytime. See our{" "}
                        <Link href="/privacy" className="underline hover:text-dark/70">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </form>
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
