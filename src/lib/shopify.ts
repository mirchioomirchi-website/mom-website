// Shopify Storefront API — minimal product-lookup client.
//
// Required env vars (set in .env.local and Vercel project settings):
//   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN     e.g. "mirchi-o-mirchi.myshopify.com"
//   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN public access token from the Headless app
//   NEXT_PUBLIC_SHOPIFY_API_VERSION      defaults to "2025-01"
//
// Cart + checkout are NOT routed through Shopify any more — that flow lives in
// /checkout via Razorpay. This file only keeps a thin product-by-handle lookup
// in case we later want live price / inventory sync.

const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";

export const shopifyConfigured = Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);

const ENDPOINT = STORE_DOMAIN
  ? `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`
  : "";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  if (!shopifyConfigured) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      console.error("[shopify] HTTP error", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
      console.error("[shopify] GraphQL errors", json.errors);
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.error("[shopify] fetch failed", err);
    return null;
  }
}

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  variantId: string;
  price: number;
  currency: string;
  available: boolean;
};

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      variants(first: 1) {
        nodes {
          id
          availableForSale
          price { amount currencyCode }
        }
      }
    }
  }
`;

type ProductByHandleResp = {
  product: {
    id: string;
    handle: string;
    title: string;
    description: string;
    variants: {
      nodes: Array<{
        id: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
      }>;
    };
  } | null;
};

export async function getShopifyProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<ProductByHandleResp>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
  const p = data?.product;
  if (!p) return null;
  const v = p.variants.nodes[0];
  if (!v) return null;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    variantId: v.id,
    price: Number(v.price.amount),
    currency: v.price.currencyCode,
    available: v.availableForSale,
  };
}

const PRODUCTS_LIST_QUERY = /* GraphQL */ `
  query Products {
    products(first: 20) {
      nodes {
        id
        handle
        title
        description
        variants(first: 1) {
          nodes {
            id
            availableForSale
            price { amount currencyCode }
          }
        }
      }
    }
  }
`;

type ProductsListResp = {
  products: {
    nodes: Array<{
      id: string;
      handle: string;
      title: string;
      description: string;
      variants: {
        nodes: Array<{
          id: string;
          availableForSale: boolean;
          price: { amount: string; currencyCode: string };
        }>;
      };
    }>;
  };
};

// Small server-side cache so we don't hit Shopify on every page render. The
// catalogue rarely changes — 5 minutes is fine. Founder edits will reflect
// within that window without a redeploy.
let listCache: { fetchedAt: number; data: ShopifyProduct[] } | null = null;
const LIST_CACHE_TTL_MS = 5 * 60 * 1000;

export async function listShopifyProducts(): Promise<ShopifyProduct[]> {
  if (!shopifyConfigured) return [];
  const now = Date.now();
  if (listCache && now - listCache.fetchedAt < LIST_CACHE_TTL_MS) {
    return listCache.data;
  }
  const data = await shopifyFetch<ProductsListResp>(PRODUCTS_LIST_QUERY);
  if (!data) return listCache?.data ?? [];
  const products: ShopifyProduct[] = data.products.nodes
    .map((p) => {
      const v = p.variants.nodes[0];
      if (!v) return null;
      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        description: p.description,
        variantId: v.id,
        price: Number(v.price.amount),
        currency: v.price.currencyCode,
        available: v.availableForSale,
      };
    })
    .filter((x): x is ShopifyProduct => x !== null);
  listCache = { fetchedAt: now, data: products };
  return products;
}
