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
import { SITE_URL, safeJsonLd } from "@/lib/site";

const TITLE = "Our Story — Mirchi O Mirchi";
const DESCRIPTION =
  "How Mirchi O Mirchi started — fresh, handcrafted Maharashtrian thecha, made the way it's supposed to taste.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/about`,
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
    { "@type": "ListItem", position: 2, name: "Our Story", item: `${SITE_URL}/about` },
  ],
};

export default function AboutPage() {
  return (
    <SmoothScroll>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
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
