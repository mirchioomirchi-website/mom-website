// Shopify Admin GraphQL API — server-side only.
//
// This client pushes paid orders (from Razorpay) and pending orders (Cash on
// Delivery) into Shopify Admin so they show up in Orders, decrement inventory,
// auto-trigger Shopify's confirmation email, and auto-sync to Shiprocket.
//
// Required env vars (NEVER expose CLIENT_SECRET to the client):
//   SHOPIFY_STORE_DOMAIN          e.g. "mirchi-o-mirchi.myshopify.com"
//   SHOPIFY_CLIENT_ID             from the app's Dev Dashboard Settings page
//   SHOPIFY_CLIENT_SECRET         from the app's Dev Dashboard Settings page
//   SHOPIFY_ADMIN_API_VERSION     defaults to "2025-01"
//
// Auth: Shopify custom apps no longer issue a static "shpat_" token you copy
// once — the Dev Dashboard only gives a Client ID + Client Secret pair. We
// exchange those for a short-lived access token via the OAuth client
// credentials grant (RFC 6749 §4.4), documented at:
//   https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant
// Tokens expire after 24h (86399s), so we cache the token in memory and
// transparently refetch it (with a safety buffer) whenever it's stale.
//
// To get the Client ID/Secret:
//   1. dev.shopify.com/dashboard → your app (e.g. "MOM Order Bridge") → Settings
//   2. Copy the Client ID; click the eye icon (or Rotate) to reveal the Secret
//   3. Configure Admin API scopes for the app's active version: write_orders,
//      read_orders, write_customers, read_products, read_inventory,
//      write_inventory, read_fulfillments, write_fulfillments
//   4. Install the app on the store (Settings → Apps → find it under
//      "Uninstalled" → Install) — client credentials only work for apps
//      installed on a store in the same organization as the app.

const STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";
const API_VERSION =
  process.env.SHOPIFY_ADMIN_API_VERSION ||
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ||
  "2025-01";

export const shopifyAdminConfigured = Boolean(
  STORE_DOMAIN && CLIENT_ID && CLIENT_SECRET
);

const ENDPOINT = STORE_DOMAIN
  ? `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`
  : "";
const TOKEN_ENDPOINT = STORE_DOMAIN
  ? `https://${STORE_DOMAIN}/admin/oauth/access_token`
  : "";

// In-memory access-token cache (per server instance). Refetched ~2 minutes
// before actual expiry so we never hand out a token that dies mid-request.
let tokenCache: { token: string; expiresAt: number } | null = null;
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;

async function getAccessToken(): Promise<string | null> {
  if (!shopifyAdminConfigured) return null;
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  try {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        "[shopify-admin] token exchange HTTP",
        res.status,
        text.slice(0, 500)
      );
      return null;
    }
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!json.access_token) {
      console.error("[shopify-admin] token exchange returned no access_token");
      return null;
    }
    tokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 86399) * 1000 - TOKEN_REFRESH_BUFFER_MS,
    };
    return tokenCache.token;
  } catch (err) {
    console.error("[shopify-admin] token exchange failed", err);
    return null;
  }
}

type GraphQLResp<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

// Exported so other server-only modules (e.g. shopify-product-data.ts) can
// run their own Admin API queries without duplicating the OAuth/token/fetch
// plumbing above.
export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data: T | null; errors: string[] }> {
  if (!shopifyAdminConfigured) {
    return { data: null, errors: ["Shopify Admin not configured"] };
  }
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { data: null, errors: ["Could not obtain Shopify access token"] };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
      // Admin API can be slow under load — give it a sensible budget.
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[shopify-admin] HTTP", res.status, text.slice(0, 500));
      return { data: null, errors: [`HTTP ${res.status}`] };
    }
    const json = (await res.json()) as GraphQLResp<T>;
    if (json.errors?.length) {
      console.error("[shopify-admin] GraphQL errors", json.errors);
      return { data: null, errors: json.errors.map((e) => e.message) };
    }
    return { data: json.data ?? null, errors: [] };
  } catch (err) {
    console.error("[shopify-admin] fetch failed", err);
    return {
      data: null,
      errors: [err instanceof Error ? err.message : "fetch failed"],
    };
  }
}

