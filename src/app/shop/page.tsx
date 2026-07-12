import type { Metadata } from "next";
import ShopPageClient from "./ShopPageClient";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop — Mirchi O Mirchi",
  description:
    "Three handcrafted thecha flavours and a combo pack. Real ingredients, real heat. Shop the full range.",
  alternates: { canonical: `${SITE_URL}/shop` },
};

export default function ShopPage() {
  return <ShopPageClient />;
}
