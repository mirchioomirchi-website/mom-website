"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PdpCrossSell from "@/components/pdp/PdpCrossSell";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS, getProduct, PRODUCT_CARD_IMAGES, PDP_ACCENT_COLOR } from "@/lib/products";
import {
  computeCartTotal,
  computeShipping,
  CART_DISCOUNT_THRESHOLD,
  CART_DISCOUNT_PCT,
} from "@/lib/discounts";
import {
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackBeginCheckout,
  trackPurchase,
} from "@/lib/analytics-events";

type Shipping = {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type PaymentMethod = "razorpay" | "cod";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PERSIST_KEY = "mom-shipping-v1";

export default function CheckoutPageClient() {
  const router = useRouter();
  const { lines, subtotal, itemCount, clear } = useCart();

  const [shipping, setShipping] = useState<Shipping>({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Shipping, string>>>({});
  const [paying, setPaying] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<
    | { state: "idle" }
    | { state: "checking" }
    | { state: "available"; codAvailable: boolean }
    | { state: "unavailable"; reason: string }
  >({ state: "idle" });

  // Restore last-used shipping info
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (raw) setShipping((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  // Client-side preview only — computed with the exact same pure function the
  // server re-runs authoritatively in /api/razorpay/order and /api/cod-order,
  // so this can never drift from what's actually charged as long as both
  // sides agree on `lines` + `appliedCoupon` (which the server re-derives
  // itself rather than trusting).
  const cartTotal = useMemo(
    () => computeCartTotal(lines, appliedCoupon),
    [lines, appliedCoupon]
  );
  const { discount, discountType, discountLabel, couponValid } = cartTotal;
  const itemsTotal = cartTotal.total;
  const shippingInfo = useMemo(
    () => computeShipping({ itemsSubtotal: itemsTotal }),
    [itemsTotal]
  );
  const shippingFree = shippingInfo.isFree;
  const shippingCost = shippingInfo.price;
  const total = itemsTotal + shippingCost;
  const couponApplied = discountType === "coupon";
  const couponSuperseded =
    appliedCoupon !== "" && couponValid && !couponApplied && discountType === "auto";

  function handleApplyCoupon() {
    setAppliedCoupon(couponInput.trim());
  }

  // Quick-add — everything not already in the cart, same card layout as the
  // PDP's "You should also try" section.
  const quickAddProducts = useMemo(() => {
    const inCart = new Set(lines.map((l) => l.slug));
    return PRODUCTS.filter((p) => !inCart.has(p.slug));
  }, [lines]);

  const itemSummary = useMemo(
    () =>
      lines
        .map((l) => {
          const p = getProduct(l.slug);
          return p ? `${p.name} ×${l.qty}` : null;
        })
        .filter(Boolean)
        .join(", "),
    [lines]
  );

  // Pincode serviceability check (debounced).
  //
  // Dep array is intentionally JUST `shipping.pincode` — we do NOT depend on
  // `pincodeStatus.state` here, because re-running on every status transition
  // would re-fire the debounce and reset the visible status mid-fetch (UI
  // flicker). The idle reset for sub-6-digit input is done by reading the
  // current status via a setter callback below.
  const lastCheckedPincode = useRef<string>("");
  useEffect(() => {
    const pin = shipping.pincode.replace(/[^0-9]/g, "");
    if (!/^\d{6}$/.test(pin)) {
      setPincodeStatus((prev) =>
        prev.state === "idle" ? prev : { state: "idle" }
      );
      lastCheckedPincode.current = "";
      return;
    }
    if (lastCheckedPincode.current === pin) return;
    lastCheckedPincode.current = pin;

    const controller = new AbortController();
    setPincodeStatus({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode?pincode=${pin}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          // Don't block — let order through.
          setPincodeStatus({
            state: "available",
            codAvailable: true,
          });
          return;
        }
        const data = (await res.json()) as
          | { available: true; codAvailable: boolean }
          | { available: false; reason: string };
        if (data.available) {
          setPincodeStatus({
            state: "available",
            codAvailable: data.codAvailable,
          });
        } else {
          setPincodeStatus({ state: "unavailable", reason: data.reason });
        }
      } catch {
        // Network failure: don't block.
        setPincodeStatus({
          state: "available",
          codAvailable: true,
        });
      }
    }, 400);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [shipping.pincode]);

  // If COD becomes unavailable for this pincode, revert to Razorpay.
  useEffect(() => {
    if (
      paymentMethod === "cod" &&
      pincodeStatus.state === "available" &&
      !pincodeStatus.codAvailable
    ) {
      setPaymentMethod("razorpay");
    }
  }, [pincodeStatus, paymentMethod]);

  if (itemCount === 0) {
    return (
      <SmoothScroll>
        <Navigation />
        <main className="bg-cream pt-28 md:pt-36 pb-20 md:pb-28 cv-auto">
          <div className="max-w-2xl mx-auto px-5 md:px-9 text-center">
            <h1 className="text-h1 text-red mb-4">Nothing to check out yet.</h1>
            <p className="text-body text-dark/70 mb-8">
              Pop a jar into your cart first — then we&apos;ll do the spicy stuff.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center text-btn font-bold bg-green text-cream px-8 py-4 hover:bg-green/90 transition-colors"
            >
              Shop the heat
            </Link>
          </div>
        </main>
        <Footer />
      </SmoothScroll>
    );
  }

  function validate(): boolean {
    const e: Partial<Record<keyof Shipping, string>> = {};
    if (!shipping.name.trim()) e.name = "Required";
    if (!/^\S+@\S+\.\S+$/.test(shipping.email)) e.email = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(shipping.phone)) e.phone = "10-digit Indian mobile";
    if (!shipping.address1.trim()) e.address1 = "Required";
    if (!shipping.city.trim()) e.city = "Required";
    if (!shipping.state.trim()) e.state = "Required";
    if (!/^\d{6}$/.test(shipping.pincode)) e.pincode = "6-digit pincode";
    if (pincodeStatus.state === "unavailable") {
      e.pincode = pincodeStatus.reason;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCod() {
    setSubmitError(null);
    setPaying(true);
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(shipping));
    } catch {}

    trackAddShippingInfo(lines, total, shippingFree ? "free" : "flat_rate");
    trackAddPaymentInfo(lines, total, "cod");

    try {
      const res = await fetch("/api/cod-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
          shipping,
          couponCode: appliedCoupon || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        orderName?: string;
        statusPageUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `COD order failed (${res.status})`);
      }
      trackPurchase({
        transactionId: data.orderName || "cod",
        lines,
        value: total,
        shipping: shippingCost,
        discount,
        paymentType: "cod",
        coupon: discountLabel,
      });
      clear();
      const q = new URLSearchParams({
        method: "cod",
        order: data.orderName || "",
      });
      router.push(`/checkout/success?${q.toString()}`);
    } catch (err) {
      console.error("[checkout cod] failed", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Couldn't place your COD order. Please try again."
      );
      setPaying(false);
    }
  }

  async function handleRazorpay() {
    setSubmitError(null);
    setPaying(true);

    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(shipping));
    } catch {}

    trackAddShippingInfo(lines, total, shippingFree ? "free" : "flat_rate");
    trackAddPaymentInfo(lines, total, "razorpay");

    // Build compact notes for Razorpay (max 256 chars per value, 15 keys —
    // the server fills in subtotal/discount/shipping/total itself, so this
    // only needs to carry the shipping contact fields + the coupon code).
    // These notes are what the order-bridge uses to populate the Shopify
    // order: name, email, phone, address, city, state, pincode, items.
    const notes: Record<string, string> = {
      name: shipping.name.slice(0, 256),
      email: shipping.email.slice(0, 256),
      phone: shipping.phone,
      address: `${shipping.address1}${shipping.address2 ? `, ${shipping.address2}` : ""}`.slice(0, 256),
      city: shipping.city.slice(0, 256),
      state: shipping.state.slice(0, 256),
      pincode: shipping.pincode,
      items: lines
        .map((l) => `${l.slug}:${l.qty}`)
        .join(";")
        .slice(0, 256),
      ...(appliedCoupon ? { coupon_code: appliedCoupon.slice(0, 32) } : {}),
    };

    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Server derives the authoritative total (items − discount + shipping).
          // The client `total` is never trusted as-is.
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
          couponCode: appliedCoupon || undefined,
          receipt: `mom-${Date.now()}`,
          notes,
        }),
      });

      if (!orderRes.ok) {
        const data = (await orderRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Order create failed (${orderRes.status})`);
      }

      const order = (await orderRes.json()) as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      if (!window.Razorpay) throw new Error("Razorpay couldn't load. Check your internet and try again.");

      trackBeginCheckout(lines, total, discountLabel);

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Mirchi O Mirchi",
        description: itemSummary || "Order",
        image: "/images/mom-logo-white.webp",
        prefill: {
          name: shipping.name,
          email: shipping.email,
          contact: shipping.phone,
        },
        notes,
        theme: { color: "#9B1E15" },
        handler: async (payment: RazorpaySuccess) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }
            const verify = (await verifyRes.json().catch(() => ({}))) as {
              shopifyOrderName?: string;
            };

            trackPurchase({
              transactionId: payment.razorpay_payment_id,
              lines,
              value: total,
              shipping: shippingCost,
              discount,
              paymentType: "razorpay",
              coupon: discountLabel,
            });

            clear();
            const q = new URLSearchParams({
              method: "razorpay",
              payment_id: payment.razorpay_payment_id,
            });
            if (verify.shopifyOrderName) q.set("order", verify.shopifyOrderName);
            router.push(`/checkout/success?${q.toString()}`);
          } catch (err) {
            console.error("[checkout] verify failed", err);
            const q = new URLSearchParams({
              payment_id: payment.razorpay_payment_id,
            });
            router.push(`/checkout/failed?${q.toString()}`);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch (err) {
      console.error("[checkout] failed", err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please retry.");
      setPaying(false);
    }
  }

  async function handlePay() {
    if (!validate()) return;
    if (paymentMethod === "cod") {
      await handleCod();
    } else {
      await handleRazorpay();
    }
  }

  function field<K extends keyof Shipping>(name: K) {
    return {
      value: shipping[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setShipping((s) => ({ ...s, [name]: e.target.value })),
    };
  }

  const payButtonLabel = paying
    ? paymentMethod === "cod"
      ? "Placing your COD order…"
      : "Opening Razorpay…"
    : paymentMethod === "cod"
    ? `Place COD order — ₹${total}`
    : `Pay ₹${total} with Razorpay`;

  return (
    <SmoothScroll>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <Navigation />
      <main
        className={`bg-cream pt-28 md:pt-36 cv-auto ${
          quickAddProducts.length === 0 ? "pb-20 md:pb-28" : "pb-8 md:pb-10"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-9">
          <div className="mb-10 md:mb-14">
            <h1 className="text-h1 text-red">Where should we send it?</h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handlePay();
            }}
            noValidate
            className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-12 items-start"
          >
            {/* LEFT — shipping form */}
            <div className="space-y-6">
              <FieldGroup title="Contact">
                <Field label="full name" error={errors.name}>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Priya Sharma"
                    className={inputClass(!!errors.name)}
                    {...field("name")}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="email" error={errors.email}>
                    <input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      className={inputClass(!!errors.email)}
                      {...field("email")}
                    />
                  </Field>
                  <Field label="phone (10-digit)" error={errors.phone}>
                    <input
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="98765 43210"
                      className={inputClass(!!errors.phone)}
                      {...field("phone")}
                    />
                  </Field>
                </div>
              </FieldGroup>

              <FieldGroup title="Shipping address">
                <Field label="address" error={errors.address1}>
                  <input
                    type="text"
                    autoComplete="address-line1"
                    placeholder="e.g. Flat 4B, Shreeji Apartments"
                    className={inputClass(!!errors.address1)}
                    {...field("address1")}
                  />
                </Field>
                <Field label="apartment, landmark, etc. (optional)">
                  <input
                    type="text"
                    autoComplete="address-line2"
                    placeholder="e.g. Near Sai Service Petrol Pump"
                    className={inputClass(false)}
                    {...field("address2")}
                  />
                </Field>
                <div className="grid sm:grid-cols-3 gap-5">
                  <Field label="city" error={errors.city}>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      placeholder="e.g. Mumbai"
                      className={inputClass(!!errors.city)}
                      {...field("city")}
                    />
                  </Field>
                  <Field label="state" error={errors.state}>
                    <input
                      type="text"
                      autoComplete="address-level1"
                      placeholder="e.g. Maharashtra"
                      className={inputClass(!!errors.state)}
                      {...field("state")}
                    />
                  </Field>
                  <Field label="pincode" error={errors.pincode}>
                    <input
                      type="text"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="e.g. 400001"
                      className={inputClass(!!errors.pincode)}
                      {...field("pincode")}
                    />
                  </Field>
                </div>
                <PincodeStatusLine status={pincodeStatus} />
              </FieldGroup>

              <FieldGroup title="Payment method">
                <PaymentOption
                  active={paymentMethod === "razorpay"}
                  onClick={() => setPaymentMethod("razorpay")}
                  title="Online payment"
                  subtitle="UPI · Cards · Netbanking · Wallets via Razorpay"
                />
                <PaymentOption
                  active={paymentMethod === "cod"}
                  onClick={() => setPaymentMethod("cod")}
                  title="Cash on Delivery"
                  subtitle={
                    pincodeStatus.state === "available" && !pincodeStatus.codAvailable
                      ? "Not available for this pincode"
                      : "Pay in cash when your jars arrive"
                  }
                  disabled={
                    pincodeStatus.state === "available" &&
                    !pincodeStatus.codAvailable
                  }
                />
              </FieldGroup>
            </div>

            {/* RIGHT — summary + pay action */}
            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-cream-dark p-6 md:p-7">
                <h3 className="text-tag font-bold text-dark uppercase tracking-[0.06em] mb-5">
                  Order summary
                </h3>

                <ul className="space-y-4">
                  {lines.map((line) => {
                    const p = getProduct(line.slug);
                    if (!p) return null;
                    return (
                      <li key={line.slug} className="flex items-center gap-3">
                        <div className="relative w-14 h-14 shrink-0">
                          <div className="absolute inset-0 bg-cream overflow-hidden">
                            <Image
                              src={PRODUCT_CARD_IMAGES[line.slug] ?? p.image}
                              alt={p.name}
                              fill
                              className="object-contain p-1.5"
                            />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red text-cream text-[10px] font-bold flex items-center justify-center z-10">
                            {line.qty}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold truncate"
                            style={{ color: PDP_ACCENT_COLOR[p.flavor] }}
                          >
                            {p.name}
                          </p>
                          <p className="text-body-sm text-dark/50">{p.weight}</p>
                        </div>
                        <span className="text-body-sm font-bold text-dark">
                          ₹{p.price * line.qty}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="dotted-divider text-dark/15 my-5" />

                <div className="mb-5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="Discount code"
                      className="flex-1 min-w-0 bg-cream border-0 px-3 py-2.5 text-body-sm text-dark placeholder:text-dark/40 outline-none focus:ring-2 focus:ring-green/40"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim()}
                      className="text-btn font-bold text-body-sm bg-dark text-cream px-4 py-2.5 hover:bg-dark/85 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon !== "" && !couponValid && (
                    <p className="text-body-sm text-red mt-2">
                      &ldquo;{appliedCoupon}&rdquo; isn&apos;t a code we recognize.
                    </p>
                  )}
                  {appliedCoupon !== "" && couponValid && couponApplied && (
                    <p className="text-body-sm text-green font-semibold mt-2">
                      ✓ Code applied — {discountLabel}
                    </p>
                  )}
                  {couponSuperseded && (
                    <p className="text-body-sm text-dark/60 mt-2">
                      Your ₹{CART_DISCOUNT_THRESHOLD}+ auto-discount ({CART_DISCOUNT_PCT}%
                      off) already beats this code, so that&apos;s what&apos;s applied.
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-5">
                  <Row label="Subtotal" value={`₹${subtotal}`} />
                  {discount > 0 && (
                    <Row label={discountLabel ?? "Discount"} value={`−₹${discount}`} accent />
                  )}
                  <Row
                    label="Shipping"
                    value={shippingFree ? "Free" : `₹${shippingCost}`}
                    accent={shippingFree}
                  />
                </div>

                <div className="dotted-divider text-dark/15 mb-4" />

                <div className="flex justify-between items-baseline">
                  <span className="text-body font-bold text-dark">Total</span>
                  <span className="text-h4 font-bold text-red">₹{total}</span>
                </div>
              </div>

              {submitError && (
                <p className="text-body-sm text-red bg-red/10 px-4 py-3 mt-5">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={paying || pincodeStatus.state === "unavailable"}
                className="w-full text-btn font-bold bg-green text-cream py-4 hover:bg-green/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-5"
              >
                {payButtonLabel}
              </button>

              <p className="text-body-sm text-dark/60 mt-4">
                {paymentMethod === "cod"
                  ? "Pay in cash when your jars arrive. You'll get an email confirmation now and a tracking link as soon as we ship."
                  : "Pay securely with UPI, debit/credit card, netbanking or wallets via Razorpay. You'll get an email confirmation the moment payment is captured."}
              </p>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-btn text-dark/70 hover:text-red transition-colors mt-5"
              >
                <span aria-hidden="true">←</span> Back to home
              </Link>
            </aside>
          </form>
        </div>
      </main>

      {quickAddProducts.length > 0 && (
        <PdpCrossSell
          relatedProducts={quickAddProducts}
          heading="Quick add"
          openCartOnAdd={false}
        />
      )}

      <Footer />
    </SmoothScroll>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream-dark p-6 md:p-7">
      <h2 className="text-h4 font-bold text-green mb-6">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[1.2rem] text-dark capitalize mb-1.5">
        {label}
      </span>
      {children}
      {error && <span className="block text-body-sm text-red mt-1">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full bg-transparent border-0 border-b-2 ${
    hasError ? "border-red" : "border-green"
  } py-2.5 text-base text-dark placeholder:text-dark/35 outline-none focus:border-red transition-colors`;
}

function Row({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between text-body-sm">
      <span
        className={
          accent
            ? "text-green font-semibold"
            : muted
            ? "text-dark/50"
            : "text-dark/70"
        }
      >
        {label}
      </span>
      <span
        className={`font-semibold ${
          accent ? "text-green" : muted ? "text-dark/50" : "text-dark"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PincodeStatusLine({
  status,
}: {
  status:
    | { state: "idle" }
    | { state: "checking" }
    | { state: "available"; codAvailable: boolean }
    | { state: "unavailable"; reason: string };
}) {
  if (status.state === "idle") return null;
  if (status.state === "checking") {
    return <p className="text-body-sm text-dark/50">Checking serviceability…</p>;
  }
  if (status.state === "available") {
    return (
      <p className="text-body-sm text-green font-semibold">
        ✓ Deliverable
        {status.codAvailable ? " · COD available" : " · COD unavailable here"}
      </p>
    );
  }
  return <p className="text-body-sm text-red font-semibold">{status.reason}</p>;
}

function PaymentOption({
  active,
  onClick,
  title,
  subtitle,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
        active ? "bg-green/10" : "bg-cream hover:bg-cream/60"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-4 h-4 rounded-full border-2 shrink-0 ${
            active ? "border-green bg-green" : "border-dark/25"
          }`}
        />
        <div className="flex-1">
          <p className="text-body font-bold text-dark">{title}</p>
          <p className="text-body-sm text-dark/55 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}