// ── Public types ──────────────────────────────────────────────────────────

export type AdminOrderLineInput = {
  /** Display title, e.g. "Green Chilli Thecha (250g)". */
  title: string;
  /** Per-unit price in rupees. */
  priceRupees: number;
  /** Quantity. */
  quantity: number;
  /** Optional product variant GID (gid://shopify/ProductVariant/123). */
  variantId?: string;
  /** Optional SKU for label printing. */
  sku?: string;
  /** Optional grams per unit, used for shipping weight + label. */
  gramsPerUnit?: number;
};

export type AdminAddressInput = {
  firstName: string;
  lastName?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string; // e.g. "Maharashtra"
  zip: string; // pincode
  country?: string; // defaults to "India"
  phone?: string;
};

export type CreatePaidOrderInput = {
  email: string;
  phone: string;
  shipping: AdminAddressInput;
  lines: AdminOrderLineInput[];
  shippingTitle: string; // e.g. "Standard shipping"
  shippingPriceRupees: number;
  discountRupees: number; // amount of automatic discount (e.g. 10% off)
  discountLabel?: string; // e.g. "Cart 10% discount"
  totalRupees: number; // authoritative total = lines + shipping − discount
  razorpayPaymentId: string;
  razorpayOrderId: string;
  /** Extra tags appended to the order (e.g. "flagged-mismatch"). */
  extraTags?: string[];
  /** Extra text appended to the order's note (e.g. mismatch details). */
  extraNote?: string;
};

export type CreatePendingOrderInput = Omit<
  CreatePaidOrderInput,
  "razorpayPaymentId" | "razorpayOrderId"
> & {
  codReference: string; // unique idempotency key generated by us
};

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderName: string; // e.g. "#1024"
      legacyOrderId: string;
      statusPageUrl?: string;
      alreadyExists: boolean;
    }
  | { ok: false; reason: string };

// ── Idempotency: search-by-tag ────────────────────────────────────────────
//
// Every order we create carries a tag of the form:
//   rzp-<paymentId>     (Razorpay-paid orders)
//   cod-<reference>     (Cash-on-delivery orders)
// Before creating, we query Shopify for an existing order with that tag. If
// one already exists, we return it without creating a duplicate.

const ORDER_BY_TAG_QUERY = /* GraphQL */ `
  query OrderByTag($q: String!) {
    orders(first: 1, query: $q) {
      nodes {
        id
        name
        legacyResourceId
        statusPageUrl
      }
    }
  }
`;

type OrderByTagResp = {
  orders: {
    nodes: Array<{
      id: string;
      name: string;
      legacyResourceId: string;
      statusPageUrl?: string;
    }>;
  };
};

async function findOrderByTag(tag: string) {
  // Shopify's order search query uses `tag:<value>`. Tag must be quoted if it
  // contains anything beyond [A-Za-z0-9_-].
  const safe = tag.replace(/[^A-Za-z0-9_-]/g, "");
  if (!safe) return null;
  const { data } = await adminFetch<OrderByTagResp>(ORDER_BY_TAG_QUERY, {
    q: `tag:${safe}`,
  });
  return data?.orders.nodes[0] ?? null;
}

// ── Order creation mutation ───────────────────────────────────────────────

