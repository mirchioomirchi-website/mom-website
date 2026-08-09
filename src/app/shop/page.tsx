import type { Metadata } from "next";
import ShopPageClient from "./ShopPageClient";
import { SITE_URL, safeJsonLd } from "@/lib/site";
import { getLiveProducts } from "@/lib/products-source";

const TITLE = "Shop — Mirchi O Mirchi";
const DESCRIPTION =
  "Three handcrafted thecha flavours and a combo pack. Real ingredients, real heat. Shop the full range.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/shop`,
    type: "website",
    locale: "en_IN",
    siteName: "Mirchi O Mirchi",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Same 5-minute revalidation as the PDP pages — keeps stock/price/photo
// edits made in Shopify Admin showing up here without a redeploy, and (the
// point of this fetch existing at all) means the grid can actually show a
// sold-out state instead of always rendering every product as purchasable.
export const revalidate = 300;

export default async function ShopPage() {
  const products = await getLiveProducts();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
    ],
  };

  // ItemList over the live catalogue — the standard structured-data shape
  // for a product-collection/category page, distinct from (and in addition
  // to) each product's own Product schema on its PDP.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mirchi O Mirchi — Shop",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/products/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }}
      />
      <ShopPageClient products={products} />
    </>
  );
}
