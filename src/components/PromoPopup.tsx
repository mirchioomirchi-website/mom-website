"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDiscountSignup, signupCoupon, SIGNUP_COUPON_CODE } from "@/lib/use-discount-signup";

// Shows once per browser, 10 seconds after landing — a hard page load
// (refresh, direct link, new tab), not every client-side route change,
// since this component mounts once in the root layout and its own timer
// only fires on that first mount. Persists in localStorage so a returning
// visitor in the same browser doesn't get nagged again.
const SEEN_KEY = "mom-promo-popup-v1";
const DELAY_MS = 10_000;

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const { phone, setPhone, status, errorMsg, submit } = useDiscountSignup("popup");

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {}
    const t = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }

  function dismiss() {
    setVisible(false);
    markSeen();
  }

  // Once they've claimed the code, never show this again — they have what
  // they came for.
  useEffect(() => {
    if (status === "done") markSeen();
  }, [status]);

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SIGNUP_COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — code is already visible on-screen.
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="promo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={dismiss}
            className="fixed inset-0 z-[400] bg-dark/60 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            key="promo-panel"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[401] flex items-center justify-center p-5 pointer-events-none"
          >
            <div className="dotted-frame text-yellow p-3 md:p-4 w-full max-w-md pointer-events-auto">
              <div className="relative bg-green px-7 py-9 md:px-9 md:py-10 text-center">
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Close"
                  className="absolute top-3 right-3 text-cream/60 hover:text-cream transition-colors text-lg leading-none p-1 cursor-pointer"
                >
                  ✕
                </button>

                {status === "done" ? (
                  <>
                    <p className="text-h4 font-bold text-cream mb-2">You&apos;re in 🌶️</p>
                    <p className="text-body-sm text-cream/80 mb-6">
                      Here&apos;s your code — use it at checkout:
                    </p>
                    <div className="flex items-center gap-2 justify-center">
                      <span className="text-btn font-bold bg-cream text-green px-5 py-3 tracking-[0.06em]">
                        {SIGNUP_COUPON_CODE}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="text-btn font-bold bg-yellow text-dark px-5 py-3 hover:bg-yellow/90 transition-colors cursor-pointer"
                      >
                        {copied ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-h4 font-bold text-cream mb-2">Wait wait wait 🌶️</p>
                    <p className="text-body-sm text-cream/80 mb-6">
                      Don&apos;t leave empty-handed (or empty-mouthed). Drop your number for
                      first dibs on new batches — plus {signupCoupon.pct}% off, right now.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void submit();
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your 10-digit mobile number"
                        className="w-full bg-cream border-0 px-4 py-3 text-body-sm text-dark placeholder:text-dark/40 outline-none focus:ring-2 focus:ring-yellow text-center"
                      />
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="text-btn font-bold bg-yellow text-dark px-6 py-3 hover:bg-yellow/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {status === "submitting" ? "Sending…" : `Get my ${signupCoupon.pct}% off`}
                      </button>
                      {status === "error" && (
                        <p className="text-body-sm text-yellow">{errorMsg}</p>
                      )}
                    </form>
                    <p className="text-[0.7rem] text-cream/50 mt-4">
                      No spam. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
