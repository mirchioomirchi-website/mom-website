// One-shot script — seeds 3 starter blog posts into the Sanity dataset so
// /blog isn't empty on launch. Skips posts whose slug already exists.
//
// Usage:
//   1. Add SANITY_WRITE_TOKEN to .env.local (token with Editor scope from
//      https://www.sanity.io/manage)
//   2. node scripts/seed-blog.mjs
//
// You can rerun it safely — duplicates are skipped.

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
try {
  const txt = readFileSync(envPath, "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
} catch {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_WRITE_TOKEN in .env.local — generate one at https://www.sanity.io/manage (Editor scope)."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const block = (text) => ({
  _type: "block",
  style: "normal",
  children: [{ _type: "span", text, marks: [] }],
  markDefs: [],
});

const heading = (text, level = "h2") => ({
  _type: "block",
  style: level,
  children: [{ _type: "span", text, marks: [] }],
  markDefs: [],
});

const posts = [
  {
    slug: "why-no-preservatives",
    title: "Why we don't put preservatives in our thecha",
    excerpt:
      "Most jarred condiments live for 18 months on a shelf because of what's added to them. Ours don't. Here's the trade-off — and why we made it.",
    tags: ["ingredients", "philosophy", "thecha"],
    seoKeywords: ["preservative free thecha", "natural condiment india", "handmade thecha"],
    body: [
      block(
        "Walk down any supermarket aisle and pick up a jar of chilli chutney. Read the back label. Somewhere between the second and third line you'll see things like sodium benzoate, potassium sorbate, INS 211 — preservatives that lock the jar in stasis for 18 months."
      ),
      block(
        "We chose not to do that. Our jars use seven real ingredients: fresh chillies, garlic, coriander, cold-pressed olive oil, lemon, cumin, salt, sugar. That's it. Nothing else. Which means a Mirchi O Mirchi jar lasts about 6 months sealed, and 3-4 weeks once you open it and keep it in the fridge."
      ),
      heading("So why didn't we just add the preservative?"),
      block(
        "Because the texture, the smell, the burn — all the things that make hand-pounded thecha hit the way it does — get a little flatter every time you add a chemical that's there to stop microbial growth. The same molecules that stop bacteria also subtly mute flavour."
      ),
      block(
        "If we wanted shelf life, we'd have an 18-month product. We chose flavour over shelf life. The jar lives in your fridge for a few weeks. Then you order another one."
      ),
      heading("What we do instead"),
      block(
        "Three things keep the jar safe without preservatives — high oil content (which seals the chilli paste from oxygen), salt (which suppresses bacteria), and acidity from lemon (which keeps pH below the danger zone). Plus a hot fill at packaging."
      ),
      block(
        "That's it. Nothing fancy. Just food made the way Indian kitchens have made thecha for two centuries — but in a glass jar so you don't have to make it yourself."
      ),
    ],
  },
  {
    slug: "five-ways-to-eat-thecha",
    title: "Five ways to eat thecha you haven't tried",
    excerpt:
      "Bhakri-thecha-pyaaz is the classic. We love it. But thecha doesn't have to stop there. Five combinations that surprised us in our own kitchen.",
    tags: ["recipes", "pairings", "ideas"],
    seoKeywords: ["thecha recipes", "how to use thecha", "indian condiment pairings"],
    body: [
      block(
        "Most people meet thecha next to a bhakri with a slice of onion, and that's a perfect entry point. But we've watched friends, family, and now customers do strange and wonderful things with the jar. Five favourites:"
      ),
      heading("1. Cheese toast, with a thin smear of green thecha"),
      block(
        "Sourdough, salted butter, cheddar, and the thinnest possible layer of green chilli thecha under the cheese. Grill till bubbly. The garlic hits before the heat does. Better than any commercial chilli oil on toast."
      ),
      heading("2. Maggi water (controversial)"),
      block(
        "Boil your Maggi as usual. Once the noodles are in, stir half a teaspoon of red thecha into the water. It dissolves into the seasoning and turns the broth into something Maggi engineers never approved of. Try it once."
      ),
      heading("3. Avocado toast"),
      block(
        "Mash avocado on toast. Salt. Squeeze of lemon. A teaspoon of mixed thecha on top. The fat in the oil and the fat in the avocado work as one thing. Stop reading and go make this."
      ),
      heading("4. Dosa filling"),
      block(
        "Spread thin layer of thecha inside the dosa before you fold it. Especially good with red thecha and a regular potato filling. The thecha turns a basic masala dosa into something you remember."
      ),
      heading("5. Eggs, three ways"),
      block(
        "Scrambled — a quarter teaspoon stirred in at the very end. Omelette — a stripe down the middle before you fold. Sunny side up — a small dollop on top, then a torn slice of buttered toast. Pick your weapon."
      ),
      block(
        "If you find a sixth that we didn't, send it to hello@mirchiomirchi.com. The best ones go on our Instagram."
      ),
    ],
  },
  {
    slug: "stone-mortar-vs-machine",
    title: "Stone mortar vs machine: why hand-pounded thecha tastes different",
    excerpt:
      "There's a real, demonstrable reason hand-pounded thecha hits different. It's not nostalgia — it's chemistry. Quick read on what changes when you pound vs blend.",
    tags: ["craft", "process", "quality"],
    seoKeywords: ["hand pounded thecha", "stone mortar chutney", "traditional thecha making"],
    body: [
      block(
        "A blender chops. A stone mortar bruises. That single word — bruises — is why your grandmother's chutney tastes different from the supermarket jar even when the recipe looks identical."
      ),
      heading("What the blade does"),
      block(
        "Spinning blades shear plant cells in clean, parallel slices. The oils inside the cells stay mostly trapped. The texture goes uniform very quickly — which is why machine-blended chutney often looks smooth but tastes flat. The flavour compounds are still inside the cell walls, never released."
      ),
      heading("What the stone does"),
      block(
        "A stone pestle crushes against an uneven surface. Cell walls rupture irregularly. Volatile oils — the allicin in garlic, the capsaicinoids in chilli, the limonene in coriander — escape and start oxidising as they hit the air. You can smell when this is happening. It's the smell people walk past a Maharashtrian kitchen and remember a year later."
      ),
      block(
        "The other thing the stone does is mix slowly. Garlic and chilli have time to introduce themselves to each other. The oil starts emulsifying with the lemon. By the time the paste is done, it's not three ingredients next to each other — it's one thing."
      ),
      heading("So how do you scale that"),
      block(
        "You don't, really. We use stone for the first phase — bruising the chilli and garlic together with salt — and then mix it through with oil and the rest by hand. We've tried full-machine batches and tasted the difference within two minutes. So we don't."
      ),
      block(
        "Which is also why one batch ≠ another batch. Same ingredients, slightly different jar. If you want consistency at the molecular level, buy a brand that uses a blender. If you want flavour, you're in the right place."
      ),
    ],
  },
];

async function exists(slug) {
  const q = `count(*[_type == "blogPost" && slug.current == $slug])`;
  return (await client.fetch(q, { slug })) > 0;
}

let created = 0;
let skipped = 0;
for (const p of posts) {
  if (await exists(p.slug)) {
    console.log(`  skip (slug exists): ${p.slug}`);
    skipped++;
    continue;
  }
  const doc = {
    _type: "blogPost",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    excerpt: p.excerpt,
    publishedAt: new Date().toISOString(),
    author: "Team MOM",
    tags: p.tags,
    seoKeywords: p.seoKeywords,
    body: p.body,
  };
  const result = await client.create(doc);
  console.log(`  + ${result._id} · ${p.slug}`);
  created++;
}

console.log(`\n✓ ${created} post(s) created, ${skipped} skipped.`);
console.log(
  `View at: https://${projectId}.sanity.studio/desk/blogPost  OR  /studio on the site`
);
