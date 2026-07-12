// Pulls editable site content from Shopify Metaobjects via the Storefront API,
// then merges over the hard-coded defaults in lib/content.ts.
//
// Anything you set in Shopify admin overrides the matching key here. If a
// Metaobject is missing or the API is unreachable, the local defaults render.
// That means the site never breaks on a Shopify outage — you just lose
// admin-edited overrides until Shopify is back.
//
// How to set this up in Shopify (one-time):
//   See SHOPIFY_CONTENT_GUIDE.md in the repo root.

import { SITE_CONTENT } from "@/lib/content";
import { shopifyConfigured } from "@/lib/shopify";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";

// Metaobject types we'll look for in Shopify. Each maps 1:1 to a key in
// SITE_CONTENT. Edit the handles in admin to match these.
const METAOBJECT_HANDLES = {
  hero: "site_hero",
  meetMOM: "site_meet_mom",
  ingredients: "site_ingredients",
  quality: "site_quality",
  story: "site_story",
  shop: "site_shop",
  footer: "site_footer",
  marquee: "site_marquee",
  characterSpeech: "site_character_speech",
  nav: "site_nav",
} as const;

type MetaobjectField = { key: string; value: string };
type MetaobjectNode = {
  handle: string;
  type: string;
  fields: MetaobjectField[];
};

// Storefront API can only filter by a single type at a time, so we fan out.
async function fetchMetaobjectsOfType(type: string): Promise<MetaobjectNode[]> {
  if (!shopifyConfigured) return [];
  try {
    const res = await fetch(
      `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: /* GraphQL */ `
            query MetaobjectsByType($type: String!) {
              metaobjects(first: 1, type: $type) {
                nodes {
                  handle
                  type
                  fields { key value }
                }
              }
            }
          `,
          variables: { type },
        }),
        // Cache for 60s to avoid hammering Shopify on every page load.
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: { metaobjects?: { nodes?: MetaobjectNode[] } };
    };
    return json.data?.metaobjects?.nodes ?? [];
  } catch {
    return [];
  }
}

function fieldsToObject(fields: MetaobjectField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    // Try to parse JSON values (lists, structured data); fall back to string.
    try {
      out[f.key] = JSON.parse(f.value);
    } catch {
      out[f.key] = f.value;
    }
  }
  return out;
}

// Returns the content object — Shopify overrides merged onto local defaults.
// Safe to call from server components; results are cached by Next's fetch cache.
export async function getSiteContent(): Promise<typeof SITE_CONTENT> {
  if (!shopifyConfigured) return SITE_CONTENT;

  const overrides: Record<string, unknown> = {};
  await Promise.all(
    Object.entries(METAOBJECT_HANDLES).map(async ([sectionKey, type]) => {
      const nodes = await fetchMetaobjectsOfType(type);
      const node = nodes[0];
      if (!node) return;
      overrides[sectionKey] = fieldsToObject(node.fields);
    })
  );

  // Shallow-merge each section's overrides over the local defaults. Inner
  // arrays/objects from Shopify replace the local ones wholesale — keep this
  // in mind when only partial overrides are desired (use the full local copy
  // shape in Shopify if so).
  return Object.fromEntries(
    Object.entries(SITE_CONTENT).map(([key, defaultValue]) => {
      const override = overrides[key];
      if (!override || typeof override !== "object") return [key, defaultValue];
      return [key, { ...(defaultValue as object), ...(override as object) }];
    })
  ) as typeof SITE_CONTENT;
}
