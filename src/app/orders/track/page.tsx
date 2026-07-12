import type { Metadata } from "next";
import TrackPageClient from "./TrackPageClient";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Track your order — Mirchi O Mirchi",
  description: "Enter your order number and email to check delivery status.",
  alternates: { canonical: `${SITE_URL}/orders/track` },
  // Private lookup form — no SEO value, and indexing it could provide an
  // enumeration entry-point. Customers reach it via the order confirmation
  // email + the Footer link, not via Google.
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return <TrackPageClient />;
}
