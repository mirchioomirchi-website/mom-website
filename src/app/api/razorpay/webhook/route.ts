import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderEmails, sendCriticalAlert, emailConfigured } from "@/lib/email";
import { pushRazorpayOrderToShopify } from "@/lib/order-bridge";
import { shopifyAdminConfigured } from "@/lib/shopify-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Razorpay webhook payload shape (subset we use).
type PaymentEntity = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
};

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: PaymentEntity };
    order?: { entity?: { id: string; notes?: Record<string, string> } };
  };
};

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") || "";
  const raw = await req.text();

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: WebhookPayload = {};
  try {
    event = JSON.parse(raw) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = event.event ?? "";

  switch (eventName) {
    case "payment.captured":
    case "order.paid": {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        console.warn("[razorpay webhook] no payment entity on", eventName);
        break;
      }
      console.log(
        `[razorpay webhook] ${eventName} · ${payment.id} · ₹${(payment.amount / 100).toFixed(0)}`
      );

      // PUSH ORDER INTO SHOPIFY (idempotent — safe even if /verify already
      // pushed it). We ack the webhook regardless of whether this succeeds,
      // because Razorpay would otherwise retry forever and we'd double-send.
      if (shopifyAdminConfigured) {
        let pushFailed = false;
        let pushReason = "";
        try {
          const result = await pushRazorpayOrderToShopify({
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id,
            amountInPaise: payment.amount,
            notes: payment.notes,
          });
          if (result.ok) {
            console.log(
              `[razorpay webhook] Shopify order ${result.orderName}${result.alreadyExists ? " (already existed)" : " created"}`
            );
          } else {
            pushFailed = true;
            pushReason = result.reason;
            console.error(
              `[razorpay webhook] Shopify order create FAILED for ${payment.id}: ${result.reason}`
            );
          }
        } catch (err) {
          pushFailed = true;
          pushReason = err instanceof Error ? err.message : String(err);
          console.error("[razorpay webhook] pushRazorpayOrderToShopify threw", err);
        }
        // The customer paid; if Shopify didn't accept the order, the founder
        // must manually create it. Alert IMMEDIATELY — Razorpay won't retry
        // because we still 200 below (otherwise it'd retry forever and email
        // would double-send).
        if (pushFailed) {
          await sendCriticalAlert({
            subject: `Order push to Shopify FAILED for ₹${(payment.amount / 100).toFixed(0)}`,
            bodyText: `A Razorpay payment was captured but the Shopify order push errored. The customer has paid but no Shopify order exists. Manually create the order in Shopify Admin using the raw payload below, OR investigate the reason and re-trigger the webhook from Razorpay Dashboard.\n\nReason: ${pushReason}`,
            paymentId: payment.id,
            notes: payment.notes,
          });
        }
      }

      if (emailConfigured) {
        try {
          await sendOrderEmails({
            paymentId: payment.id,
            orderId: payment.order_id,
            amountInPaise: payment.amount,
            notes: payment.notes,
          });
        } catch (err) {
          console.error("[razorpay webhook] sendOrderEmails failed", err);
        }
      }
      break;
    }
    case "payment.failed":
      console.log(
        "[razorpay webhook] payment.failed",
        event.payload?.payment?.entity?.id
      );
      break;
    case "refund.processed":
    case "refund.created":
      console.log("[razorpay webhook] refund.processed");
      break;
    default:
      console.log("[razorpay webhook] unhandled", eventName);
  }

  return NextResponse.json({ ok: true });
}
