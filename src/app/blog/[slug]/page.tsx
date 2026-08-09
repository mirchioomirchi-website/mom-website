import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "next-sanity";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollReveal } from "@/components/primitives";
import { getBlogPost, listBlogSlugs, urlForImage } from "@/lib/blog";
import { SITE_URL, safeJsonLd } from "@/lib/site";

// Allow only safe URL schemes in blog body links. Sanity content is authored
// by a (currently single) trusted editor, but javascript:/data:/vbscript:
// URLs would execute on click — defence in depth in case the editor pool
// grows or the Sanity account is compromised.
function safeLinkHref(href: string | undefined): string {
  if (!href || typeof href !== "string") return "#";
  const trimmed = href.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return "#";
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await listBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  const title = post.seoTitle || `${post.title} — Mirchi O Mirchi`;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.coverImage ? urlForImage(post.coverImage) : `${SITE_URL}/images/jar-mixed-final.webp`;
  return {
    title,
    description: post.excerpt,
    keywords: post.seoKeywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: post.excerpt,
      url,
      type: "article",
      locale: "en_IN",
      siteName: "Mirchi O Mirchi",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

const portableComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlForImage(value)}
            alt={value.alt || ""}
            className="w-full"
            loading="lazy"
          />
          {value.alt && (
            <figcaption className="text-body-sm text-dark/60 mt-3 text-center">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-h3 font-bold text-green mt-12 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-h4 font-bold text-green mt-10 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-red pl-6 my-8 text-body text-dark/70 italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="text-body text-dark/80 mb-5">{children}</p>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = safeLinkHref(value?.href);
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red underline underline-offset-2 hover:text-red/80 transition-colors"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="text-dark font-bold">{children}</strong>,
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: post.author || "Team MOM" },
    // References the Organization declared once in the root layout's JSON-LD
    // (present in this same page's <head>) instead of repeating the full
    // object on every article — see the comment above ORGANIZATION_ID in
    // layout.tsx for why.
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: post.coverImage ? urlForImage(post.coverImage) : `${SITE_URL}/images/jar-mixed-final.webp`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <Navigation />
      <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
        />
        <article className="max-w-3xl mx-auto px-5 md:px-9">
          <ScrollReveal>
            <header className="mb-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-btn text-dark/70 hover:text-red transition-colors"
              >
                <span aria-hidden="true">←</span> Back to journal
              </Link>
              <time
                dateTime={post.publishedAt}
                className="block text-tag text-dark/60 uppercase tracking-[0.06em] mt-6"
              >
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {post.author ? ` · ${post.author}` : ""}
              </time>
              <h1 className="text-h1 text-red mt-4 mb-6">{post.title}</h1>
              <p className="text-body text-dark/80">{post.excerpt}</p>
            </header>
          </ScrollReveal>

          {post.coverImage && (
            <ScrollReveal delay={0.05}>
              <div className="mb-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlForImage(post.coverImage)}
                  alt={post.coverImage.alt || post.title}
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.08}>
            <div>
              {post.body ? (
                <PortableText value={post.body} components={portableComponents} />
              ) : null}
            </div>

            {post.tags && post.tags.length > 0 && (
              <footer className="mt-16 pt-8">
                <div className="dotted-divider text-dark/15 mb-8" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-body-sm text-dark/60 border border-dark/15 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </footer>
            )}
          </ScrollReveal>
        </article>
      </main>
      <Footer />
    </>
  );
}
