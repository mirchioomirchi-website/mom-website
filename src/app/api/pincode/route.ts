import { NextResponse } from "next/server";
import { checkPincode } from "@/lib/shiprocket";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-IP rate limit (in-memory) to stop someone hammering the Shiprocket
// API through us.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

export async function GET(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`pincode:${ip}`, { windowMs: WINDOW_MS, max: MAX_REQUESTS })) {
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
