import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { upsertPhoneSignupCustomer } from "@/lib/shopify-admin";

// Captures a phone number from the "get new-batch updates + 5% off" signup
// (CtaBanner + the promo popup both post here). The durable record is a
// Shopify Customer (tagged "phone-signup" + the surface it came from) via
// upsertPhoneSignupCustomer() — queryable from Shopify Admin, and idempotent
// per phone number. We also keep the admin-email notification as a
// belt-and-suspenders alert; if the Shopify write fails for some reason, the
// email still lands so nothing is silently lost.

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

  // Durable record: upsert a Shopify Customer for this phone number. Best
  // effort — a Shopify Admin hiccup shouldn't block the customer from
  // getting their discount code, so we log and continue to the email
  // notification rather than failing the whole request.
  const shopifyResult = await upsertPhoneSignupCustomer({ phone, source });
  if (!shopifyResult.ok) {
    console.error("[phone-signup] Shopify customer upsert failed", shopifyResult.reason);
  }

  if (!KEY) {
    // Lower risk than /api/contact or /api/newsletter since the Shopify
    // customer record above is the durable copy — but still worth a loud
    // log rather than a quiet one if the admin notification email is
    // silently going nowhere.
    console.error(
      "[phone-signup] ⚠️ RESEND_API_KEY is not set — notification email NOT SENT (Shopify record still saved):",
      { ip, phone, source, shopifyCustomerSaved: shopifyResult.ok }
    );
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
        <p style="color:#666;font-size:12px">Source: ${escapeHtml(source)} · IP ${escapeHtml(ip)} · Saved to Shopify: ${shopifyResult.ok ? "yes" : "NO — check logs"}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[phone-signup] send failed", err);
    // The Shopify customer record (if it succeeded above) still exists even
    // though the notification email failed, so this isn't a total loss —
    // but we still surface an error so the client can retry and the founder
    // isn't relying solely on Shopify Admin to notice new signups.
    return NextResponse.json(
      { error: "Couldn't submit right now — try again in a moment." },
      { status: 502 }
    );
  }
}
