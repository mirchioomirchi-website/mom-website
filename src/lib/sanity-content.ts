// Pulls editable content from Sanity Studio, then merges over the local
// defaults in lib/content.ts.
//
// If Sanity isn't configured (env vars missing) or a document hasn't been
// created in Studio yet, the local content from lib/content.ts renders.
// Site never breaks — Sanity is purely additive.
//
// To wire up:
//   1. Vansh creates a free project at sanity.io
//   2. Drops projectId + dataset in .env.local (and Vercel)
//   3. Visits /studio, creates a Hero / Marquee / etc. document for each section
//   4. Site picks up edits within 60s

import { createClient } from "next-sanity";
import { SITE_CONTENT, type SiteContent } from "@/lib/content";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityConfigured = Boolean(projectId);

const client = sanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: "2024-12-01",
      useCdn: true,
      perspective: "published",
    })
  : null;

// Single GROQ query that pulls every singleton in one round-trip — keeps
// page load fast and means non-existent docs return null without errors.
const QUERY = /* groq */ `{
  "hero":             *[_type == "hero"][0],
  "meetMOM":          *[_type == "meetMOM"][0],
  "ingredients":      *[_type == "ingredients"][0],
  "quality":          *[_type == "quality"][0],
  "story":            *[_type == "story"][0],
  "shop":             *[_type == "shop"][0],
  "footer":           *[_type == "footer"][0],
  "characterSpeech":  *[_type == "characterSpeech"][0],
  "marquee":          *[_type == "marquee"][0],
}`;

type SanityResponse = Partial<Record<keyof SiteContent, Record<string, unknown> | null>>;

// Returns merged content — Sanity wins where it has data, local wins everywhere
// else. Cached for 60 seconds via Next's fetch cache (keeps studio edits fresh).
export async function getSanityContent(): Promise<SiteContent> {
  if (!client) return SITE_CONTENT;
  try {
    const data = (await client.fetch<SanityResponse>(QUERY, {}, {
      next: { revalidate: 60 },
    })) ?? {};
    return mergeOverDefaults(data);
  } catch {
    return SITE_CONTENT;
  }
}

function mergeOverDefaults(overrides: SanityResponse): SiteContent {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(SITE_CONTENT) as Array<keyof SiteContent>) {
    const localDefault = SITE_CONTENT[key];
    const override = overrides[key];
    if (!override) {
      out[key] = localDefault;
      continue;
    }
    // Strip Sanity system fields that would leak into the rendered content.
    const cleaned = stripSanityFields(override);
    if (typeof localDefault === "object" && localDefault !== null) {
      out[key] = { ...localDefault, ...cleaned };
    } else {
      out[key] = cleaned;
    }
  }
  return out as SiteContent;
}

function stripSanityFields(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("_")) continue; // skip _id, _type, _rev, _createdAt, _updatedAt
    result[k] = v;
  }
  return result;
}
