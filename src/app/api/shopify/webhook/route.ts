import { NextResponse } from "next/server";
import { verifyShopifyWebhook, refundPayment } from "@/lib/razorpay";
import { getRazorpayPaymentIdForOrder } from "@/lib/shopify-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Shopify webhooks we handle:
//   refunds/create        → trigger Razorpay refund
//
// Setup in Shopify Admin → Settings → Notifications → Webhooks:
//   1. Add webhook → Event: "Refund create"
//   2. Format: JSON
//   3. URL: https://mirchiomirchi.com/api/shopify/webhook
//   4. Copy the signing secret → set as SHOPIFY_WEBHOOK_SECRET in Vercel env

type RefundCreatePayload = {
  id: number;
  order_id: number;
  // 2-decimal string in shop currency, e.g. "299.00"
  transactions?: Array<{
    amount: string;
    gateway: string;
    kind: string;
    status: string;
  }>;
  // Total refund amount (sum of transactions of kind refund)
  refund_line_items?: Array<{ subtotal: number; total_tax: number }>;
  note?: string;
};

// Idempotency cache for refund processing. Razorpay's own idempotency-key
// header is the real guard (so retries are safe), but we also short-circuit
// on the order ID at this layer to save round-trips.
const recentRefunds = new Map<string, number>();
const REFUND_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;
function alreadyRefunded(refundId: string): boolean {
  const now = Date.now();
  // Cleanup old entries.
  for (const [k, t] of recentRefunds.entries()) {
    if (now - t > REFUND_DEDUP_WINDOW_MS) recentRefunds.delete(k);
  }
  const existing = recentRefunds.get(refundId);
  if (existing && now - existing < REFUND_DEDUP_WINDOW_MS) return true;
  recentRefunds.set(refundId, now);
  return false;
}

export async function POST(req: Request) {
  const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const topic = req.headers.get("x-shopify-topic") || "";
  const raw = await req.text();

  if (!verifyShopifyWebhook(raw, hmac)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: RefundCreatePayload = { id: 0, order_id: 0 };
  try {
    event = JSON.parse(raw) as RefundCreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  switch (topic) {
    case "refunds/create": {
      const refundId = String(event.id);
      const orderLegacyId = String(event.order_id);
      if (!refundId || !orderLegacyId) {
        return NextResponse.json({ ok: true });
      }
      if (alreadyRefunded(refundId)) {
        console.log(
          `[shopify webhook] refund ${refundId} already processed — skipping`
        );
        return NextResponse.json({ ok: true });
      }

      // Sum up the refund transaction amounts (in rupees).
      const refundTotalRupees = (event.transactions || [])
        .filter((t) => t.kind === "refund" && t.status === "success")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      if (refundTotalRupees <= 0) {
        console.log(
          `[shopify webhook] refund ${refundId} has no positive transaction — likely manual or 0`
        );
        return NextResponse.json({ ok: true });
      }

      const orderGid = `gid://shopify/Order/${orderLegacyId}`;
      const razorpayPaymentId = await getRazorpayPaymentIdForOrder(orderGid);
      if (!razorpayPaymentId) {
        console.warn(
          `[shopify webhook] no Razorpay payment ID on order ${orderLegacyId} — was this a COD order?`
        );
        return NextResponse.json({ ok: true });
      }

      const result = await refundPayment({
        paymentId: razorpayPaymentId,
        amountInPaise: Math.round(refundTotalRupees * 100),
        idempotencyKey: `shopify-refund-${refundId}`,
        notes: {
          shopify_refund_id: refundId,
          shopify_order_id: orderLegacyId,
        },
      });
      if (!result.ok) {
        // Don't 5xx — Shopify would retry. We log and let support handle.
        console.error(
          `[shopify webhook] Razorpay refund FAILED for ${razorpayPaymentId}: ${result.reason}`
        );
      } else {
        console.log(
          `[shopify webhook] Razorpay refund ${result.refundId} for ₹${(result.amountInPaise / 100).toFixed(0)}`
        );
      }
      break;
    }
    case "orders/create":
    case "orders/paid":
    case "orders/cancelled":
      // Useful for observability — no action.
      console.log(`[shopify webhook] ${topic}`);
      break;
    default:
      console.log("[shopify webhook] unhandled topic", topic);
  }

  return NextResponse.json({ ok: true });
}
