"use client";

// Razorpay Checkout widget — client component.
//
// Usage:
//   <RazorpayCheckout
//     amount={799}
//     name="Mirchi O Mirchi"
//     description="Combo Pack"
//     prefill={{ name: "...", email: "...", contact: "..." }}
//     onSuccess={(payment) => {...}}
//   />
//
// NOTE: This is the standalone single-amount widget. The main checkout flow
// at /checkout drives Razorpay directly with the full cart + shipping form.
// Use this component only for one-off flows (e.g. donations, gift purchases).

import Script from "next/script";
import { useCallback, useState } from "react";

type Prefill = { name?: string; email?: string; contact?: string };

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type Props = {
  amount: number;
  name?: string;
  description?: string;
  prefill?: Prefill;
  notes?: Record<string, string>;
  buttonLabel?: string;
  className?: string;
  onSuccess?: (payment: RazorpaySuccess) => void;
  onFailure?: (err: unknown) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function RazorpayCheckout({
  amount,
  name = "Mirchi O Mirchi",
  description,
  prefill,
  notes,
  buttonLabel = "Pay with Razorpay",
  className,
  onSuccess,
  onFailure,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, notes }),
      });
      if (!res.ok) throw new Error(`Order create failed: ${res.status}`);
      const data = (await res.json()) as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      if (!window.Razorpay) throw new Error("Razorpay script not loaded");
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name,
        description,
        order_id: data.orderId,
        prefill,
        notes,
        theme: { color: "#F5197F" },
        handler: (payment: RazorpaySuccess) => {
          onSuccess?.(payment);
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err) {
      console.error("[razorpay] checkout failed", err);
      onFailure?.(err);
      setLoading(false);
    }
  }, [amount, name, description, prefill, notes, onSuccess, onFailure]);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className={
          className ||
          "px-6 py-3 bg-mom-pink text-white text-xs uppercase tracking-[0.2em] font-quirk rounded-full hover:bg-mom-pink/90 transition-colors disabled:opacity-60 cursor-pointer"
        }
      >
        {loading ? "Loading…" : buttonLabel}
      </button>
    </>
  );
}
