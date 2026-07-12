import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund + Replacement Policy — Mirchi O Mirchi",
  description:
    "How we handle refunds and replacements for damaged, defective, or wrong-item orders.",
  alternates: { canonical: `${SITE_URL}/refund` },
};

export default function RefundPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund + Replacement Policy"
      updated="May 12, 2026"
      intro="Our jars are perishable food products. For hygiene and food-safety reasons we cannot accept returns of opened or used products. We do replace or refund anything that arrives damaged, defective, or wrong — fast and without arguing."
      sections={[
        {
          heading: "1. When we replace or refund",
          bullets: [
            "Jar is broken, leaking, or seal is tampered when you receive it.",
            "Wrong flavour shipped (we sent red, you ordered green).",
            "Order is missing items.",
            "Visible quality issue — mould, off smell, foreign object — on an unopened jar.",
          ],
        },
        {
          heading: "2. What you do",
          paragraphs: [
            "Email contact@mirchiomirchi.com within 48 hours of delivery with:",
          ],
          bullets: [
            "Your order number (from the confirmation email).",
            "A photo of the damaged jar / wrong item / packaging.",
            "Whether you want a replacement shipped or a refund to your original payment method.",
          ],
        },
        {
          heading: "3. What we do",
          bullets: [
            "We respond within 24 working hours.",
            "If you want a replacement: we ship the correct item at no extra cost.",
            "If you want a refund: we process it via Razorpay to the same payment method within 5–7 working days.",
            "No back-and-forth, no proof-of-purchase chase — your order ID and a photo are enough.",
          ],
        },
        {
          heading: "4. What we can't do",
          bullets: [
            "Refund a jar that has been opened, partially consumed, or whose seal has been broken (food safety law).",
            "Refund because “it’s too spicy” — the spice level is clearly listed on every product page; please read it before you order.",
            "Refund requests received more than 48 hours after delivery.",
          ],
        },
        {
          heading: "5. Cancellations",
          paragraphs: [
            "You can cancel an order for a full refund any time before it’s shipped. Once a tracking number has been issued, the order can no longer be cancelled — but it qualifies for the replacement/refund flow above if anything is wrong on arrival.",
          ],
        },
        {
          heading: "6. Refund timing",
          paragraphs: [
            "Once approved, refunds reach UPI accounts in 1–2 working days, debit/credit cards in 5–7 working days, and netbanking in 3–5 working days. The exact timing depends on your bank, not us.",
          ],
        },
      ]}
    />
  );
}
