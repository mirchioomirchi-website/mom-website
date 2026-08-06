"use client";

import { useEffect } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Instagram from "@/components/Instagram";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import PdpHero from "@/components/pdp/PdpHero";
import PdpStory from "@/components/pdp/PdpStory";
import PdpIngredients from "@/components/pdp/PdpIngredients";
import PdpPairing from "@/components/pdp/PdpPairing";
import PdpCrossSell from "@/components/pdp/PdpCrossSell";
import { Product } from "@/lib/products";
import { trackViewItem } from "@/lib/analytics-events";

export default function ProductDetailClient({ product }: { product: Product }) {
  useEffect(() => {
    trackViewItem(product);
  }, [product]);

  return (
    <SmoothScroll>
      <Navigation />
      <main>
        <PdpHero product={product} />
        <PdpStory product={product} />
        <PdpIngredients product={product} />
        <PdpPairing />
        <PdpCrossSell product={product} />
        <Instagram />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
