import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  // Honeypot — bots fill this; humans don't see it.
  website?: string;
};

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "orders@mirchiomirchi.com";
const ADMIN = process.env.RESEND_ADMIN_EMAIL || "contact@mirchiomirchi.com";

// Tiny in-memory IP rate limit. Won't survive across serverless instances but
// catches the obvious single-instance spam. Real abuse protection lives at the
// edge / CDN; this is just an honest-effort cap.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 6;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (isRateLimited(`contact:${ip}`, { windowMs: WINDOW_MS, max: MAX_REQUESTS })) {
    return NextResponse.json(
      { error: "Too many messages. Try again in an hour." },
      { status: 429 }
    );
  }

  let body: ContactBody = {};
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot — pretend success, drop the message.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name || "").trim().slice(0, 100);
  const email = (body.email || "").trim().slice(0, 150);
  const subject = (body.subject || "").trim().slice(0, 150);
  const message = (body.message || "").trim().slice(0, 4000);

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message || message.length < 5) {
    return NextResponse.json(
      { error: "Name, valid email, and a message of at least 5 characters are required." },
      { status: 400 }
    );
  }

  if (!KEY) {
    // Email transport not configured — accept the message so the user isn't
    // bounced, but this is a live footgun: if RESEND_API_KEY is ever unset
    // in production, every contact submission silently vanishes while the
    // visitor sees success. console.error (not .log) so it's impossible to
    // miss in Vercel's function logs / any log-level alerting.
    console.error(
      "[contact] ⚠️ RESEND_API_KEY is not set — message ACCEPTED but NOT SENT:",
      { ip, name, email, subject }
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(KEY);
    await resend.emails.send({
      from: `MOM Contact <${FROM}>`,
      to: ADMIN,
      replyTo: email,
      subject: `[Contact form] ${subject || "New message"} — from ${name}`,
      html: `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
        <h2 style="margin:0 0 8px">New contact form message</h2>
        <p style="margin:0 0 16px;color:#666">From ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt; · IP ${escapeHtml(ip)}</p>
        ${subject ? `<p style="margin:0 0 8px"><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
        <p style="margin:16px 0 0;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</p>
      </div>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed", err);
    // Don't leak the upstream error to the client.
    return NextResponse.json(
      { error: "Couldn't send your message — please email contact@mirchiomirchi.com directly." },
      { status: 502 }
    );
  }
}
