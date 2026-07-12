// Server-side bridge: merge live Shopify data (price, availability) onto our
// static product catalogue (descriptions, colours, ingredients — the brand
// content that doesn't live in Shopify).
//
// USE THIS FROM SERVER COMPONENTS ONLY. Client components must keep using
// PRODUCTS from "@/lib/products" so they don't import the Shopify Admin
// modules into the browser bundle.
//
// Pattern:
//   import { getLiveProducts, getLiveProduct } from "@/lib/products-source";
//   const products = await getLiveProducts();   // in `app/shop/page.tsx`
//
// When `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` is not set, we transparently
// return the static catalogue with no extra network round-trip.

import {
  PRODUCTS,
  type Product,
  getProduct as getStaticProduct,
} from "@/lib/products";
import {
  listShopifyProducts,
  shopifyConfigured,
} from "@/lib/shopify";

export async function getLiveProducts(): Promise<Product[]> {
  if (!shopifyConfigured) return PRODUCTS;
  try {
    const live = await listShopifyProducts();
    if (live.length === 0) return PRODUCTS;
    const liveByHandle = new Map(live.map((p) => [p.handle, p]));
    return PRODUCTS.map((p) => {
      const l = liveByHandle.get(p.slug);
      if (!l) return p;
      return {
        ...p,
        // Trust Shopify for price and availability; everything else stays
        // from our static brand-managed catalogue.
        price: l.price > 0 ? l.price : p.price,
      };
    });
  } catch (err) {
    console.error("[products-source] live fetch failed, falling back", err);
    return PRODUCTS;
  }
}

export async function getLiveProduct(slug: string): Promise<Product | undefined> {
  const all = await getLiveProducts();
  return all.find((p) => p.slug === slug) ?? getStaticProduct(slug);
}
