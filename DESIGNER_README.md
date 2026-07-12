# Mirchi O' Mirchi — Designer Handover

Welcome! This is the codebase for **mirchiomirchi.com** — a D2C thecha (chilli condiment) brand. You're redesigning the front-end. This doc gets you running locally in ~15 minutes.

---

## What this is

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion (`motion` package) + Lenis (smooth scroll)
- **CMS:** Sanity (for blog posts only; product catalogue lives in Shopify)
- **Commerce:** Shopify Storefront API (read prices/inventory) + Shopify Admin API (write orders)
- **Payments:** Razorpay
- **Shipping:** Shiprocket (pincode serviceability)
- **Email:** Resend (transactional)
- **Hosted on:** Vercel

The site sells 3 thecha SKUs (red, green, mixed). Founder edits prices in Shopify Admin and the site picks them up within ~5 minutes — **no redeploy needed for price/inventory changes**.

---

## ⚠️ Important: Next.js 16 has breaking changes

This is **not** the Next.js you may know from tutorials. APIs, conventions, and file structure may differ from older Next.js docs (Next 14, 15). When in doubt, read `node_modules/next/dist/docs/` after running `npm install` — those are the in-tree docs for the exact version installed. Do not blindly trust ChatGPT/Stack Overflow snippets that target older versions.

---

## Setup (one-time)

### 1. Install Node.js 20 or higher
```bash
node --version   # should be v20.x or higher
```
If not, install from [nodejs.org](https://nodejs.org) (use the LTS).

### 2. Install dependencies
```bash
cd mom-website
npm install
```
This takes 2-5 minutes the first time.

### 3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Then open `.env.local` and ask **Vansh** (the project owner) for the actual values. The `.env.local.example` file has detailed comments explaining what each var is for and how to generate it.

**Minimum required to run `npm run dev` and see most pages:**
- `NEXT_PUBLIC_SITE_URL` — leave as `http://localhost:3000` for local dev
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` + `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` — for product pages
- `NEXT_PUBLIC_SANITY_PROJECT_ID` + `NEXT_PUBLIC_SANITY_DATASET` — for blog

The rest (Razorpay, Shiprocket, Resend, Shopify Admin) only matter when testing checkout/payment flows. You can leave them blank for design-focused work — the pages will render, only checkout will be non-functional.

### 4. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Edit any file in `src/` and the page hot-reloads.

---

## Project structure (where to find things)

```
mom-website/
├── src/
│   ├── app/                  ← Routes (file-based — folder = URL path)
│   │   ├── page.tsx          ← Homepage
│   │   ├── shop/             ← /shop
│   │   ├── product/[slug]/   ← Product detail pages
│   │   ├── blog/             ← Blog index + posts
│   │   ├── about/, contact/, etc.
│   │   ├── api/              ← Server-side API routes (payments, orders, etc.)
│   │   ├── layout.tsx        ← Root layout (header/footer)
│   │   └── globals.css       ← Tailwind base + custom CSS vars
│   ├── components/           ← React components (header, footer, product cards, etc.)
│   ├── lib/                  ← Shopify/Sanity/Razorpay clients + helpers
│   └── sanity/               ← Sanity schemas (blog post types)
├── public/                   ← Static assets (images, fonts, favicons)
├── scripts/                  ← One-off Node scripts (seed blog, etc.)
├── sanity.config.ts          ← Sanity Studio config (accessible at /studio)
├── next.config.ts            ← Next.js config
├── tailwind/postcss/eslint   ← Standard tooling configs
└── package.json
```

**Pages live in `src/app/`** as `page.tsx` files. The folder structure IS the URL structure.

**Reusable UI lives in `src/components/`**.

**Brand assets, fonts, photos live in `public/`**.

---

## Brand context

- **Brand:** Mirchi O' Mirchi (MOM) — Maharashtrian thecha (chilli condiment)
- **Tagline area:** spicy, bold, family-recipe-driven
- **Voice:** Warm, confident, slightly cheeky. Not corporate.
- **Vibe references:** Indian D2C food brands like Burma Burma, The Whole Truth, Slurrp Farm — clean modern e-commerce but grounded in tradition.
- **3 SKUs:** Red Chilli Thecha, Green Chilli Thecha, Mixed Chilli Thecha (also a Garlic variant)
- **Branding folder:** Vansh will share separately — logos, product photography, packaging mockups, brand guidelines.

---

## What's in scope (typically)

Ask Vansh for the actual brief, but commonly:
- Visual redesign of homepage, shop, product detail, about, contact
- Updated component library (buttons, cards, forms, navigation)
- Mobile responsiveness pass
- Maybe new sections / page additions
- Match the brand voice + packaging aesthetic

**Out of scope unless agreed:**
- Backend/API logic (`src/app/api/*`) — these handle real money. Don't touch.
- Shopify/Razorpay/Shiprocket integration code in `src/lib/`
- Sanity schemas

---

## How to send your work back

Since this was handed to you as a ZIP (not via GitHub), there are 3 ways to send your changes back:

### Option A — Re-zip and send (simplest)
After making changes:
```bash
# From the parent directory:
zip -r mom-website-redesign-YOURNAME.zip mom-website \
  -x "mom-website/node_modules/*" \
  -x "mom-website/.next/*" \
  -x "mom-website/.vercel/*" \
  -x "mom-website/.env.local"
```
Send that ZIP back to Vansh.

### Option B — GitHub repo (cleaner, recommended if you have a GitHub account)
1. Create a new private repo on your GitHub (e.g. `yourname/mom-redesign`)
2. From the `mom-website/` folder:
   ```bash
   git init   # only if there's no .git folder already
   git add .
   git commit -m "Initial redesign work"
   git remote add origin https://github.com/YOURUSERNAME/mom-redesign.git
   git push -u origin main
   ```
3. Invite `vanshmehta0108` as a collaborator.

### Option C — Pair via Loom + Figma first
If you prefer to design in Figma and then implement, do that. Send Figma links + Loom walkthroughs to Vansh before coding.

---

## Tips & gotchas

- **Don't run `npm run build`** while doing design work — it's slow. `npm run dev` is what you want.
- **`.env.local` is gitignored and NEVER goes into the zip.** It contains real API tokens. If Vansh sends you tokens, treat them like passwords.
- **The Sanity Studio is at `http://localhost:3000/studio`** when dev server is running. You'll need Sanity project access from Vansh to log in.
- **Product images and prices come from Shopify** at runtime — they'll only show up if Shopify env vars are set. For design work without Shopify access, mock the data in `src/lib/shopify.ts` or use placeholder images.
- **There's a lot of legacy code in `_archived-*/` folders** — ignore those. They're old experiments kept for reference.
- **Check `SHOPIFY_CONTENT_GUIDE.md`** for context on how Shopify content flows into the site.

---

## Who to ask

**Vansh Mehta** (founder) — vanshmehta0108@gmail.com
- Brand decisions
- API tokens & access
- Design feedback / approvals
- Anything blocking you

Ship fast, ship beautiful. 🌶️
