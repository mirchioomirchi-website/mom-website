import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping Policy — Mirchi O Mirchi",
  description: "Where we ship, how long it takes, and how shipping is priced.",
  alternates: { canonical: `${SITE_URL}/shipping` },
};

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping Policy"
      updated="May 12, 2026"
      intro="We ship pan-India from Mumbai. Every jar is sealed, padded, and packed by hand. Below is what to expect after you place an order."
      sections={[
        {
          heading: "1. Where we ship",
          paragraphs: [
            "All Indian states and union territories — including remote pin codes that our courier partners service. We are not shipping internationally yet.",
          ],
        },
        {
          heading: "2. How long it takes",
          bullets: [
            "Order placed before 2pm IST on a working day → dispatched the same day.",
            "Order placed after 2pm or on a Sunday / public holiday → dispatched the next working day.",
            "Metro cities: typically 3–4 working days from dispatch.",
            "Rest of India: typically 4–7 working days from dispatch.",
            "Remote pin codes: up to 9 working days.",
          ],
        },
        {
          heading: "3. Tracking",
          paragraphs: [
            "You will get an email with the tracking number once your order leaves our packing table. Tracking goes live with the courier partner within 12–24 hours after dispatch.",
          ],
        },
        {
          heading: "4. Shipping cost",
          paragraphs: [
            "Shipping is calculated based on weight and your pin code, and shown at checkout before payment. We pass our actual courier cost through — no markup.",
          ],
        },
        {
          heading: "5. Failed delivery / RTO",
          paragraphs: [
            "If the courier fails to reach you after 2 attempts, or if the parcel is returned to us undelivered, we will reach out via email or phone. We can re-ship at the actual courier cost or refund the order minus the original shipping spend.",
          ],
        },
        {
          heading: "6. Damaged or missing on delivery",
          paragraphs: [
            "Refer to the Refund + Replacement Policy. The short version: email contact@mirchiomirchi.com within 48 hours with a photo and your order ID and we fix it.",
          ],
        },
      ]}
    />
  );
}
