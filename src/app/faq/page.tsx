import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import FaqHero from "@/components/faq/FaqHero";
import FaqList from "@/components/faq/FaqList";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs — Mirchi O Mirchi",
  description:
    "Answers to common questions about Mirchi O Mirchi thecha — freshness, shelf life, spice level, delivery, and returns.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default function FaqPage() {
  return (
    <SmoothScroll>
      <Navigation />
      <main>
        <FaqHero />
        <FaqList />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
