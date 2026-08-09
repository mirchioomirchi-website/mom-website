import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { listBlogPosts } from "@/lib/blog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productUrls: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Blog: ONLY include the /blog index + post URLs when there's at least one
  // published post. Empty /blog is noindex'd elsewhere (generateMetadata in
  // blog/page.tsx); including it in the sitemap while noindexed sends mixed
  // signals to crawlers.
  const posts = await listBlogPosts();
  const blogUrls: MetadataRoute.Sitemap =
    posts.length > 0
      ? [
          {
            url: `${SITE_URL}/blog`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.8,
          },
          ...posts.map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
            changeFrequency: "monthly" as const,
            priority: 0.7,
          })),
        ]
      : [];

  return [...staticUrls, ...productUrls, ...blogUrls];
}
