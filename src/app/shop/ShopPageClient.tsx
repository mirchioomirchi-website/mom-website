"use client";

import { useEffect } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Instagram from "@/components/Instagram";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import ShopHero from "@/components/shop/ShopHero";
import ShopProductGrid from "@/components/shop/ShopProductGrid";
import ShopDecisionBanner from "@/components/shop/ShopDecisionBanner";
import ShopCombo from "@/components/shop/ShopCombo";
import type { Product } from "@/lib/products";
import { trackViewItemList } from "@/lib/analytics-events";

export default function ShopPageClient({ products }: { products: Product[] }) {
  useEffect(() => {
    trackViewItemList(products, "Shop", "shop_grid");
    // Only fire once on mount with whatever the server handed us — re-firing
    // on every prop identity change isn't a concern here since `products`
    // is a fixed server-rendered prop, not client state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SmoothScroll>
      <Navigation />
      <main>
        <ShopHero />
        <ShopProductGrid products={products} />
        <ShopDecisionBanner />
        <ShopCombo />
        <Instagram />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
