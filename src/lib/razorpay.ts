// Razorpay server helpers — used by /api/razorpay/* routes.
//
// Required env vars (server-side only — never expose KEY_SECRET to the client):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   RAZORPAY_WEBHOOK_SECRET
//   NEXT_PUBLIC_RAZORPAY_KEY_ID   (same as KEY_ID, but safe to expose for the
//                                  checkout widget on the client)

import crypto from "crypto";

export const razorpayServerConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

type CreateOrderInput = {
  amountInPaise: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
};

const BASE_URL = "https://api.razorpay.com/v1";

function authHeader() {
  const id = process.env.RAZORPAY_KEY_ID!;
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export async function createOrder(input: CreateOrderInput): Promise<RazorpayOrder> {
  if (!razorpayServerConfigured) {
    throw new Error("Razorpay credentials are not configured");
  }
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountInPaise,
      currency: input.currency || "INR",
      receipt: input.receipt,
      notes: input.notes,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order create failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RazorpayOrder;
}

// Verify the signature returned by Razorpay Checkout after a successful
// payment. The client sends back razorpay_order_id + razorpay_payment_id +
// razorpay_signature. We re-compute the HMAC and compare.
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(params.signature, "hex")
    );
  } catch {
    return false;
  }
}

// Verify a webhook payload using RAZORPAY_WEBHOOK_SECRET (configured in the
// Razorpay dashboard under Account & Settings → Webhooks).
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

// ── Server-side payment + refund lookups ──────────────────────────────────

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number; // in paise
  currency: string;
  status: string;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
};

export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayPayment | null> {
  if (!razorpayServerConfigured) return null;
  const safe = paymentId.replace(/[^A-Za-z0-9_]/g, "").slice(0, 64);
  if (!safe) return null;
  try {
    const res = await fetch(`${BASE_URL}/payments/${safe}`, {
      headers: { Authorization: authHeader() },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[razorpay] payment fetch failed", res.status);
      return null;
    }
    return (await res.json()) as RazorpayPayment;
  } catch (err) {
    console.error("[razorpay] payment fetch threw", err);
    return null;
  }
}

export type RazorpayRefundResult =
  | { ok: true; refundId: string; amountInPaise: number }
  | { ok: false; reason: string };

// Refund (full or partial). Idempotency is provided by Razorpay when we send
// an idempotency-key header. Refunding more than the payment amount errors
// at Razorpay — we let that bubble up.
export async function refundPayment(params: {
  paymentId: string;
  amountInPaise?: number; // omit for full refund
  idempotencyKey: string;
  notes?: Record<string, string>;
}): Promise<RazorpayRefundResult> {
  if (!razorpayServerConfigured) {
    return { ok: false, reason: "Razorpay not configured" };
  }
  const safe = params.paymentId.replace(/[^A-Za-z0-9_]/g, "").slice(0, 64);
  if (!safe) return { ok: false, reason: "Invalid payment id" };

  const body: Record<string, unknown> = { speed: "normal" };
  if (params.amountInPaise && params.amountInPaise > 0) {
    body.amount = params.amountInPaise;
  }
  if (params.notes) body.notes = params.notes;

  try {
    const res = await fetch(`${BASE_URL}/payments/${safe}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        "X-Idempotency-Key": params.idempotencyKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        reason: `Razorpay refund ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    const json = (await res.json()) as { id: string; amount: number };
    return { ok: true, refundId: json.id, amountInPaise: json.amount };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

// Verify a Shopify webhook payload using SHOPIFY_WEBHOOK_SECRET.
// Used by /api/shopify/webhook to authenticate refund notifications.
export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string
): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(hmacHeader, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
