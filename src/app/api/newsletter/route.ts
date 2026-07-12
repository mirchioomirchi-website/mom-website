import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { email?: string; source?: string; website?: string };

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "orders@mirchiomirchi.com";
const ADMIN = process.env.RESEND_ADMIN_EMAIL || "contact@mirchiomirchi.com";
// When set, every signup is added to this Resend audience so the founder can
// later broadcast launch/announcement emails. Generate at
// https://resend.com/audiences → create audience → copy the ID.
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > MAX_REQUESTS;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Slow down — try again later." }, { status: 429 });
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email || "").trim().toLowerCase().slice(0, 150);
  const source = (body.source || "footer").trim().slice(0, 50);

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!KEY) {
    console.log("[newsletter] no RESEND_API_KEY — signup logged only:", { ip, email, source });
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(KEY);

    // Add to the broadcast audience (idempotent — Resend treats this as
    // upsert by email). Skipped silently when no AUDIENCE_ID is set.
    if (AUDIENCE_ID) {
      try {
        await resend.contacts.create({
          email,
          audienceId: AUDIENCE_ID,
          unsubscribed: false,
        });
      } catch (err) {
        // Don't fail the whole signup if just the audience add errors —
        // the admin email still goes through, so the signup isn't lost.
        console.warn("[newsletter] audience add failed", err);
      }
    }

    await resend.emails.send({
      from: `MOM Newsletter <${FROM}>`,
      to: ADMIN,
      subject: `[Newsletter signup] ${email}`,
      html: `<p>New newsletter signup</p>
        <p><strong>${escapeHtml(email)}</strong></p>
        <p style="color:#666;font-size:12px">Source: ${escapeHtml(source)} · IP ${escapeHtml(ip)}${AUDIENCE_ID ? " · added to audience" : " · ⚠️ no AUDIENCE_ID — set RESEND_AUDIENCE_ID to broadcast"}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] send failed", err);
    return NextResponse.json(
      { error: "Couldn't subscribe right now — try again in a moment." },
      { status: 502 }
    );
  }
}
