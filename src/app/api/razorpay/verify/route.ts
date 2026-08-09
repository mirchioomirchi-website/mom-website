import { NextResponse } from "next/server";
import { verifyPaymentSignature, razorpayServerConfigured, fetchRazorpayPayment } from "@/lib/razorpay";
import { pushRazorpayOrderToShopify } from "@/lib/order-bridge";
import { shopifyAdminConfigured } from "@/lib/shopify-admin";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(req: Request) {
  if (!razorpayServerConfigured) {
    return NextResponse.json(
      { error: "Razorpay is not configured on the server" },
      { status: 503 }
    );
  }

  const ip = getClientIp(req);
  if (isRateLimited(`razorpay-verify:${ip}`, { windowMs: 60 * 60 * 1000, max: 20 })) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in an hour." },
      { status: 429 }
    );
  }

  let body: VerifyBody = {};
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing razorpay_order_id / razorpay_payment_id / razorpay_signature" },
      { status: 400 }
    );
  }

  const ok = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Eager Shopify-order create (fallback path — the webhook will catch it if
  // this fails). Pull the payment from Razorpay so we get the authoritative
  // notes/amount as Razorpay recorded them, not the client's claim. We
  // tolerate failures here — verify still returns success.
  let shopifyOrderName: string | undefined;
  if (shopifyAdminConfigured) {
    try {
      const payment = await fetchRazorpayPayment(razorpay_payment_id);
      if (payment) {
        const result = await pushRazorpayOrderToShopify({
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          amountInPaise: payment.amount,
          notes: payment.notes,
        });
        if (result.ok) {
          shopifyOrderName = result.orderName;
        } else {
          console.warn(
            `[verify] Shopify order push failed for ${razorpay_payment_id}: ${result.reason}`
          );
        }
      }
    } catch (err) {
      console.warn("[verify] eager Shopify push threw", err);
    }
  }

  return NextResponse.json({
    ok: true,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    shopifyOrderName,
  });
}
