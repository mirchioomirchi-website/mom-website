// Sanity Studio config — mounted at /studio in the Next.js app.
//
// Fill these env vars in .env.local + Vercel:
//   NEXT_PUBLIC_SANITY_PROJECT_ID  (sanity.io/manage → Project → Project ID)
//   NEXT_PUBLIC_SANITY_DATASET     defaults to "production"
//
// Vansh: to log in and edit content, visit /studio on your live site.

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "mom-cms",
  title: "Mirchi O Mirchi — Content Studio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
