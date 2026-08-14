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
import RecipesSection from "@/components/RecipesSection";
import PdpCrossSell from "@/components/pdp/PdpCrossSell";
import { PDP_ACCENT_COLOR, Product } from "@/lib/products";
import { trackViewItem } from "@/lib/analytics-events";

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  useEffect(() => {
    trackViewItem(product);
  }, [product]);

  const accentColor = product.pdpAccentColor ?? PDP_ACCENT_COLOR[product.flavor];

  return (
    <SmoothScroll>
      <Navigation />
      <main>
        <PdpHero product={product} />
        <PdpStory product={product} />
        {!product.hideIngredients && <PdpIngredients product={product} />}
        <RecipesSection variant="pdp" accentColor={accentColor} />
        <PdpCrossSell relatedProducts={relatedProducts} />
        <Instagram />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
