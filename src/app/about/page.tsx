import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Instagram from "@/components/Instagram";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutStory from "@/components/about/AboutStory";
import AboutQuote from "@/components/about/AboutQuote";
import AboutBrandReveal from "@/components/about/AboutBrandReveal";
import AboutMission from "@/components/about/AboutMission";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Story — Mirchi O Mirchi",
  description:
    "How Mirchi O Mirchi started — fresh, handcrafted Maharashtrian thecha, made the way it's supposed to taste.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <SmoothScroll>
      <Navigation />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutQuote />
        <AboutBrandReveal />
        <AboutMission />
        <Instagram variant="yellow" />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
