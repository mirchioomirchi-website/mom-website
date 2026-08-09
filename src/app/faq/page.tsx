import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import FaqHero from "@/components/faq/FaqHero";
import FaqList from "@/components/faq/FaqList";
import { SITE_URL, safeJsonLd } from "@/lib/site";
import { SITE_CONTENT } from "@/lib/content";

const TITLE = "FAQs — Mirchi O Mirchi";
const DESCRIPTION =
  "Answers to common questions about Mirchi O Mirchi thecha — freshness, shelf life, spice level, delivery, and returns.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/faq`,
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

// Real, on-page Q&A content, flattened into a single FAQPage graph — this is
// exactly the kind of direct-answer-format content Google's FAQ rich result
// and AI answer engines (which quote question/answer pairs verbatim far more
// readily than prose) are built to surface. Sourced from SITE_CONTENT so it
// can never drift out of sync with what's actually shown on the page.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SITE_CONTENT.faqPage.categories.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    }))
  ),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "FAQs", item: `${SITE_URL}/faq` },
  ],
};

export default function FaqPage() {
  return (
    <SmoothScroll>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <Navigation />
      <main>
        <FaqHero />
        <FaqList />
        <CtaBanner />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
