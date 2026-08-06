import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Instagram from "@/components/Instagram";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactFormSection from "@/components/contact/ContactFormSection";
import ContactInfo from "@/components/contact/ContactInfo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us — Mirchi O Mirchi",
  description:
    "Get in touch with Mirchi O Mirchi (Vivenza Marketing LLP). Email, phone, and registered office address for customer support and business enquiries.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <SmoothScroll>
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
