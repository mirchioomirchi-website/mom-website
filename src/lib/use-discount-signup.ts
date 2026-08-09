"use client";

import { useState } from "react";
import { COUPONS } from "@/lib/discounts";

// Shared submit/validate logic behind every "phone number → 5% off code"
// surface on the site (CtaBanner, the promo popup). Each surface owns its
// own markup/styling — this just owns the state machine + the API call, so
// the two never drift into different validation rules or a different code.

export const SIGNUP_COUPON_CODE = "SIGNUP5";
export const signupCoupon = COUPONS[SIGNUP_COUPON_CODE];

export type SignupStatus = "idle" | "submitting" | "done" | "error";

export function useDiscountSignup(source: string) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // Honeypot — the API route already checks `body.website` and silently
  // no-ops if it's filled in (same pattern as ContactForm.tsx), but neither
  // surface using this hook was actually rendering the hidden field that
  // would populate it, so the check was dead. `honeypot`/`setHoneypot` are
  // meant to be wired to a visually-hidden input a real user would never
  // see or fill in, but a bot filling every field blindly would.
  const [honeypot, setHoneypot] = useState("");

  async function submit() {
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setStatus("error");
      setErrorMsg("Enter a valid 10-digit mobile number.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/phone-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, source, website: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't submit — try again.");
    }
  }

  return { phone, setPhone, honeypot, setHoneypot, status, errorMsg, submit };
}
