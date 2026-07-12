// Sanity Studio — content editor — mounted at /studio.
//
// Vansh: visit /studio on your live site, log in with your Sanity account,
// and edit hero / sections / ingredients / characters / footer.
// Changes propagate to the live site within ~60 seconds.

"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export default function StudioPage() {
  if (!projectId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: 520, textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#F5197F",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Studio Setup Required
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16, lineHeight: 1.2 }}>
            One more step to enable in-browser content editing.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.6, fontSize: 14 }}>
            The site already runs perfectly — content currently comes from
            <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4, margin: "0 4px" }}>
              lib/content.ts
            </code>
            (a code file). To get a clickable admin here:
          </p>
          <ol
            style={{
              textAlign: "left",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.8,
              fontSize: 14,
              marginTop: 20,
              paddingLeft: 20,
            }}
          >
            <li>
              Create a free account at{" "}
              <a href="https://sanity.io/login" target="_blank" rel="noreferrer" style={{ color: "#F5197F" }}>
                sanity.io
              </a>
            </li>
            <li>Create a new project — copy the Project ID</li>
            <li>
              Send the Project ID to your developer (Claude). They&apos;ll add it to
              Vercel env vars and redeploy.
            </li>
            <li>Reload this page — it&apos;ll show the editor.</li>
          </ol>
          <p
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
            }}
          >
            Free tier covers up to 3 users + 100k API requests/month. Plenty for MOM.
          </p>
        </div>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
