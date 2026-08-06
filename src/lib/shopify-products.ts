// Merge layer: overlays live Shopify title/description/price onto the static
// PRODUCTS catalogue (src/lib/products.ts) by matching product slug ↔ Shopify
// handle. Gracefully falls back to the static value whenever Shopify isn't
// configured, a handle has no match, or the request fails — mirroring the
// safe-fallback design already used throughout src/lib/shopify.ts.
//
// NOTE: this only affects what's *displayed*. Authoritative checkout pricing
// (computeCartTotal / computeGrandTotal in products.ts) still reads the
// static `price` field, so Razorpay/Shopify-charged totals are unaffected by
// this overlay. If/when Shopify becomes the source of truth for pricing too,
// those functions should be updated to consult this merged data instead.

import { PRODUCTS, type Product } from "@/lib/products";
import { getShopifyProductByHandle, shopifyConfigured } from "@/lib/shopify";

export async function getMergedProducts(): Promise<Product[]> {
  if (!shopifyConfigured) return PRODUCTS;

  const merged = await Promise.all(
    PRODUCTS.map(async (product) => {
      try {
        const live = await getShopifyProductByHandle(product.slug);
        if (!live) return product;
        return {
          ...product,
          name: live.title || product.name,
          description: live.description || product.description,
          price: live.available && live.price ? Math.round(live.price) : product.price,
        };
      } catch {
        return product;
      }
    })
  );

  return merged;
}
