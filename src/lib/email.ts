// Resend transactional email — used by the Razorpay webhook to send order
// confirmations. If RESEND_API_KEY is missing, every helper is a no-op that
// resolves to `null`. The site never crashes when email is unconfigured.

import { Resend } from "resend";
import { PRODUCTS } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "orders@mirchiomirchi.com";
const ADMIN = process.env.RESEND_ADMIN_EMAIL || "contact@mirchiomirchi.com";

export const emailConfigured = Boolean(KEY);

const resend = KEY ? new Resend(KEY) : null;

type OrderEmailInput = {
  paymentId: string;
  orderId: string;
  amountInPaise: number;
  notes?: Record<string, string>;
};

function parseItems(itemsStr?: string) {
  if (!itemsStr) return [];
  return itemsStr
    .split(";")
    .map((entry) => {
      const [slug, qtyStr] = entry.split(":");
      const qty = Number(qtyStr);
      if (!slug || !Number.isFinite(qty) || qty <= 0) return null;
      const p = PRODUCTS.find((p) => p.slug === slug);
      return p ? { name: p.name, qty, price: p.price } : null;
    })
    .filter((x): x is { name: string; qty: number; price: number } => x !== null);
}

function rupees(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCustomerHtml(input: OrderEmailInput) {
  const { paymentId, orderId, amountInPaise, notes = {} } = input;
  const items = parseItems(notes.items);
  const name = notes.name || "there";
  const address = [
    notes.address,
    notes.city,
    notes.state,
    notes.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const itemsHtml = items.length
    ? items
        .map(
          (i) =>
            `<tr><td style="padding:6px 0;color:#444">${escapeHtml(i.name)} × ${i.qty}</td><td style="padding:6px 0;text-align:right;color:#000">₹${i.price * i.qty}</td></tr>`
        )
        .join("")
    : "";

  // Subtotal/discount/shipping breakdown — same numbers shown at checkout,
  // read from the order's own notes so this can never disagree with what the
  // customer actually saw before paying.
  const subtotalNum = Number(notes.subtotal);
  const discountNum = Number(notes.discount);
  const shippingNum = Number(notes.shipping);
  const hasBreakdown = Number.isFinite(subtotalNum) && subtotalNum > 0;
  const breakdownHtml = hasBreakdown
    ? `<tr><td style="padding:4px 0;color:#666">Subtotal</td><td style="padding:4px 0;text-align:right;color:#444">₹${subtotalNum}</td></tr>` +
      (discountNum > 0
        ? `<tr><td style="padding:4px 0;color:#B81862">${escapeHtml(notes.discount_label || "Discount")}</td><td style="padding:4px 0;text-align:right;color:#B81862">−₹${discountNum}</td></tr>`
        : "") +
      `<tr><td style="padding:4px 0 10px;color:#666">Shipping</td><td style="padding:4px 0 10px;text-align:right;color:#444">${shippingNum > 0 ? `₹${shippingNum}` : "Free"}</td></tr>`
    : "";

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#222;background:#fafafa">
    <h1 style="font-size:28px;letter-spacing:-0.01em;margin:0 0 8px;color:#000">Mirchi O Mirchi</h1>
    <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B81862;margin:0 0 24px">Order confirmed</p>
    <p style="font-size:16px;line-height:1.6;color:#222;margin:0 0 16px">Hey ${escapeHtml(name)}, we got it — packing your mirchi now.</p>
    <p style="font-size:14px;color:#666;margin:0 0 24px">Order ID: <strong>${escapeHtml(orderId)}</strong><br/>Payment ID: <strong>${escapeHtml(paymentId)}</strong></p>
    ${itemsHtml ? `<table style="width:100%;border-top:1px solid #eee;border-bottom:1px solid #eee;border-collapse:collapse;margin:16px 0;font-size:14px">${itemsHtml}</table>` : ""}
    ${hasBreakdown ? `<table style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:13px">${breakdownHtml}</table>` : ""}
    <table style="width:100%;border-top:1px solid #eee;border-collapse:collapse;margin:0 0 16px">
      <tr><td style="padding:10px 0;font-weight:600;color:#000">Total</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#000">${rupees(amountInPaise)}</td></tr>
    </table>
    ${address ? `<p style="font-size:14px;color:#444;margin:0 0 8px"><strong style="color:#000">Shipping to:</strong></p><p style="font-size:14px;color:#444;margin:0 0 24px;line-height:1.6">${escapeHtml(address)}</p>` : ""}
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 16px">You'll get another email with the tracking number once your jars hit the courier — 3–7 working days pan-India.</p>
    <p style="margin:0 0 24px">
      <a href="${SITE_URL}/orders/track" style="display:inline-block;background:#9B1E15;color:#fff;text-decoration:none;padding:12px 22px;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600">Track this order →</a>
    </p>
    <p style="font-size:13px;color:#888;line-height:1.6;margin:32px 0 0;border-top:1px solid #eee;padding-top:16px">Questions? Reply to this email or write to ${ADMIN}.</p>
  </div>`;
}

function renderAdminHtml(input: OrderEmailInput) {
  const { paymentId, orderId, amountInPaise, notes = {} } = input;
  const items = parseItems(notes.items);
  const address = [
    notes.name && `${notes.name}`,
    notes.phone && `📞 ${notes.phone}`,
    notes.email && `📧 ${notes.email}`,
    notes.address,
    [notes.city, notes.state, notes.pincode].filter(Boolean).join(", "),
  ].filter(Boolean);

  const itemsHtml = items
    .map(
      (i) =>
        `<li>${escapeHtml(i.name)} × ${i.qty} — ₹${i.price * i.qty}</li>`
    )
    .join("");

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
    <h2 style="margin:0 0 8px">🌶️ New MOM order — ${rupees(amountInPaise)}</h2>
    <p style="color:#666;margin:0 0 16px">Razorpay payment ${escapeHtml(paymentId)} · Order ${escapeHtml(orderId)}</p>
    <h3 style="margin:16px 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#888">Customer</h3>
    <p style="margin:0;line-height:1.6;color:#222;font-size:14px">${address.map(escapeHtml).join("<br/>")}</p>
    <h3 style="margin:20px 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#888">Items</h3>
    <ul style="margin:0;padding-left:18px;line-height:1.8;color:#222;font-size:14px">${itemsHtml || "<li>(no items metadata)</li>"}</ul>
    <p style="margin:24px 0 0;font-size:12px;color:#888">Full details + receipt in the Razorpay dashboard.</p>
  </div>`;
}

// Critical alert to the founder/admin. Used when something fails that needs
// human eyes within the hour — e.g. a Razorpay payment landed but the Shopify
// order push errored, so the customer has paid with no fulfillment ahead.
// Falls back to console.error when Resend isn't configured.
export async function sendCriticalAlert(input: {
  subject: string;
  bodyText: string;
  paymentId?: string;
  notes?: Record<string, string>;
}): Promise<void> {
  console.error(`[CRITICAL ALERT] ${input.subject}\n${input.bodyText}`);
  if (!resend) return;
  const safeNotes = input.notes
    ? Object.entries(input.notes)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#888;font-family:monospace;font-size:12px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0;color:#222;font-family:monospace;font-size:12px;word-break:break-word">${escapeHtml(String(v))}</td></tr>`
        )
        .join("")
    : "";
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#222">
    <div style="background:#E53935;color:white;padding:14px 18px;border-radius:8px;margin-bottom:18px">
      <strong style="font-size:14px;letter-spacing:0.05em;text-transform:uppercase">🚨 Critical alert · action required</strong>
    </div>
    <h2 style="margin:0 0 12px;font-size:20px">${escapeHtml(input.subject)}</h2>
    <p style="margin:0 0 16px;line-height:1.6;color:#444;white-space:pre-wrap">${escapeHtml(input.bodyText)}</p>
    ${input.paymentId ? `<p style="margin:0 0 12px;font-size:13px;color:#666">Razorpay payment ID: <strong style="color:#000;font-family:monospace">${escapeHtml(input.paymentId)}</strong></p>` : ""}
    ${safeNotes ? `<h3 style="margin:18px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#888">Raw payload</h3><table style="width:100%;border-collapse:collapse">${safeNotes}</table>` : ""}
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#888">If this fires repeatedly, check the Vercel function logs and the Shopify Admin / Razorpay dashboards directly.</p>
  </div>`;
  try {
    await resend.emails.send({
      from: `Mirchi O Mirchi Alerts <${FROM}>`,
      to: ADMIN,
      subject: `[URGENT] ${input.subject}`,
      html,
    });
  } catch (err) {
    console.error("[email] critical alert send failed", err);
  }
}

export async function sendOrderEmails(input: OrderEmailInput): Promise<void> {
  if (!resend) return;
  const customerEmail = input.notes?.email;
  const subject = `Order confirmed · Mirchi O Mirchi · ${rupees(input.amountInPaise)}`;
  const adminSubject = `New MOM order · ${rupees(input.amountInPaise)} · ${input.notes?.name ?? input.paymentId}`;

  const tasks: Promise<unknown>[] = [];

  if (customerEmail) {
    tasks.push(
      resend.emails
        .send({
          from: `Mirchi O Mirchi <${FROM}>`,
          to: customerEmail,
          subject,
          html: renderCustomerHtml(input),
        })
        .catch((err) => {
          console.error("[email] customer send failed", err);
        })
    );
  }

  tasks.push(
    resend.emails
      .send({
        from: `Mirchi O Mirchi <${FROM}>`,
        to: ADMIN,
        subject: adminSubject,
        html: renderAdminHtml(input),
      })
      .catch((err) => {
        console.error("[email] admin send failed", err);
      })
  );

  await Promise.all(tasks);
}
