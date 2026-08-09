import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

// Captures a phone number from the "get new-batch updates + 5% off" signup
// (CtaBanner + the promo popup both post here). There's no phone-based CRM
// wired into this codebase, so — same pattern as /api/newsletter — every
// submission is logged and emailed to the founder's inbox as the durable
// record. If a proper CRM/spreadsheet sync is wanted later, this is the one
// place that needs to change.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { phone?: string; source?: string; website?: string };

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "orders@mirchiomirchi.com";
const ADMIN = process.env.RESEND_ADMIN_EMAIL || "contact@mirchiomirchi.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (isRateLimited(`phone-signup:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 })) {
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

  const phone = (body.phone || "").replace(/[^0-9]/g, "").slice(-10);
  const source = (body.source || "banner").trim().slice(0, 50);

  // Same 10-digit Indian mobile pattern used at checkout.
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit mobile number." },
      { status: 400 }
    );
  }

  if (!KEY) {
    console.log("[phone-signup] no RESEND_API_KEY — signup logged only:", {
      ip,
      phone,
      source,
    });
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(KEY);
    await resend.emails.send({
      from: `MOM Signups <${FROM}>`,
      to: ADMIN,
      subject: `[Phone signup] ${phone}`,
      html: `<p>New phone number signup (new-batch updates + 5% off code)</p>
        <p><strong>${escapeHtml(phone)}</strong></p>
        <p style="color:#666;font-size:12px">Source: ${escapeHtml(source)} · IP ${escapeHtml(ip)}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[phone-signup] send failed", err);
    return NextResponse.json(
      { error: "Couldn't submit right now — try again in a moment." },
      { status: 502 }
    );
  }
}
