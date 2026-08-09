// Server-side bridge: merge live Shopify data onto our static product
// catalogue (src/lib/products.ts). Shopify is the source of truth for every
// field that has a matching metafield/native field — name, Hindi name,
// description, price, heat level, volume, flavour title/description,
// ingredients, accent color, and all three PDP photos. The static catalogue
// only supplies brand copy Shopify doesn't have yet (candy-hex `color` used
// off the PDP) and acts as the fallback if Shopify is unreachable or a
// specific metafield hasn't been filled in.
//
// USE THIS FROM SERVER COMPONENTS ONLY. Client components must keep using
// PRODUCTS from "@/lib/products" so they don't import the Shopify Admin
// modules into the browser bundle.
//
// Pattern:
//   import { getLiveProducts, getLiveProduct } from "@/lib/products-source";
//   const products = await getLiveProducts();   // in a Server Component

import {
  PRODUCTS,
  type Product,
  getProduct as getStaticProduct,
} from "@/lib/products";
import {
  getAllShopifyProductsFull,
  type ShopifyProductData,
} from "@/lib/shopify-product-data";

function mergeProduct(p: Product, live: ShopifyProductData | undefined): Product {
  if (!live) return p;
  return {
    ...p,
    name: live.title || p.name,
    nameHi: live.nameHi ?? p.nameHi,
    description: live.descriptionHtml || p.description,
    longDescription: live.descriptionHtml || p.longDescription,
    price: live.available && live.price ? Math.round(live.price) : p.price,
    originalPrice:
      live.compareAtPrice && live.compareAtPrice > (live.price ?? 0)
        ? Math.round(live.compareAtPrice)
        : p.originalPrice,
    heatLevel: live.heatLevel ?? p.heatLevel,
    weight: live.volumeLabel ?? p.weight,
    tagline: live.flavourTitle ?? p.tagline,
    storyText: live.flavourDescription ?? p.storyText,
    ingredients:
      live.ingredients && live.ingredients.length > 0
        ? live.ingredients
        : p.ingredients,
    pdpAccentColor: live.accentColor ?? p.pdpAccentColor,
    mainImage: live.mainImage ?? p.mainImage,
    closeupImage: live.imageCloseup ?? p.closeupImage,
    secondaryImage: live.imageLifestyle ?? p.secondaryImage,
    available: live.available,
  };
}

export async function getLiveProducts(): Promise<Product[]> {
  try {
    const liveMap = await getAllShopifyProductsFull();
    if (liveMap.size === 0) return PRODUCTS;
    return PRODUCTS.map((p) => mergeProduct(p, liveMap.get(p.slug)));
  } catch (err) {
    console.error("[products-source] live fetch failed, falling back", err);
    return PRODUCTS;
  }
}

export async function getLiveProduct(
  slug: string
): Promise<Product | undefined> {
  const all = await getLiveProducts();
  return all.find((p) => p.slug === slug) ?? getStaticProduct(slug);
}

// Server-authoritative stock check, called from the Razorpay/COD order
// endpoints right before money changes hands or a Shopify order is created —
// this is the check that actually matters, since any client-side "sold out"
// UI can be stale (multiple tabs, a cart added to before a flavor sold out,
// etc). Returns the slugs (from the requested items) that Shopify currently
// reports as unavailable. Fails OPEN (returns no unavailable slugs) if the
// live fetch itself fails, matching this file's existing fallback
// philosophy — a Shopify outage shouldn't block every checkout, just the
// specific stock check.
export async function getUnavailableSlugs(
  items: Array<{ slug: string; qty: number }>
): Promise<string[]> {
  if (items.length === 0) return [];
  let live: Product[];
  try {
    live = await getLiveProducts();
  } catch (err) {
    console.error("[products-source] stock check failed, failing open", err);
    return [];
  }
  const bySlug = new Map(live.map((p) => [p.slug, p]));
  const unavailable: string[] = [];
  for (const it of items) {
    const p = bySlug.get(it.slug);
    if (p && p.available === false) unavailable.push(it.slug);
  }
  return unavailable;
}
