import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import OurProcess from "@/components/OurProcess";
import Ingredients from "@/components/Ingredients";
import Recipes from "@/components/Recipes";
import Shop from "@/components/Shop";
import Instagram from "@/components/Instagram";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";
import { getLiveProducts } from "@/lib/products-source";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

// Re-check Shopify every 5 minutes (matches the in-memory cache TTL in
// shopify-product-data.ts) so metafield/price/photo edits show up live.
export const revalidate = 300;

export default async function Home() {
  const products = await getLiveProducts();

  return (
    <SmoothScroll>
      <Navigation />
      <main>
        <Hero />
        <ProductShowcase products={products} />
        <OurProcess />
        <Ingredients />
        <Recipes />
        <Shop />
        <Instagram />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
