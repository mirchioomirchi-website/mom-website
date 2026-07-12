import Link from "next/link";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
      <main className="min-h-screen bg-mom-black text-white pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <header className="mb-16 text-center">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-mom-pink font-semibold mb-4">
              Journal
            </p>
            <h1 className="text-5xl md:text-7xl font-quirk uppercase leading-[0.95]">
              Stories from the Jar
            </h1>
            <p className="mt-6 text-white/70 max-w-2xl mx-auto">
              Thecha culture, ingredient deep-dives, kitchen experiments, and the
              occasional grandma story.
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <p className="text-white/60 text-sm">
                No posts yet — the first one is in the oven.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-mom-pink/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,25,127,0.15)]"
                >
                  {post.coverImage && (
                    <div className="aspect-[16/10] overflow-hidden bg-mom-black/40">
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
                      className="text-[10px] uppercase tracking-[0.25em] text-white/40"
                    >
                      {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <h2 className="text-xl font-quirk mt-3 group-hover:text-mom-pink transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-white/60 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
