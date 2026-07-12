import { NextResponse } from "next/server";
import { checkPincode } from "@/lib/shiprocket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-IP rate limit (in-memory) to stop someone hammering the Shiprocket
// API through us.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;
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

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const pincode = (searchParams.get("pincode") || "").replace(/[^0-9]/g, "");
  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Enter a valid 6-digit pincode." },
      { status: 400 }
    );
  }

  const result = await checkPincode(pincode);
  return NextResponse.json(result);
}
