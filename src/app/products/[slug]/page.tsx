import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/products";
import { getLiveProduct, getLiveProducts } from "@/lib/products-source";
import { SITE_URL, safeJsonLd } from "@/lib/site";
import { SHIPPING_FLAT_RATE } from "@/lib/discounts";
import ProductDetailClient from "./ProductDetailClient";

// The static PRODUCTS catalogue's `image` field (unlike `mainImage`) is
// never swapped out for a live Shopify photo — see products-source.ts — so
// its actual pixel dimensions are safe to declare here rather than lying
// with a hardcoded "1200x1200" that doesn't match any real asset on disk.
const PRODUCT_IMAGE_WIDTH = 800;
const PRODUCT_IMAGE_HEIGHT = 1071;

// Re-check Shopify every 5 minutes (matches the in-memory cache TTL in
// shopify-product-data.ts) so metafield/price/photo edits made in Shopify
// Admin show up on the live site without a redeploy.
export const revalidate = 300;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveProduct(slug);
  if (!product) return {};
  const title = `${product.name} — Mirchi O Mirchi`;
  const url = `${SITE_URL}/products/${product.slug}`;
  const ogImage = `${SITE_URL}${product.image}`;
  return {
    title,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: product.description,
      url,
      type: "website",
      locale: "en_IN",
      siteName: "Mirchi O Mirchi",
      images: [
        {
          url: ogImage,
          width: PRODUCT_IMAGE_WIDTH,
          height: PRODUCT_IMAGE_HEIGHT,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allLive = await getLiveProducts();
  const product = allLive.find((p) => p.slug === slug);
  if (!product) notFound();

  const relatedProducts = allLive.filter((p) => p.slug !== slug);
  const productUrl = `${SITE_URL}/products/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.longDescription,
    image: `${SITE_URL}${product.image}`,
    sku: product.slug,
    brand: { "@type": "Brand", name: "Mirchi O Mirchi", "@id": `${SITE_URL}/#organization` },
    category: "Indian Condiment / Sauce / Thecha",
    weight: {
      "@type": "QuantitativeValue",
      value: product.isCombo ? 750 : 250,
      unitCode: "GRM",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.available === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      // Real policy, not boilerplate — see FAQ ("we do not accept returns
      // once delivered") and shiprocket.ts (Mumbai-only, pincodes "400*").
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        applicableCountry: "IN",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: SHIPPING_FLAT_RATE,
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
          addressRegion: "Maharashtra",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
