"use client";

import { ScrollReveal } from "@/components/primitives";
import { SITE_CONTENT } from "@/lib/content";
import { PDP_ACCENT_COLOR, type Product } from "@/lib/products";

// Decorative corner mark — the actual curled-mirchi illustration asset
// (assets/PDP/mirchi ingridient.svg), inlined so it can sit crisp at a
// small size in each of the four corners. Fixed brand colors (not tinted
// per-product) — same two-tone red/green in every flavor's banner.
function MirchiCorner({ className }: { className?: string }) {
  return (
    <svg width="16" height="26" viewBox="0 0 22 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M10.3614 13.002L6.12368 9.84033C2.9509 12.2144 1.06499 15.9196 0 19.7026L0 23.6963C1.32014 27.5679 3.37246 31.1401 6.85586 33.5585C11.5152 36.7978 16.6848 34.8121 20.0795 30.774C21.3552 29.2542 21.921 27.4792 21.5105 25.4823C21.1999 23.9403 20.2348 22.2652 18.4931 21.5219C16.9289 20.8563 15.3314 21.4997 13.8559 22.1654C12.3805 22.831 11.5152 24.3397 12.4692 25.7819C12.8575 25.0053 13.0905 24.2731 13.5342 23.9736C14.9431 23.0528 17.3615 24.2842 18.3932 25.3048C19.9574 26.8469 16.2965 31.0735 11.97 31.3842C10.3614 31.4951 9.16334 30.4634 8.73068 28.999C8.1871 27.1464 7.59913 25.438 6.92242 23.5964C6.35665 22.0322 6.30118 20.2351 7.18867 18.682C8.23147 16.8626 9.00803 14.5551 10.3614 13.002Z"
        fill="#114A22"
      />
      <path
        d="M14.6769 0.000285614H14.5881C13.3678 2.25229 11.9922 6.19053 9.27427 7.37755C7.94304 7.96551 6.30118 8.30941 6.12368 9.84033L10.3614 13.002C11.5928 11.582 12.5136 10.9275 12.2917 8.35379C12.1586 6.87833 15.1983 2.18573 14.6658 0.000285614H14.6769Z"
        fill="#620000"
      />
    </svg>
  );
}

export default function PdpIngredients({ product }: { product: Product }) {
  const ingredientsDevanagari = SITE_CONTENT.ingredients.eyebrowDevanagari;
  const accentColor = product.pdpAccentColor ?? PDP_ACCENT_COLOR[product.flavor];

  return (
    <section className="relative bg-cream py-14 md:py-20 cv-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-5">
        <ScrollReveal>
          {/* Outer dotted frame — the site's global dotted border, sitting
              with a visible gap around the yellow box rather than flush
              against it. */}
          <div
            className="dotted-frame relative p-3 md:p-4"
            style={{ color: accentColor }}
          >
            <div
              className="relative rounded-md px-7 md:px-16 py-10 md:py-14"
              style={{ background: "#FFB300", color: accentColor }}
            >
              <MirchiCorner className="absolute top-4 left-4 md:top-6 md:left-6" />
              <MirchiCorner className="absolute top-4 right-4 md:top-6 md:right-6 -scale-x-100" />
              <MirchiCorner className="absolute bottom-4 left-4 md:bottom-6 md:left-6 -scale-y-100" />
              <MirchiCorner className="absolute bottom-4 right-4 md:bottom-6 md:right-6 scale-[-1]" />

              {/* Mobile-only heading row — centered, smaller than the actual
                  ingredient list below it, with a middot between the
                  Devanagari and English labels. */}
              <div className="md:hidden flex items-center justify-center gap-2 mb-6 font-sura" style={{ color: accentColor }}>
                <span className="text-lg font-medium">{ingredientsDevanagari}</span>
                <span aria-hidden="true" className="text-lg font-medium">·</span>
                <span className="text-lg font-medium">Ingredients</span>
              </div>

              {/* Desktop — the two side labels ("Ingredients" / देवनागरी) are
                  absolutely positioned rather than flex siblings of the
                  list. With `justify-between`, the list's centering depends
                  on the two labels being equal width — they aren't (English
                  vs Devanagari render at different widths), so the list sat
                  visibly off-center. Taking the labels out of flow lets
                  `justify-center` center the list against the box itself,
                  regardless of how wide either label renders. */}
              <div
                className="flex flex-col gap-6 md:relative md:flex md:items-center md:justify-center md:gap-0 md:px-36 lg:px-44 font-sura"
                style={{ color: accentColor }}
              >
                <span className="hidden md:block absolute left-0 text-3xl md:text-4xl font-medium">Ingredients</span>

                <ul className="flex flex-col items-center gap-3 md:gap-4">
                  {product.ingredients.map((ing) => (
                    <li key={ing} className="text-xl md:text-xl capitalize text-center">
                      {ing}
                    </li>
                  ))}
                </ul>

                <span className="hidden md:block absolute right-0 text-3xl md:text-4xl font-medium">{ingredientsDevanagari}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
