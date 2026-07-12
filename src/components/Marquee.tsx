import { SITE_CONTENT } from "@/lib/content";

export default function Marquee() {
  // Duplicate items so the loop is seamless on any width
  const loop = [...SITE_CONTENT.marquee.items, ...SITE_CONTENT.marquee.items, ...SITE_CONTENT.marquee.items];

  return (
    <section className="relative py-5 md:py-6 bg-mom-pink overflow-hidden border-y border-mom-pink/40">
      <div className="flex whitespace-nowrap">
        <div className="flex shrink-0 animate-[marquee_45s_linear_infinite]">
          {loop.map((item, i) => (
            <span
              key={i}
              className="flex items-center shrink-0 text-sm md:text-base font-quirk tracking-[0.18em] uppercase text-white"
            >
              <span className="px-7 md:px-10">{item}</span>
              <span className="text-base md:text-lg" aria-hidden>🌶️</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
