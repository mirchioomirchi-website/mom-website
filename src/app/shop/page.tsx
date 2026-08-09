import type { Metadata } from "next";
import ShopPageClient from "./ShopPageClient";
import { SITE_URL } from "@/lib/site";
import { getLiveProducts } from "@/lib/products-source";

export const metadata: Metadata = {
  title: "Shop — Mirchi O Mirchi",
  description:
    "Three handcrafted thecha flavours and a combo pack. Real ingredients, real heat. Shop the full range.",
  alternates: { canonical: `${SITE_URL}/shop` },
};

// Same 5-minute revalidation as the PDP pages — keeps stock/price/photo
// edits made in Shopify Admin showing up here without a redeploy, and (the
// point of this fetch existing at all) means the grid can actually show a
// sold-out state instead of always rendering every product as purchasable.
export const revalidate = 300;

export default async function ShopPage() {
  const products = await getLiveProducts();
  return <ShopPageClient products={products} />;
}
