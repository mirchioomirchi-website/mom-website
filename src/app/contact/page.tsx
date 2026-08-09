import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Instagram from "@/components/Instagram";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactFormSection from "@/components/contact/ContactFormSection";
import ContactInfo from "@/components/contact/ContactInfo";
import { SITE_URL, safeJsonLd } from "@/lib/site";

const TITLE = "Contact Us — Mirchi O Mirchi";
const DESCRIPTION =
  "Get in touch with Mirchi O Mirchi (Vivenza Marketing LLP). Email, phone, and registered office address for customer support and business enquiries.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/contact`,
    type: "website",
    locale: "en_IN",
    siteName: "Mirchi O Mirchi",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
  ],
};

export default function ContactPage() {
  return (
    <SmoothScroll>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <Navigation />
      <main>
        <ContactHero />
        <ContactFormSection />
        <ContactInfo />
        <Instagram />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
