"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export interface CartItem {
  productId: number;
  slug: string;
  categorySlug: string;
  name: string;
  thumbnailUrl: string | null;
  unitPrice: number;
  quantity: number;
  minQuantity: number;
  maxQuantity: number | null;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** Adds `quantity` (defaulting to the product's min_quantity) to the cart — additive if the product is already in it. */
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  /** Sets a line's quantity directly, clamped to [minQuantity, maxQuantity]. */
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// A module-level store synced to localStorage, read through
// useSyncExternalStore — there's no customer account/login on the storefront
// (see OrderRequest: checkout is a guest flow), so the cart is scoped to
// this browser only. useSyncExternalStore (rather than useState + a
// useEffect that reads localStorage on mount) is what keeps this
// hydration-safe: the server and the client's first render both get the
// empty getServerSnapshot, and the real cart swaps in right after, with no
// setState-during-effect render cascade.
const STORAGE_KEY = "gg-cart";
const listeners = new Set<() => void>();
let cachedItems: CartItem[] | null = null;
const emptyCart: CartItem[] = [];

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): CartItem[] {
  if (cachedItems === null) cachedItems = readStoredCart();
  return cachedItems;
}

function getServerSnapshot(): CartItem[] {
  return emptyCart;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  // Picks up changes made in another tab (or another mounted CartProvider).
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function writeCart(next: CartItem[]) {
  cachedItems = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode, quota) — the cart still
    // works for the session, it just won't survive a reload.
  }
  listeners.forEach((listener) => listener());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity) => {
    const current = getSnapshot();
    const requested = Math.max(quantity ?? item.minQuantity, item.minQuantity);
    const existing = current.find((i) => i.productId === item.productId);

    if (existing) {
      const nextQty = item.maxQuantity
        ? Math.min(existing.quantity + requested, item.maxQuantity)
        : existing.quantity + requested;
      writeCart(current.map((i) => (i.productId === item.productId ? { ...i, quantity: nextQty } : i)));
      return;
    }

    writeCart([...current, { ...item, quantity: requested }]);
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const current = getSnapshot();
    writeCart(
      current.map((i) => {
        if (i.productId !== productId) return i;
        const floor = Math.max(quantity, i.minQuantity);
        const clamped = i.maxQuantity ? Math.min(floor, i.maxQuantity) : floor;
        return { ...i, quantity: clamped };
      }),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    writeCart(getSnapshot().filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, count, subtotal, addItem, updateQuantity, removeItem, clear }),
    [items, count, subtotal, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
