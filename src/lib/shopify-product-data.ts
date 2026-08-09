// Fetches the FULL Product Detail Page data set from Shopify Admin — title,
// description, price, the native product photo, and every custom PDP
// metafield (Hindi name, heat level, volume label, flavour title/description,
// ingredients, accent color, closeup + lifestyle images). This is the single
// source of truth for everything shown on /products/[slug]; the static
// catalogue in src/lib/products.ts is only a resilience fallback for when
// Shopify is unreachable or a field hasn't been set on a given product yet.
//
// Uses the Admin API (not the Storefront API in shopify.ts) because custom
// metafields aren't exposed to the Storefront API unless explicitly granted
// storefront visibility — the Admin API has no such restriction, and
// shopify-admin.ts already has working OAuth client-credentials auth wired
// up server-side.
//
// SERVER-SIDE ONLY — do not import from a "use client" component.

import { adminFetch, shopifyAdminConfigured } from "@/lib/shopify-admin";

export type ShopifyProductData = {
  handle: string;
  title: string;
  descriptionHtml: string;
  price: number | null;
  compareAtPrice: number | null;
  available: boolean;
  mainImage: string | null;
  nameHi: string | null;
  heatLevel: string | null;
  volumeLabel: string | null;
  flavourTitle: string | null;
  flavourDescription: string | null;
  ingredients: string[] | null;
  accentColor: string | null;
  imageCloseup: string | null;
  imageLifestyle: string | null;
};

// One request for every product, using field aliases for each custom
// metafield so we get fully-typed keys back instead of a generic connection.
const ALL_PRODUCTS_FULL_QUERY = /* GraphQL */ `
  query AllProductsFull {
    products(first: 20) {
      nodes {
        id
        handle
        title
        descriptionHtml
        featuredMedia {
          preview {
            image {
              url
            }
          }
        }
        variants(first: 1) {
          nodes {
            id
            price
            compareAtPrice
            availableForSale
          }
        }
        nameHi: metafield(namespace: "custom", key: "name_hi") {
          value
        }
        heatLevel: metafield(namespace: "custom", key: "heat_level") {
          value
        }
        volumeLabel: metafield(namespace: "custom", key: "volume_label") {
          value
        }
        flavourTitle: metafield(namespace: "custom", key: "flavour_title") {
          value
        }
        flavourDescription: metafield(
          namespace: "custom"
          key: "flavour_description"
        ) {
          value
        }
        ingredients: metafield(namespace: "custom", key: "ingredients") {
          value
        }
        accentColor: metafield(namespace: "custom", key: "accent_color") {
          value
        }
        imageCloseup: metafield(namespace: "custom", key: "image_closeup") {
          reference {
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
        imageLifestyle: metafield(
          namespace: "custom"
          key: "image_lifestyle"
        ) {
          reference {
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

type MetafieldValue = { value: string } | null;
type ImageRefMetafield = { reference: { image: { url: string } } | null } | null;

type AllProductsFullResp = {
  products: {
    nodes: Array<{
      id: string;
      handle: string;
      title: string;
      descriptionHtml: string;
      featuredMedia: {
        preview: { image: { url: string } | null } | null;
      } | null;
      variants: {
        nodes: Array<{
          id: string;
          price: string;
          compareAtPrice: string | null;
          availableForSale: boolean;
        }>;
      };
      nameHi: MetafieldValue;
      heatLevel: MetafieldValue;
      volumeLabel: MetafieldValue;
      flavourTitle: MetafieldValue;
      flavourDescription: MetafieldValue;
      ingredients: MetafieldValue;
      accentColor: MetafieldValue;
      imageCloseup: ImageRefMetafield;
      imageLifestyle: ImageRefMetafield;
    }>;
  };
};

function parseIngredients(raw?: string | null): string[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
    return null;
  } catch {
    return null;
  }
}

// Small in-memory cache — the same 5-minute pattern used elsewhere in the
// Shopify clients, so edits made in Shopify Admin show up on the site within
// a few minutes without needing a redeploy.
let cache: { fetchedAt: number; data: Map<string, ShopifyProductData> } | null =
  null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchAllShopifyProducts(): Promise<
  Map<string, ShopifyProductData>
> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache.data;

  const map = new Map<string, ShopifyProductData>();
  if (!shopifyAdminConfigured) return map;

  const { data } = await adminFetch<AllProductsFullResp>(
    ALL_PRODUCTS_FULL_QUERY
  );
  if (!data) return cache?.data ?? map;

  for (const p of data.products.nodes) {
    const variant = p.variants.nodes[0];
    map.set(p.handle, {
      handle: p.handle,
      title: p.title,
      descriptionHtml: p.descriptionHtml,
      price: variant ? Number(variant.price) : null,
      compareAtPrice: variant?.compareAtPrice ? Number(variant.compareAtPrice) : null,
      available: variant?.availableForSale ?? true,
      mainImage: p.featuredMedia?.preview?.image?.url ?? null,
      nameHi: p.nameHi?.value ?? null,
      heatLevel: p.heatLevel?.value ?? null,
      volumeLabel: p.volumeLabel?.value ?? null,
      flavourTitle: p.flavourTitle?.value ?? null,
      flavourDescription: p.flavourDescription?.value ?? null,
      ingredients: parseIngredients(p.ingredients?.value),
      accentColor: p.accentColor?.value ?? null,
      imageCloseup: p.imageCloseup?.reference?.image?.url ?? null,
      imageLifestyle: p.imageLifestyle?.reference?.image?.url ?? null,
    });
  }

  cache = { fetchedAt: now, data: map };
  return map;
}

export async function getAllShopifyProductsFull(): Promise<
  Map<string, ShopifyProductData>
> {
  try {
    return await fetchAllShopifyProducts();
  } catch (err) {
    console.error("[shopify-product-data] fetch failed", err);
    return cache?.data ?? new Map();
  }
}

export async function getShopifyProductFull(
  handle: string
): Promise<ShopifyProductData | null> {
  const all = await getAllShopifyProductsFull();
  return all.get(handle) ?? null;
}
