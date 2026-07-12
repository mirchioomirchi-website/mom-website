import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart — Mirchi O Mirchi",
  description: "Review your jars before checkout.",
  // Cart state is user-specific and shouldn't be in Google's index.
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartPageClient />;
}
