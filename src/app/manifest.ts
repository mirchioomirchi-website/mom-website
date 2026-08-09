import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

// Web app manifest — lets mobile visitors "Add to Home Screen" with the
// right name/theme instead of a generic browser icon, and is a standard
// completeness signal (Lighthouse's installability check reads this file).
//
// Icons intentionally point at the existing favicon.ico rather than a
// freshly-generated PNG set: the only square brand-mark source art
// available in this repo is a 48×48 favicon frame containing tiny wordmark
// text, which upscales illegibly at 192×192/512×512. Fabricating a new icon
// mark (e.g. cropping a packaging character illustration) isn't something
// to do unreviewed — that's a real brand asset, not a technical file. A
// proper square icon (ideally 512×512 with safe-zone padding for Android's
// maskable-icon treatment) is a good follow-up once someone with design
// context can sign off on it.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Handcrafted Indian Thecha`,
    short_name: SITE_NAME,
    description:
      "Handcrafted Indian thecha. Three bold flavours. No fillers. No shortcuts.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF3D7",
    theme_color: "#1A0D04",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
