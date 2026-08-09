import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — Mirchi O Mirchi",
  description:
    "How Mirchi O Mirchi (Vivenza Marketing LLP) collects, uses, and protects your information.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="May 12, 2026"
      intro="Mirchi O Mirchi is operated by Vivenza Marketing LLP (“we”, “us”, “our”). This policy explains what personal information we collect when you visit mirchiomirchi.com or buy from us, how we use it, who we share it with, and the rights you have over it."
      sections={[
        {
          heading: "1. Information we collect",
          paragraphs: [
            "We only collect what is needed to ship orders, process payments, and improve the site.",
          ],
          bullets: [
            "Contact + shipping details you give us at checkout: name, email, phone, address, city, state, pincode.",
            "Phone number you submit through a \"get 5% off\" signup (the banner or popup asking for your mobile number) — collected only when you voluntarily submit it, used to send you WhatsApp/SMS updates about new batches, drops, and offers, and to log/honour the discount code you were given.",
            "Payment metadata returned by Razorpay (payment ID, order ID, status). We do NOT store card numbers, UPI IDs, or CVVs — those are handled entirely by Razorpay.",
            "Anonymous analytics events (page views, add-to-cart, purchase) via Google Analytics and Meta Pixel — used to understand which pages and products perform best.",
            "Standard server logs (IP, browser, timestamp) retained for security and abuse prevention.",
          ],
        },
        {
          heading: "2. How we use it",
          bullets: [
            "Fulfilling and shipping your order.",
            "Sending order confirmations, shipping updates, and receipts.",
            "Customer support for questions about an order you placed.",
            "Aggregate, non-identifying analytics to improve the site, copy, and product mix.",
            "Marketing messages only if you opt in — by submitting your phone number via a discount signup (WhatsApp/SMS) or joining our newsletter (email) — and you can unsubscribe anytime via the link in every email or by replying STOP to any WhatsApp/SMS message.",
          ],
        },
        {
          heading: "3. Who we share it with",
          paragraphs: [
            "We do not sell your data. We share it only with the third parties needed to run the store:",
          ],
          bullets: [
            "Razorpay — to process payments (PCI-DSS compliant).",
            "Shipping partners — to deliver your order (name, address, phone only).",
            "Google Analytics + Meta Pixel — anonymous, aggregated usage data.",
            "Vercel (hosting), Sanity (content management), Shopify (catalog + order records), and Resend (transactional email delivery) — standard infrastructure providers under their own data agreements.",
          ],
        },
        {
          heading: "4. Cookies",
          paragraphs: [
            "We use a small number of cookies and local-storage entries — to keep your cart between visits, to remember shipping details for faster checkout, and for the analytics tools above. You can clear them anytime via your browser.",
          ],
        },
        {
          heading: "5. Your rights",
          bullets: [
            "Ask us what we have on file about you.",
            "Ask us to correct it.",
            "Ask us to delete it (subject to our legal duty to keep order/tax records for the period required by Indian law).",
            "Opt out of marketing emails, WhatsApp, or SMS at any time.",
          ],
          paragraphs: [
            "Email contact@mirchiomirchi.com with your request. We respond within 14 working days.",
          ],
        },
        {
          heading: "6. Data retention + security",
          paragraphs: [
            "We keep order records as long as required by Indian tax and consumer protection laws (typically 8 years). Payment data is held by Razorpay, not by us. The site runs on HTTPS end-to-end and we use the minimum information needed for each step of the order.",
          ],
        },
        {
          heading: "7. Children",
          paragraphs: [
            "The site is not directed at children under 16. If you are under 16, please do not submit any personal information through the site.",
          ],
        },
        {
          heading: "8. Changes to this policy",
          paragraphs: [
            "We may update this policy as the business changes. Material changes will be noted at the top of this page along with a new “last updated” date.",
          ],
        },
        {
          heading: "9. Contact",
          paragraphs: [
            "Vivenza Marketing LLP — 3rd Floor, Office No. 8, Dealing Chambers, J.M. Road, Near Sai Service Petrol Pump, Pune, Maharashtra, India. Email contact@mirchiomirchi.com · Phone +91 88508 16448. We are based in India and Indian law governs this policy.",
          ],
        },
      ]}
    />
  );
}
