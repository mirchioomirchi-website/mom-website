import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "next-sanity";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
            className="w-full rounded-xl border border-white/10"
            loading="lazy"
          />
          {value.alt && (
            <figcaption className="text-xs text-white/50 mt-3 text-center">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl font-quirk mt-12 mb-4 text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-quirk mt-10 mb-3 text-white">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-mom-pink pl-6 my-8 text-white/80 italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="text-white/80 leading-relaxed mb-5">{children}</p>
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
          className="text-mom-pink underline underline-offset-2 hover:text-mom-pink/80"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="text-white">{children}</strong>,
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
    publisher: {
      "@type": "Organization",
      name: "Mirchi O Mirchi",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/mom-logo-white.webp`,
      },
    },
    image: post.coverImage ? urlForImage(post.coverImage) : `${SITE_URL}/images/jar-mixed-final.webp`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-mom-black text-white pt-32 pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
        />
        <article className="max-w-3xl mx-auto px-6">
          <header className="mb-12">
            <Link
              href="/blog"
              className="text-[10px] uppercase tracking-[0.3em] text-mom-pink hover:text-mom-pink/80 transition-colors"
            >
              ← Back to journal
            </Link>
            <time
              dateTime={post.publishedAt}
              className="block text-[11px] uppercase tracking-[0.25em] text-white/40 mt-6"
            >
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {post.author ? ` · ${post.author}` : ""}
            </time>
            <h1 className="text-4xl md:text-6xl font-quirk uppercase mt-4 leading-[0.95]">
              {post.title}
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">{post.excerpt}</p>
          </header>

          {post.coverImage && (
            <div className="rounded-2xl overflow-hidden border border-white/10 mb-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlForImage(post.coverImage)}
                alt={post.coverImage.alt || post.title}
                className="w-full aspect-[16/10] object-cover"
              />
            </div>
          )}

          <div className="prose-mom">
            {post.body ? (
              <PortableText value={post.body} components={portableComponents} />
            ) : null}
          </div>

          {post.tags && post.tags.length > 0 && (
            <footer className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full border border-white/15 text-white/60"
                >
                  {tag}
                </span>
              ))}
            </footer>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
