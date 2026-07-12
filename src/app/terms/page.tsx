import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service — Mirchi O Mirchi",
  description: "The terms that apply when you use mirchiomirchi.com or buy from us.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="May 12, 2026"
      intro="By using mirchiomirchi.com (the “Site”) or buying any product from us, you agree to these terms. The Site is operated by Vivenza Marketing LLP (“we”, “us”, “our”)."
      sections={[
        {
          heading: "1. Eligibility",
          paragraphs: [
            "You must be at least 18 years old or accessing the Site under the supervision of a parent or legal guardian to buy from us.",
          ],
        },
        {
          heading: "2. Products + pricing",
          bullets: [
            "All prices are listed in Indian Rupees (₹) and include applicable GST unless stated otherwise at checkout.",
            "We try to display product photos and descriptions accurately, but small variation in colour, texture, or batch is normal for a hand-made food product.",
            "We reserve the right to correct pricing errors before the order is shipped. If an error is discovered after payment, we will notify you and refund the difference or, if you prefer, cancel and refund the order in full.",
          ],
        },
        {
          heading: "3. Orders + acceptance",
          paragraphs: [
            "Submitting an order is an offer to buy. We accept the offer when we send you an order confirmation email and capture payment via Razorpay. We may refuse or cancel any order — for example if the product is out of stock, if there is a pricing error, or if we suspect fraud.",
          ],
        },
        {
          heading: "4. Payment",
          paragraphs: [
            "Payments are processed by Razorpay. We do not see or store your full card or UPI details. You agree to Razorpay’s terms when completing the transaction.",
          ],
        },
        {
          heading: "5. Shipping, refunds, replacements",
          paragraphs: [
            "Shipping, refund, and replacement details live on the Shipping Policy and Refund Policy pages and are part of these Terms by reference.",
          ],
        },
        {
          heading: "6. Allergens + use",
          paragraphs: [
            "Our products contain chilli, garlic, and oil among other ingredients. They are spicy and not suitable for everyone. Read the label before use. We are not responsible for adverse reactions caused by an existing allergy or sensitivity you did not disclose, or for misuse of the product.",
          ],
        },
        {
          heading: "7. Intellectual property",
          paragraphs: [
            "All site content — brand name, logo, photos, illustrations, copy, code — is owned by Vivenza Marketing LLP or licensed to it. You may not copy, modify, or use it for any commercial purpose without written permission.",
          ],
        },
        {
          heading: "8. User content",
          paragraphs: [
            "If you submit a review, photo, or testimonial, you grant us a non-exclusive, royalty-free, perpetual licence to use it for marketing the brand, with attribution if you ask for it.",
          ],
        },
        {
          heading: "9. Limitation of liability",
          paragraphs: [
            "To the maximum extent permitted by law, our total liability to you for any claim related to a product or to the Site is limited to the amount you paid for the order in question. We are not liable for indirect, incidental, or consequential damages.",
          ],
        },
        {
          heading: "10. Governing law + jurisdiction",
          paragraphs: [
            "These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts at Mumbai, Maharashtra.",
          ],
        },
        {
          heading: "11. Changes",
          paragraphs: [
            "We may update these terms as the business evolves. The updated terms apply to orders placed after the new “last updated” date on this page.",
          ],
        },
      ]}
    />
  );
}
