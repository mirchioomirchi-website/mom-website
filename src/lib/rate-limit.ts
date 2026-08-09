// Shared in-memory, per-serverless-instance rate limiter — the same
// Map-based sliding-window pattern that was already duplicated inline across
// /api/contact, /api/cod-order, /api/newsletter, /api/phone-signup,
// /api/order/lookup, and /api/pincode. Extracted here so new routes (and,
// eventually, those existing ones) don't each hand-roll their own copy.
//
// Not distributed — resets on cold start and isn't shared across serverless
// instances — but it's a meaningful deterrent against casual abuse at this
// site's traffic scale. A Redis-backed limiter would be the upgrade if that
// ever stops being true.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(
  key: string,
  opts: { windowMs: number; max: number }
): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return false;
  }
  b.count += 1;
  return b.count > opts.max;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
