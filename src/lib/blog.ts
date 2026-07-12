// Sanity-backed blog data layer.
//
// Returns [] if Sanity isn't configured yet — pages just render an empty
// state instead of crashing. Once NEXT_PUBLIC_SANITY_PROJECT_ID is set in
// Vercel + you create blog posts in /studio, posts appear on /blog within
// ~60 seconds (revalidate cache window).

import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image as SanityImage } from "sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const blogConfigured = Boolean(projectId);

const client = blogConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: "2024-12-01",
      useCdn: true,
      perspective: "published",
    })
  : null;

const builder = client ? createImageUrlBuilder(client) : null;

export function urlForImage(source: SanityImage) {
  if (!builder) return "";
  return builder.image(source).auto("format").fit("max").url();
}

export type BlogPostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  author?: string;
  tags?: string[];
  coverImage?: SanityImage & { alt?: string };
};

export type BlogPost = BlogPostSummary & {
  body: unknown;
  seoTitle?: string;
  seoKeywords?: string[];
};

const POSTS_LIST_QUERY = /* groq */ `
  *[_type == "blogPost" && defined(slug.current) && !(_id in path("drafts.**"))]
  | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    author,
    tags,
    coverImage
  }
`;

const POST_BY_SLUG_QUERY = /* groq */ `
  *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    author,
    tags,
    coverImage,
    body,
    seoTitle,
    seoKeywords
  }
`;

export async function listBlogPosts(): Promise<BlogPostSummary[]> {
  if (!client) return [];
  try {
    return (
      (await client.fetch<BlogPostSummary[]>(POSTS_LIST_QUERY, {}, {
        next: { revalidate: 60, tags: ["blog"] },
      })) ?? []
    );
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (!client) return null;
  try {
    return (
      (await client.fetch<BlogPost>(POST_BY_SLUG_QUERY, { slug }, {
        next: { revalidate: 60, tags: [`blog:${slug}`] },
      })) ?? null
    );
  } catch {
    return null;
  }
}

export async function listBlogSlugs(): Promise<string[]> {
  const posts = await listBlogPosts();
  return posts.map((p) => p.slug).filter(Boolean);
}
