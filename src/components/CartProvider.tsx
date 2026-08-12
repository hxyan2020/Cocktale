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

const CART_PREFIX = "cocktale:cart:";
const ORDERS_PREFIX = "cocktale:orders:";

type CartContextValue = {
  items: CartItem[];
  orders: Order[];
  count: number;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  saveOrder: (order: Order) => void;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
  getOrder: (orderId: string) => Order | undefined;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const accountId = user?.id ?? "guest";
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setItems(readCart(accountId));
    setOrders(readOrders(accountId));
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
      const current = readCart(accountId);
      const existing = current.find((i) => i.productId === productId);
      const next = existing
        ? current.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + qty } : i,
          )
        : [...current, { productId, quantity: qty }];
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
      if (qty <= 0) {
        persistCart(readCart(accountId).filter((i) => i.productId !== productId));
        return;
      }
      persistCart(
        readCart(accountId).map((i) =>
          i.productId === productId ? { ...i, quantity: qty } : i,
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
    (orderId: string) => orders.find((o) => o.id === orderId),
    [orders],
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
      addItem,
      removeItem,
      setQty,
      clearCart,
      saveOrder,
      updateOrder,
      getOrder,
    }),
    [
      items,
      orders,
      count,
      addItem,
      removeItem,
      setQty,
      clearCart,
      saveOrder,
      updateOrder,
      getOrder,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
