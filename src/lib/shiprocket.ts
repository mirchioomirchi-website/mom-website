// Shiprocket API — pincode serviceability + courier suggestion.
//
// Required env vars (NEVER expose to the client):
//   SHIPROCKET_EMAIL      Shiprocket account email
//   SHIPROCKET_PASSWORD   Shiprocket account password
//   SHIPROCKET_PICKUP_PINCODE  Your warehouse/pickup pincode (e.g. 411001 — Pune)
//
// Auth flow: POST /v1/external/auth/login → { token }. Token is valid for 10
// days. We cache it in-memory until expiry to avoid re-auth on every request.

const EMAIL = process.env.SHIPROCKET_EMAIL || "";
const PASSWORD = process.env.SHIPROCKET_PASSWORD || "";
const PICKUP_PINCODE = process.env.SHIPROCKET_PICKUP_PINCODE || "411001";

export const shiprocketConfigured = Boolean(EMAIL && PASSWORD);

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

type AuthCache = { token: string; expiresAt: number };
let authCache: AuthCache | null = null;

async function getAuthToken(): Promise<string | null> {
  if (!shiprocketConfigured) return null;
  const now = Date.now();
  if (authCache && authCache.expiresAt > now + 60_000) return authCache.token;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[shiprocket] auth failed", res.status);
      return null;
    }
    const data = (await res.json()) as { token?: string };
    if (!data.token) return null;
    // Tokens are valid 10 days; cache for 9.
    authCache = { token: data.token, expiresAt: now + 9 * 24 * 60 * 60 * 1000 };
    return data.token;
  } catch (err) {
    console.error("[shiprocket] auth threw", err);
    return null;
  }
}

// ── Pincode serviceability ───────────────────────────────────────────────

export type PincodeServiceability =
  | { available: true; couriers: number; codAvailable: boolean }
  | { available: false; reason: string };

// Simple per-pincode in-memory cache. Pincode serviceability rarely changes,
// so a 1-hour TTL is fine and saves Shiprocket API calls.
type CacheEntry = { value: PincodeServiceability; expiresAt: number };
const pincodeCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;

// We currently only deliver within Mumbai (matches the FAQ + shipping
// policy). Checked before ever calling Shiprocket — Shiprocket's
// serviceability check is a general pan-India courier lookup and has no
// concept of this business constraint, so a Delhi pincode would otherwise
// come back "available" despite being outside what we actually fulfil
// right now. Mumbai city + suburbs pincodes all start with "400"; widen
// this (or make it a list of allowed prefixes) once delivery expands.
const MUMBAI_PINCODE_PREFIX = "400";
export const OUTSIDE_MUMBAI_MESSAGE =
  "We currently deliver within Mumbai only (pincodes starting with 400). We're working on expanding — check back soon!";

// Synchronous, no-network-call version of the same check — used as a final
// server-side gate right before an order is actually created (in addition
// to the async checkPincode() below, which the checkout UI calls live as
// the customer types). Client-side validation can be raced or bypassed
// entirely by a direct API call, so both order-creation routes re-check
// this themselves rather than trusting the client got this far honestly.
export function isMumbaiPincode(pincode: string): boolean {
  const safe = pincode.replace(/[^0-9]/g, "");
  return /^\d{6}$/.test(safe) && safe.startsWith(MUMBAI_PINCODE_PREFIX);
}

export async function checkPincode(
  pincode: string,
  weightKg = 0.3
): Promise<PincodeServiceability> {
  const safe = pincode.replace(/[^0-9]/g, "");
  if (!/^\d{6}$/.test(safe)) {
    return { available: false, reason: "Enter a valid 6-digit pincode." };
  }

  if (!safe.startsWith(MUMBAI_PINCODE_PREFIX)) {
    return { available: false, reason: OUTSIDE_MUMBAI_MESSAGE };
  }

  // If Shiprocket isn't configured, default to "available" so checkout isn't
  // blocked pre-launch. This is the safe fallback — if a pincode happens to
  // be unserviceable, we'll catch it at fulfilment time and refund.
  if (!shiprocketConfigured) {
    return { available: true, couriers: 0, codAvailable: true };
  }

  const cached = pincodeCache.get(safe);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const token = await getAuthToken();
  if (!token) {
    // Auth failed — graceful fallback so we don't block customers.
    return { available: true, couriers: 0, codAvailable: true };
  }

  try {
    const url = new URL(
      `${BASE_URL}/courier/serviceability/`
    );
    url.searchParams.set("pickup_postcode", PICKUP_PINCODE);
    url.searchParams.set("delivery_postcode", safe);
    url.searchParams.set("weight", String(weightKg));
    url.searchParams.set("cod", "1");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Don't block checkout on Shiprocket downtime.
      console.warn("[shiprocket] serviceability HTTP", res.status);
      return { available: true, couriers: 0, codAvailable: true };
    }
    const data = (await res.json()) as {
      status?: number;
      data?: {
        available_courier_companies?: Array<{ cod?: number }>;
      };
    };
    const couriers = data.data?.available_courier_companies || [];
    if (couriers.length === 0) {
      const value: PincodeServiceability = {
        available: false,
        reason: "We can't ship to this pincode yet. Try another, or email us.",
      };
      pincodeCache.set(safe, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    }
    const codAvailable = couriers.some((c) => c.cod === 1);
    const value: PincodeServiceability = {
      available: true,
      couriers: couriers.length,
      codAvailable,
    };
    pincodeCache.set(safe, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  } catch (err) {
    console.warn("[shiprocket] serviceability threw", err);
    return { available: true, couriers: 0, codAvailable: true };
  }
}