const ORDER_CREATE_MUTATION = /* GraphQL */ `
  mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      order {
        id
        name
        legacyResourceId
        statusPageUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type OrderCreateResp = {
  orderCreate: {
    order: {
      id: string;
      name: string;
      legacyResourceId: string;
      statusPageUrl?: string;
    } | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

function toMailingAddress(addr: AdminAddressInput) {
  return {
    firstName: addr.firstName.slice(0, 100),
    lastName: (addr.lastName || ".").slice(0, 100),
    address1: addr.address1.slice(0, 255),
    address2: (addr.address2 || "").slice(0, 255),
    city: addr.city.slice(0, 100),
    province: addr.province?.slice(0, 100),
    zip: addr.zip.slice(0, 16),
    country: addr.country || "India",
    phone: (addr.phone || "").slice(0, 32),
  };
}

function toLineItems(lines: AdminOrderLineInput[]) {
  return lines.map((l) => {
    // Prefer variant linking (lets Shopify decrement inventory automatically).
    // If we don't have a variantId, fall back to a custom line item.
    const base = {
      quantity: Math.max(1, Math.min(99, Math.floor(l.quantity))),
    } as Record<string, unknown>;
    if (l.variantId) {
      base.variantId = l.variantId;
      // priceSet override so Shopify uses the price the customer actually paid
      // (in case the catalogue price changed mid-checkout).
      base.priceSet = {
        shopMoney: {
          amount: l.priceRupees.toFixed(2),
          currencyCode: "INR",
        },
      };
      return base;
    }
    base.title = l.title.slice(0, 250);
    base.priceSet = {
      shopMoney: {
        amount: l.priceRupees.toFixed(2),
        currencyCode: "INR",
      },
    };
    if (l.sku) base.sku = l.sku.slice(0, 64);
    if (l.gramsPerUnit) base.requiresShipping = true;
    return base;
  });
}

// ── Public: createPaidOrder ───────────────────────────────────────────────

export async function createPaidOrder(
  input: CreatePaidOrderInput
): Promise<CreateOrderResult> {
  if (!shopifyAdminConfigured) {
    return { ok: false, reason: "Shopify Admin not configured" };
  }

  const tag = `rzp-${input.razorpayPaymentId}`.replace(/[^A-Za-z0-9_-]/g, "");

  const existing = await findOrderByTag(tag);
  if (existing) {
    return {
      ok: true,
      orderId: existing.id,
      orderName: existing.name,
      legacyOrderId: existing.legacyResourceId,
      statusPageUrl: existing.statusPageUrl,
      alreadyExists: true,
    };
  }

  const lineItems = toLineItems(input.lines);
  const shippingAddress = toMailingAddress(input.shipping);
  const billingAddress = shippingAddress;

  const shippingLines = [
    {
      title: input.shippingTitle.slice(0, 100),
      priceSet: {
        shopMoney: {
          amount: input.shippingPriceRupees.toFixed(2),
          currencyCode: "INR",
        },
      },
    },
  ];

  // The transaction is what makes Shopify recognise this as a paid order.
  const transactions = [
    {
      kind: "SALE",
      status: "SUCCESS",
      gateway: "razorpay",
      authorizationCode: input.razorpayPaymentId.slice(0, 256),
      amountSet: {
        shopMoney: {
          amount: input.totalRupees.toFixed(2),
          currencyCode: "INR",
        },
      },
    },
  ];

  const order: Record<string, unknown> = {
    currency: "INR",
    email: input.email.slice(0, 255),
    phone: input.phone.slice(0, 32),
    note: `Razorpay payment ${input.razorpayPaymentId} (order ${input.razorpayOrderId})${input.extraNote ?? ""}`,
    tags: [tag, "razorpay", "headless-checkout", ...(input.extraTags ?? [])],
    lineItems,
    shippingAddress,
    billingAddress,
    shippingLines,
    transactions,
    sourceName: "mirchiomirchi.com",
  };

  if (input.discountRupees > 0) {
    order.discountCode = {
      itemFixedDiscountCode: {
        code: (input.discountLabel || "AUTO10").slice(0, 32),
        amountSet: {
          shopMoney: {
            amount: input.discountRupees.toFixed(2),
            currencyCode: "INR",
          },
        },
      },
    };
  }

  const { data, errors } = await adminFetch<OrderCreateResp>(
    ORDER_CREATE_MUTATION,
    {
      order,
      options: {
        sendReceipt: true,
        sendFulfillmentReceipt: false,
        inventoryBehaviour: "DECREMENT_OBEYING_POLICY",
      },
    }
  );

  if (!data) {
    return { ok: false, reason: errors.join("; ") || "no data" };
  }

  const result = data.orderCreate;
  if (result.userErrors.length > 0 || !result.order) {
    const userErrs = result.userErrors
      .map((e) => `${e.field?.join(".") ?? "?"}: ${e.message}`)
      .join("; ");
    return { ok: false, reason: userErrs || "no order returned" };
  }

  return {
    ok: true,
    orderId: result.order.id,
    orderName: result.order.name,
    legacyOrderId: result.order.legacyResourceId,
    statusPageUrl: result.order.statusPageUrl,
    alreadyExists: false,
  };
}

// ── Public: createPendingOrder (COD) ──────────────────────────────────────

export async function createPendingOrder(
  input: CreatePendingOrderInput
): Promise<CreateOrderResult> {
  if (!shopifyAdminConfigured) {
    return { ok: false, reason: "Shopify Admin not configured" };
  }

  const tag = `cod-${input.codReference}`.replace(/[^A-Za-z0-9_-]/g, "");

  const existing = await findOrderByTag(tag);
  if (existing) {
    return {
      ok: true,
      orderId: existing.id,
      orderName: existing.name,
      legacyOrderId: existing.legacyResourceId,
      statusPageUrl: existing.statusPageUrl,
      alreadyExists: true,
    };
  }

  const lineItems = toLineItems(input.lines);
  const shippingAddress = toMailingAddress(input.shipping);
  const billingAddress = shippingAddress;

  const shippingLines = [
    {
      title: input.shippingTitle.slice(0, 100),
      priceSet: {
        shopMoney: {
          amount: input.shippingPriceRupees.toFixed(2),
          currencyCode: "INR",
        },
      },
    },
  ];

  const order: Record<string, unknown> = {
    currency: "INR",
    email: input.email.slice(0, 255),
    phone: input.phone.slice(0, 32),
    note: `Cash on Delivery — internal ref ${input.codReference}`,
    tags: [tag, "cod", "headless-checkout"],
    lineItems,
    shippingAddress,
    billingAddress,
    shippingLines,
    // NO transactions array → order will be financial_status: pending.
    sourceName: "mirchiomirchi.com",
  };

  const { data, errors } = await adminFetch<OrderCreateResp>(
    ORDER_CREATE_MUTATION,
    {
      order,
      options: {
        sendReceipt: true,
        sendFulfillmentReceipt: false,
        inventoryBehaviour: "DECREMENT_OBEYING_POLICY",
      },
    }
  );

  if (!data) {
    return { ok: false, reason: errors.join("; ") || "no data" };
  }
  const result = data.orderCreate;
  if (result.userErrors.length > 0 || !result.order) {
    const userErrs = result.userErrors
      .map((e) => `${e.field?.join(".") ?? "?"}: ${e.message}`)
      .join("; ");
    return { ok: false, reason: userErrs || "no order returned" };
  }

  return {
    ok: true,
    orderId: result.order.id,
    orderName: result.order.name,
    legacyOrderId: result.order.legacyResourceId,
    statusPageUrl: result.order.statusPageUrl,
    alreadyExists: false,
  };
}

// ── Public: lookup order for tracking page ────────────────────────────────

const ORDER_LOOKUP_QUERY = /* GraphQL */ `
  query OrderLookup($q: String!) {
    orders(first: 5, query: $q) {
      nodes {
        id
        name
        email
        displayFulfillmentStatus
        displayFinancialStatus
        createdAt
        statusPageUrl
        fulfillments(first: 5) {
          createdAt
          status
          trackingInfo {
            number
            url
            company
          }
        }
        lineItems(first: 20) {
          nodes {
            title
            quantity
          }
        }
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

type OrderLookupResp = {
  orders: {
    nodes: Array<{
      id: string;
      name: string;
      email?: string | null;
      displayFulfillmentStatus: string;
      displayFinancialStatus: string;
      createdAt: string;
      statusPageUrl?: string;
      fulfillments: Array<{
        createdAt: string;
        status: string;
        trackingInfo: Array<{
          number?: string;
          url?: string;
          company?: string;
        }>;
      }>;
      lineItems: { nodes: Array<{ title: string; quantity: number }> };
      totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
    }>;
  };
};

export type OrderLookupResult = {
  orderName: string;
  fulfillmentStatus: string;
  financialStatus: string;
  createdAt: string;
  statusPageUrl?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  trackingCompany?: string;
  items: Array<{ title: string; quantity: number }>;
  totalRupees: number;
  currency: string;
};

export async function lookupOrder(params: {
  orderName: string;
  email: string;
}): Promise<OrderLookupResult | null> {
  if (!shopifyAdminConfigured) return null;

  // Search query: name (e.g. "#1024") + email. Both filters are required to
  // prevent enumeration — an attacker can't get an order with only the number.
  const cleanName = params.orderName.replace(/[^A-Za-z0-9#_-]/g, "").slice(0, 64);
  const cleanEmail = params.email.replace(/"/g, "").slice(0, 150);
  if (!cleanName || !/^\S+@\S+\.\S+$/.test(cleanEmail)) return null;

  const q = `name:${cleanName} email:${cleanEmail}`;

  const { data } = await adminFetch<OrderLookupResp>(ORDER_LOOKUP_QUERY, { q });
  const node = data?.orders.nodes[0];
  if (!node) return null;

  // Defence: confirm the email match (in case Shopify's fuzzy match was lax).
  if ((node.email || "").toLowerCase() !== cleanEmail.toLowerCase()) return null;

  const tracking = node.fulfillments
    .flatMap((f) => f.trackingInfo)
    .find((t) => t.number || t.url);

  return {
    orderName: node.name,
    fulfillmentStatus: node.displayFulfillmentStatus,
    financialStatus: node.displayFinancialStatus,
    createdAt: node.createdAt,
    statusPageUrl: node.statusPageUrl,
    trackingNumber: tracking?.number,
    trackingUrl: tracking?.url,
    trackingCompany: tracking?.company,
    items: node.lineItems.nodes.map((n) => ({
      title: n.title,
      quantity: n.quantity,
    })),
    totalRupees: Number(node.totalPriceSet.shopMoney.amount),
    currency: node.totalPriceSet.shopMoney.currencyCode,
  };
}

// ── Public: lookup an order's Razorpay payment id (for refund webhook) ────

const ORDER_TAGS_QUERY = /* GraphQL */ `
  query OrderTags($id: ID!) {
    order(id: $id) {
      id
      tags
      note
    }
  }
`;

type OrderTagsResp = {
  order: { id: string; tags: string[]; note?: string } | null;
};

export async function getRazorpayPaymentIdForOrder(
  orderGid: string
): Promise<string | null> {
  if (!shopifyAdminConfigured) return null;
  const { data } = await adminFetch<OrderTagsResp>(ORDER_TAGS_QUERY, {
    id: orderGid,
  });
  const order = data?.order;
  if (!order) return null;
  const match = order.tags.find((t) => t.startsWith("rzp-"));
  if (match) return match.slice(4);
  // Fallback: parse from note "Razorpay payment pay_XXX (order order_YYY)"
  const noteMatch = (order.note || "").match(/Razorpay payment (\S+)/);
  return noteMatch ? noteMatch[1] : null;
}
