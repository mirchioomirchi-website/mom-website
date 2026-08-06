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
import { PRODUCTS } from "@/lib/products";
import { trackViewItemList } from "@/lib/analytics-events";

export default function ShopPageClient() {
  useEffect(() => {
    trackViewItemList(PRODUCTS, "Shop", "shop_grid");
  }, []);

  return (
    <SmoothScroll>
      <Navigation />
      <main>
        <ShopHero />
        <ShopProductGrid />
        <ShopDecisionBanner />
        <ShopCombo />
        <Instagram />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
