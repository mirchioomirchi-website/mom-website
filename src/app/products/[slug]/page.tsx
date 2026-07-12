import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, getProduct } from "@/lib/products";
import { SITE_URL, safeJsonLd } from "@/lib/site";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
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
      images: [{ url: ogImage, width: 1200, height: 1200, alt: product.name }],
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
  const product = getProduct(slug);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription,
    image: `${SITE_URL}${product.image}`,
    sku: product.slug,
    brand: { "@type": "Brand", name: "Mirchi O Mirchi" },
    category: "Indian Condiment / Sauce / Thecha",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
