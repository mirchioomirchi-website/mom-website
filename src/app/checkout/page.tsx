import type { Metadata } from "next";
import CheckoutPageClient from "./CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout — Mirchi O Mirchi",
  description: "Secure checkout for your Mirchi O Mirchi order. Pay via UPI, card, netbanking or wallet.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
