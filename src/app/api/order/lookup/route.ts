import { NextResponse } from "next/server";
import { lookupOrder, shopifyAdminConfigured } from "@/lib/shopify-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-IP rate limit. Order lookup is unauthenticated by design (customer
// types order # + email), so we throttle hard to prevent enumeration.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 20;
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

type LookupBody = {
  orderName?: string;
  email?: string;
};

export async function POST(req: Request) {
  if (!shopifyAdminConfigured) {
    return NextResponse.json(
      { error: "Order lookup isn't available right now. Please check your confirmation email." },
      { status: 503 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many lookups. Please try again in an hour." },
      { status: 429 }
    );
  }

  let body: LookupBody = {};
  try {
    body = (await req.json()) as LookupBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderName = (body.orderName || "").trim().slice(0, 64);
  const email = (body.email || "").trim().slice(0, 150);

  if (!orderName || !email) {
    return NextResponse.json(
      { error: "Both order number and email are required." },
      { status: 400 }
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email." },
      { status: 400 }
    );
  }

  // Normalise order name — accept "1024", "#1024", "MOM1024".
  const normalised = orderName.startsWith("#")
    ? orderName
    : /^\d/.test(orderName)
    ? `#${orderName}`
    : orderName;

  const order = await lookupOrder({ orderName: normalised, email });
  if (!order) {
    // Constant-time-ish response so an attacker can't probe.
    return NextResponse.json(
      { error: "No order found for that combination." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, order });
}
