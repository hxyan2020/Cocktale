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
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setOrders([]);
      return;
    }
    setItems(readCart(user.id));
    setOrders(readOrders(user.id));
  }, [user]);

  const persistCart = useCallback(
    (next: CartItem[]) => {
      setItems(next);
      if (user) writeCart(user.id, next);
    },
    [user],
  );

  const addItem = useCallback(
    (productId: string, qty = 1) => {
      if (!user) return;
      const current = readCart(user.id);
      const existing = current.find((i) => i.productId === productId);
      const next = existing
        ? current.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + qty } : i,
          )
        : [...current, { productId, quantity: qty }];
      persistCart(next);
    },
    [user, persistCart],
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (!user) return;
      persistCart(readCart(user.id).filter((i) => i.productId !== productId));
    },
    [user, persistCart],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      if (!user) return;
      if (qty <= 0) {
        persistCart(readCart(user.id).filter((i) => i.productId !== productId));
        return;
      }
      persistCart(
        readCart(user.id).map((i) =>
          i.productId === productId ? { ...i, quantity: qty } : i,
        ),
      );
    },
    [user, persistCart],
  );

  const clearCart = useCallback(() => {
    if (!user) return;
    persistCart([]);
  }, [user, persistCart]);

  const saveOrder = useCallback(
    (order: Order) => {
      if (!user) return;
      const next = [order, ...readOrders(user.id).filter((o) => o.id !== order.id)];
      writeOrders(user.id, next);
      setOrders(next);
    },
    [user],
  );

  const updateOrder = useCallback(
    (orderId: string, patch: Partial<Order>) => {
      if (!user) return;
      const next = readOrders(user.id).map((o) =>
        o.id === orderId ? { ...o, ...patch } : o,
      );
      writeOrders(user.id, next);
      setOrders(next);
    },
    [user],
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
