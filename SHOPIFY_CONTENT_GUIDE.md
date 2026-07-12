# Editing Site Content from Shopify Admin

## What this gets you

Today, the marketing copy on https://mom-website-eight.vercel.app lives in `src/lib/content.ts`. To change it, a developer edits that file.

After you finish this one-time setup, the copy will be editable from **Shopify Admin → Content → Metaobjects**. No code touches needed.

The site reads Shopify Metaobjects on load, with the local `content.ts` as a fallback — so if Shopify is unreachable, the site never breaks.

---

## One-time setup (10 minutes)

### Step 1: Open Metaobjects

Go to: **Settings → Custom data → Metaobjects** in Shopify Admin.

(Or directly: https://admin.shopify.com/store/mirchi-o-mirchi/settings/custom_data/metaobjects)

### Step 2: Create the definitions

Click **Add definition** for each row below. The **Type** field is what matters — must match exactly.

| Section | Type (exact) | Fields to add | Field types |
|---------|-------------|---------------|-------------|
| Marquee | `site_marquee` | `items` | List of single-line text |
| Hero | `site_hero` | `eyebrow`, `headingTop`, `headingMid`, `headingBottom`, `tagline` | List of single-line text + 4× single-line text |
| Meet MOM | `site_meet_mom` | `eyebrow`, `headingHtml`, `body`, `characters` | 3× single-line text + JSON string |
| Ingredients | `site_ingredients` | `eyebrow`, `heading`, `items`, `footerHtml` | 3× single-line text + JSON string |
| Quality | `site_quality` | `eyebrow`, `heading`, `subheading`, `rows` | 3× single-line text + JSON string |
| Story | `site_story` | `eyebrow`, `heading`, `stats` | 2× single-line text + JSON string |
| Shop | `site_shop` | `eyebrow`, `heading`, `trustSignals` | 2× single-line text + List |
| Footer | `site_footer` | `newsletter`, `brand`, `columns`, `legal` | 3× JSON + 1× text |
| Nav | `site_nav` | `items`, `ctaLabel`, `ctaHref` | JSON + 2× text |
| Character speech | `site_character_speech` | `variantsPeek`, `shopPeek`, `dividerSay` | 3× single-line text |

### Step 3: Add one entry per definition

For each definition you created, click **Add entry**, set the **handle** to the same name as the type (e.g. `site_hero`), then fill in the fields.

To match the current site exactly, copy values from `src/lib/content.ts`. For JSON fields (like `characters`, `items`, `rows`), copy the array verbatim.

### Step 4: That's it

The site fetches Metaobjects every page load (cached for 60 seconds). Your edits go live within ~1 minute.

---

## How the merge works

```
Site content = SHOPIFY_OVERRIDES (if present) ∪ LOCAL_DEFAULTS
```

- If you set `eyebrow` for `site_hero` in Shopify, it overrides the local default.
- If you DON'T set it, the local value renders.
- If the entire `site_hero` Metaobject is missing, the entire local hero renders.

This means you can override one field at a time, or all of them, or none — the site always works.

---

## Content fields reference

Open `src/lib/content.ts` to see the exact shape of every field. JSON fields (like `meetMOM.characters`) need to match this structure:

```ts
characters: [
  { name: "Green Chilli", trait: "Classy. Sassy. Bad-assy.", image: "/images/character-3.png", bg: "#CDDC39" },
  // ...
]
```

When pasting into a Shopify JSON field, paste only the array (without the wrapping `characters:`).

---

## When you'd prefer NOT to use this

For purely text edits (like changing "Bold Flavour" to "Real Heat"), this Metaobject path is great.

For structural changes (adding a new ingredient card, changing layout, swapping section order), you still need a code change. Tell me and I'll ship it.

---

## Future: I can create the Metaobject definitions for you via API

To skip Step 2 (creating 10 definitions manually), you can generate a **Shopify Admin API token** and I'll create them programmatically:

1. Settings → Apps → **Develop apps** → Create a private app
2. Configure Admin API scopes: `read_metaobject_definitions`, `write_metaobject_definitions`, `read_metaobjects`, `write_metaobjects`
3. Install the app, copy the Admin API access token
4. Paste it to me

I'll then run a script that creates all 10 definitions + entries with the current content prepopulated. Saves you 10 minutes of clicking.
