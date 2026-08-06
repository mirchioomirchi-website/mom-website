import Link from "next/link";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollReveal } from "@/components/primitives";
import { listBlogPosts, urlForImage } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  // Until the first post lands, keep the index out of Google's results — an
  // empty listing page hurts SEO and reads as broken to crawlers.
  const posts = await listBlogPosts();
  const isEmpty = posts.length === 0;
  return {
    title: "Blog — Mirchi O Mirchi",
    description:
      "Stories about thecha, Maharashtrian food culture, and the ingredients behind every jar.",
    alternates: { canonical: `${SITE_URL}/blog` },
    robots: isEmpty ? { index: false, follow: true } : undefined,
    openGraph: {
      title: "Blog — Mirchi O Mirchi",
      description:
        "Stories about thecha, Maharashtrian food culture, and the ingredients behind every jar.",
      url: `${SITE_URL}/blog`,
      type: "website",
      locale: "en_IN",
      siteName: "Mirchi O Mirchi",
    },
  };
}

export default async function BlogIndex() {
  const posts = await listBlogPosts();

  return (
    <>
      <Navigation />
      <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
        <div className="max-w-[1400px] mx-auto px-5 md:px-9">
          <ScrollReveal>
            <header className="mb-14 md:mb-16 max-w-2xl">
              <p className="text-tag text-red uppercase tracking-[0.08em] mb-4">
                Journal
              </p>
              <h1 className="text-h1 text-green mb-5">Stories from the jar</h1>
              <p className="text-body text-dark/80">
                Thecha culture, ingredient deep-dives, kitchen experiments, and the
                occasional grandma story.
              </p>
            </header>
          </ScrollReveal>

          {posts.length === 0 ? (
            <ScrollReveal>
              <div className="bg-cream-dark p-12 text-center">
                <p className="text-body text-dark/60">
                  No posts yet — the first one is in the oven.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <ScrollReveal key={post._id} delay={Math.min(i * 0.05, 0.2)}>
                  <Link href={`/blog/${post.slug}`} className="group block bg-cream-dark">
                    {post.coverImage && (
                      <div className="aspect-[16/10] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlForImage(post.coverImage)}
                          alt={post.coverImage.alt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <time
                        dateTime={post.publishedAt}
                        className="text-body-sm text-dark/50 uppercase tracking-[0.06em]"
                      >
                        {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                      <h2 className="text-h4 font-bold text-dark mt-3 group-hover:text-red transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-body-sm text-dark/70 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
