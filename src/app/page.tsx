import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductShowcase from "@/components/ProductShowcase";
import Story from "@/components/Story";
import Ingredients from "@/components/Ingredients";
import Quality from "@/components/Quality";
import HowToEat from "@/components/HowToEat";
import Shop from "@/components/Shop";
import CharacterDivider from "@/components/CharacterDivider";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

export default function Home() {
  return (
    <SmoothScroll>
      {/* Hero first frame — preload for one-paint LCP. Only injected on home;
          Next hoists `<link>` rendered inside a server component to <head>. */}
      <link
        rel="preload"
        as="image"
        href="/frames/hero-0001.webp"
        type="image/webp"
        fetchPriority="high"
      />
      <Navigation />
      <main>
        <Hero />
        <Marquee />
        <ProductShowcase />
        <Story />
        <Ingredients />
        <CharacterDivider />
        <Quality />
        <HowToEat />
        <Shop />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
