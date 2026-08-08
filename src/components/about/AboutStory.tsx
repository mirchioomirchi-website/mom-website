"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";

const { heading, paragraphs } = SITE_CONTENT.aboutPage.story;

// Half-split photo + text panel — the same "media left, colored panel
// right" convention used on the PDP story section, just with a static
// photo instead of the wavy marquee. 80% of the viewport tall, so it lands
// flush against the hero section's bottom edge with no gap.
export default function AboutStory() {
  return (
    <section className="relative bg-cream cv-auto">
      <div className="grid md:grid-cols-2">
        <ScrollReveal>
          <div className="relative h-[35vh] md:h-[80vh]">
            <Image
              src="/images/about/thecha-moodshot.webp"
              alt="Hands sharing a spread of thecha, bhakri and sides"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="h-[45vh] md:h-[80vh] flex flex-col justify-center gap-4 bg-red px-6 md:px-14">
            <h2 className="text-h2 font-medium md:font-bold text-cream max-w-lg mb-4 md:mb-6">{heading}</h2>
            {paragraphs.map((p, i) => (
              <p
                key={p}
                className={`text-body max-w-lg ${
                  i === paragraphs.length - 1 ? "text-yellow" : "text-cream/80"
                }`}
              >
                {p}
              </p>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
