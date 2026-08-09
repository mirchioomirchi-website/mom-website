// Short-lived, best-effort lock to close the race window for single-use
// coupon codes (e.g. SIGNUP5) between "checked hasUsedCoupon() and it came
// back clean" and "the Shopify order that would make hasUsedCoupon() return
// true next time actually got written."
//
// That window matters most on the Razorpay path: hasUsedCoupon() is checked
// in /api/razorpay/order BEFORE payment, but the Shopify order (what the
// check actually queries) is only created in order-bridge.ts AFTER payment
// completes — anywhere from seconds to minutes later. Without this lock, two
// concurrent checkouts with the same code both pass the check and both get
// the discount.
//
// Same caveat as src/lib/rate-limit.ts: this is an in-memory Map, not
// distributed. It closes the common case (repeat clicks, two tabs on the
// same warm serverless instance) but not a race split across two different
// cold-started instances. The authoritative backstop for that edge case is
// the flagged-coupon-reuse tag check in order-bridge.ts, which re-verifies
// against Shopify itself (the permanent record) right before the order is
// written and flags — rather than blocks — a reused code post-payment, since
// the customer has already paid by that point.
const reservations = new Map<string, number>(); // key -> expiresAt (ms)

/**
 * Attempt to claim `key` for `ttlMs`. Returns true if the caller now holds
 * it (nobody else does, or the previous hold expired), false if someone else
 * currently holds it.
 */
export function tryReserveCoupon(key: string, ttlMs: number): boolean {
  const now = Date.now();
  const expiresAt = reservations.get(key);
  if (expiresAt && expiresAt > now) return false;
  reservations.set(key, now + ttlMs);
  return true;
}

/** Release a reservation early (e.g. the downstream request failed for an
 * unrelated reason and shouldn't lock out a legitimate retry). */
export function releaseCouponReservation(key: string): void {
  reservations.delete(key);
}

/** Build the lock key consistently across the Razorpay and COD routes so a
 * concurrent attempt on either channel with the same code+customer collides. */
export function couponLockKeyFor(
  code: string,
  email?: string,
  phone?: string
): string {
  const safeCode = code.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
  const safeEmail = (email || "").trim().toLowerCase();
  const safePhone = (phone || "").replace(/\D/g, "").slice(-10);
  return `coupon:${safeCode}:${safeEmail}:${safePhone}`;
}
