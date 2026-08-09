import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Dynamic robots.txt (replaces the old static public/robots.txt) — one
// source of truth with sitemap.ts and site.ts instead of a hand-maintained
// file that can drift out of sync with the real domain.
//
// Strategy: allow everything, including every known AI crawler, explicitly.
// The brand's goal is maximum discoverability — in classic search AND in
// AI answer engines (ChatGPT, Perplexity, Claude, Gemini, etc.) — so this
// deliberately does NOT block AI training crawlers (GPTBot, Google-Extended,
// CCBot, anthropic-ai, ...) the way a brand trying to keep its content out
// of model training data would. Blocking them would also block the
// retrieval/answer bots that actually cite the site in AI search results,
// since several providers (e.g. OpenAI's GPTBot) share infrastructure
// between the two purposes. Every AI bot is still listed by name rather
// than left to the generic "*" rule, so the intent is unambiguous to
// anyone (human or automated) reading this file, and so any individual bot
// can be selectively blocked later without touching the rest.
//
// Transactional/user-specific/admin surfaces stay disallowed for everyone,
// same as before.
const disallowedPaths = ["/api/", "/studio/", "/cart", "/checkout", "/orders/"];

// Training crawlers — build language-model training datasets.
const AI_TRAINING_BOTS = [
  "GPTBot", // OpenAI
  "Google-Extended", // Google Gemini / AI features
  "CCBot", // Common Crawl (feeds many labs' training sets)
  "anthropic-ai", // Anthropic
  "Bytespider", // ByteDance
  "Applebot-Extended", // Apple Intelligence
  "Meta-ExternalAgent", // Meta / Llama
  "Diffbot",
  "cohere-ai",
];

// Retrieval / "user asked, bot fetched this page right now" crawlers —
// these are what let the brand actually get cited in a ChatGPT, Perplexity,
// or Copilot answer.
const AI_RETRIEVAL_BOTS = [
  "OAI-SearchBot", // OpenAI (ChatGPT search)
  "ChatGPT-User", // OpenAI (live browsing during a chat)
  "ClaudeBot", // Anthropic (Claude web search)
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Amazonbot", // Amazon (Alexa+/Rufus)
  "Applebot", // Apple Search / Siri
];

export default function robots(): MetadataRoute.Robots {
  const allBots = [...AI_TRAINING_BOTS, ...AI_RETRIEVAL_BOTS];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: disallowedPaths },
      ...allBots.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: disallowedPaths,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
