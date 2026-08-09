"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { PRODUCTS, Product } from "@/lib/products";
import {
  trackAddToCart,
  trackBeginCheckout,
  trackRemoveFromCart,
} from "@/lib/analytics-events";

// Local-only cart. Payment goes through Razorpay at /checkout; Shopify is no
// longer in the checkout path, so we don't sync line items to a Shopify cart.

export type CartLine = {
  slug: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  // `openMiniCart` defaults to true (the usual "add → drawer slides in"
  // behavior everywhere on the site). Pass false from a context that
  // already shows the cart contents inline (e.g. checkout's own order
  // summary), where popping the drawer open on top would be redundant.
  add: (slug: string, qty?: number, openMiniCart?: boolean) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  goToCheckout: () => void;
  // Mini-cart UI state
  miniOpen: boolean;
  miniProduct: Product | null;
  openMini: (product: Product) => void;
  closeMini: () => void;
  openCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const LINES_KEY = "mom-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [miniOpen, setMiniOpen] = useState(false);
  const [miniProduct, setMiniProduct] = useState<Product | null>(null);

  // Rehydrate from localStorage on mount (client-only).
  useEffect(() => {
    try {
      const rawLines = localStorage.getItem(LINES_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rawLines) setLines(JSON.parse(rawLines));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist lines on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LINES_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  const add = useCallback((slug: string, qty: number = 1, openMiniCart: boolean = true) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { slug, qty }];
    });
    const product = PRODUCTS.find((p) => p.slug === slug);
    if (product) {
      if (openMiniCart) {
        setMiniProduct(product);
        setMiniOpen(true);
      }
      trackAddToCart(product, qty);
    }
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((prev) => {
      const removed = prev.find((l) => l.slug === slug);
      const product = removed ? PRODUCTS.find((p) => p.slug === slug) : null;
      if (product && removed) trackRemoveFromCart(product, removed.qty);
      return prev.filter((l) => l.slug !== slug);
    });
  }, []);

  const setQty = useCallback(
    (slug: string, qty: number) => {
      if (qty <= 0) {
        remove(slug);
        return;
      }
      setLines((prev) => {
        const existing = prev.find((l) => l.slug === slug);
        const product = PRODUCTS.find((p) => p.slug === slug);
        if (product && existing && qty < existing.qty) {
          trackRemoveFromCart(product, existing.qty - qty);
        }
        return prev.map((l) => (l.slug === slug ? { ...l, qty } : l));
      });
    },
    [remove]
  );

  const clear = useCallback(() => setLines([]), []);

  const goToCheckout = useCallback(() => {
    const total = lines.reduce((s, l) => {
      const p = PRODUCTS.find((p) => p.slug === l.slug);
      return s + (p?.price ?? 0) * l.qty;
    }, 0);
    trackBeginCheckout(lines, total);
    window.location.href = "/checkout";
  }, [lines]);

  const openMini = useCallback((product: Product) => {
    setMiniProduct(product);
    setMiniOpen(true);
  }, []);



  const closeMini = useCallback(() => setMiniOpen(false), []);

  const openCart = useCallback(() => {
    setMiniOpen(true);
  }, []);

  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => {
    const p = PRODUCTS.find((p) => p.slug === l.slug);
    return s + (p?.price ?? 0) * l.qty;
  }, 0);

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      add,
      remove,
      setQty,
      clear,
      goToCheckout,
      miniOpen,
      miniProduct,
      openMini,
      closeMini,
      openCart,
    }),
    [
      lines,
      itemCount,
      subtotal,
      add,
      remove,
      setQty,
      clear,
      goToCheckout,
      miniOpen,
      miniProduct,
      openMini,
      closeMini,
      openCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
