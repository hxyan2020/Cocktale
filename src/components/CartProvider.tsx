"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order } from "@/lib/commerce-types";
import { useAuth } from "@/components/AuthProvider";
import { getProduct } from "@/lib/products";

const CART_PREFIX = "cocktale:cart:";
const ORDERS_PREFIX = "cocktale:orders:";
const GUEST_ID = "guest";

type CartContextValue = {
  items: CartItem[];
  orders: Order[];
  count: number;
  hydrated: boolean;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  saveOrder: (order: Order) => void;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
  getOrder: (orderId: string) => Order | undefined;
  findOrderBySession: (sessionId: string) => Order | undefined;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(userId: string): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_PREFIX + userId) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(userId: string, items: CartItem[]) {
  localStorage.setItem(CART_PREFIX + userId, JSON.stringify(items));
}

function readOrders(userId: string): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_PREFIX + userId) || "[]") as Order[];
  } catch {
    return [];
  }
}

function writeOrders(userId: string, orders: Order[]) {
  localStorage.setItem(ORDERS_PREFIX + userId, JSON.stringify(orders));
}

function mergeCarts(primary: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map(primary.map((item) => [item.productId, { ...item }]));
  for (const item of incoming) {
    const existing = map.get(item.productId);
    const product = getProduct(item.productId);
    const nextQty = (existing?.quantity || 0) + item.quantity;
    const capped = product ? Math.min(nextQty, Math.max(1, product.stock)) : nextQty;
    map.set(item.productId, { productId: item.productId, quantity: capped });
  }
  return [...map.values()].filter((item) => getProduct(item.productId));
}

function mergeOrders(primary: Order[], incoming: Order[]): Order[] {
  const map = new Map<string, Order>();
  for (const order of [...incoming, ...primary]) {
    const existing = map.get(order.id);
    if (!existing) {
      map.set(order.id, order);
      continue;
    }
    const existingTs = new Date(existing.updatedAt || existing.createdAt).getTime();
    const nextTs = new Date(order.updatedAt || order.createdAt).getTime();
    map.set(order.id, nextTs >= existingTs ? { ...existing, ...order } : { ...order, ...existing });
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function clampQty(productId: string, qty: number) {
  const product = getProduct(productId);
  if (!product) return 0;
  return Math.max(0, Math.min(qty, Math.max(0, product.stock), 20));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const accountId = user?.id ?? GUEST_ID;
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    let cart = readCart(accountId);
    let nextOrders = readOrders(accountId);

    // Bring guest cart/orders along when someone signs in.
    if (accountId !== GUEST_ID) {
      const guestCart = readCart(GUEST_ID);
      const guestOrders = readOrders(GUEST_ID);
      if (guestCart.length > 0) {
        cart = mergeCarts(cart, guestCart);
        writeCart(accountId, cart);
        writeCart(GUEST_ID, []);
      }
      if (guestOrders.length > 0) {
        nextOrders = mergeOrders(nextOrders, guestOrders);
        writeOrders(accountId, nextOrders);
        writeOrders(GUEST_ID, []);
      }
    }

    setItems(cart);
    setOrders(nextOrders);
    setHydrated(true);

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(accountId)}`, {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { orders?: Order[] };
        if (!data.orders?.length || cancelled) return;
        const merged = mergeOrders(readOrders(accountId), data.orders);
        writeOrders(accountId, merged);
        if (!cancelled) setOrders(merged);
      } catch {
        // offline / first paint — keep local orders
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  const persistCart = useCallback(
    (next: CartItem[]) => {
      setItems(next);
      writeCart(accountId, next);
    },
    [accountId],
  );

  const addItem = useCallback(
    (productId: string, qty = 1) => {
      if (!getProduct(productId)) return;
      const current = readCart(accountId);
      const existing = current.find((i) => i.productId === productId);
      const desired = (existing?.quantity || 0) + qty;
      const quantity = clampQty(productId, desired);
      if (quantity <= 0) return;
      const next = existing
        ? current.map((i) => (i.productId === productId ? { ...i, quantity } : i))
        : [...current, { productId, quantity }];
      persistCart(next);
    },
    [accountId, persistCart],
  );

  const removeItem = useCallback(
    (productId: string) => {
      persistCart(readCart(accountId).filter((i) => i.productId !== productId));
    },
    [accountId, persistCart],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const quantity = clampQty(productId, qty);
      if (quantity <= 0) {
        persistCart(readCart(accountId).filter((i) => i.productId !== productId));
        return;
      }
      persistCart(
        readCart(accountId).map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
      );
    },
    [accountId, persistCart],
  );

  const clearCart = useCallback(() => {
    persistCart([]);
  }, [persistCart]);

  const saveOrder = useCallback(
    (order: Order) => {
      const next = [order, ...readOrders(accountId).filter((o) => o.id !== order.id)];
      writeOrders(accountId, next);
      setOrders(next);
    },
    [accountId],
  );

  const updateOrder = useCallback(
    (orderId: string, patch: Partial<Order>) => {
      const next = readOrders(accountId).map((o) =>
        o.id === orderId ? { ...o, ...patch } : o,
      );
      writeOrders(accountId, next);
      setOrders(next);
    },
    [accountId],
  );

  const getOrder = useCallback(
    (orderId: string) => {
      return readOrders(accountId).find((o) => o.id === orderId) || orders.find((o) => o.id === orderId);
    },
    [accountId, orders],
  );

  const findOrderBySession = useCallback(
    (sessionId: string) => {
      return (
        readOrders(accountId).find((o) => o.stripeSessionId === sessionId) ||
        orders.find((o) => o.stripeSessionId === sessionId)
      );
    },
    [accountId, orders],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      orders,
      count,
      hydrated,
      addItem,
      removeItem,
      setQty,
      clearCart,
      saveOrder,
      updateOrder,
      getOrder,
      findOrderBySession,
    }),
    [
      items,
      orders,
      count,
      hydrated,
      addItem,
      removeItem,
      setQty,
      clearCart,
      saveOrder,
      updateOrder,
      getOrder,
      findOrderBySession,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
