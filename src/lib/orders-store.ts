import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  ShippingAddress,
} from "@/lib/commerce-types";

const RELATIVE_PATHS = ["data/orders.json"];

type OrdersFile = { orders: Order[] };

let cache: OrdersFile | null = null;

function filePaths() {
  return RELATIVE_PATHS.map((rel) => join(process.cwd(), rel));
}

function emptyStore(): OrdersFile {
  return { orders: [] };
}

function loadStore(): OrdersFile {
  if (cache) return cache;
  for (const file of filePaths()) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as OrdersFile;
      if (parsed && Array.isArray(parsed.orders)) {
        cache = parsed;
        return cache;
      }
    } catch {
      // try next
    }
  }
  cache = emptyStore();
  return cache;
}

function saveStore(next: OrdersFile) {
  cache = next;
  const json = `${JSON.stringify(next, null, 2)}\n`;
  for (const file of filePaths()) {
    try {
      mkdirSync(join(file, ".."), { recursive: true });
      writeFileSync(file, json);
    } catch {
      // Vercel / read-only: keep in-memory for this instance.
    }
  }
}

export function listOrders(filters?: {
  q?: string;
  status?: OrderStatus | "all";
  userId?: string;
}): Order[] {
  let orders = [...loadStore().orders];
  if (filters?.userId) {
    orders = orders.filter((o) => o.userId === filters.userId);
  }
  if (filters?.status && filters.status !== "all") {
    orders = orders.filter((o) => o.status === filters.status);
  }
  if (filters?.q) {
    const q = filters.q.trim().toLowerCase();
    orders = orders.filter((o) => {
      const hay = [
        o.id,
        o.userId,
        o.shippingEmail,
        o.shippingName,
        o.trackingNumber,
        o.carrier,
        o.stripeSessionId,
        o.stripePaymentIntentId,
        ...o.items.map((i) => i.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getOrderById(id: string): Order | undefined {
  return loadStore().orders.find((o) => o.id === id);
}

export function getOrderByStripeSession(sessionId: string): Order | undefined {
  return loadStore().orders.find((o) => o.stripeSessionId === sessionId);
}

export function upsertOrder(order: Order): Order {
  const store = structuredClone(loadStore());
  const now = new Date().toISOString();
  const next: Order = { ...order, updatedAt: now };
  const idx = store.orders.findIndex((o) => o.id === next.id);
  if (idx >= 0) store.orders[idx] = { ...store.orders[idx], ...next, updatedAt: now };
  else store.orders.unshift(next);
  saveStore(store);
  return getOrderById(next.id)!;
}

export type OrderPatch = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingName?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: ShippingAddress | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  notes?: string | null;
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  subtotalCents?: number;
  totalCents?: number;
};

export function patchOrder(id: string, patch: OrderPatch): Order | null {
  const store = structuredClone(loadStore());
  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  const current = store.orders[idx];
  const next: Order = { ...current, updatedAt: new Date().toISOString() };

  if (patch.status !== undefined) next.status = patch.status;
  if (patch.paymentStatus !== undefined) next.paymentStatus = patch.paymentStatus;
  if (patch.shippingName !== undefined) next.shippingName = patch.shippingName;
  if (patch.shippingEmail !== undefined) next.shippingEmail = patch.shippingEmail;
  if (patch.shippingPhone !== undefined) next.shippingPhone = patch.shippingPhone;
  if (patch.stripeSessionId !== undefined) next.stripeSessionId = patch.stripeSessionId;
  if (patch.stripePaymentIntentId !== undefined) {
    next.stripePaymentIntentId = patch.stripePaymentIntentId;
  }
  if (patch.subtotalCents !== undefined) next.subtotalCents = patch.subtotalCents;
  if (patch.totalCents !== undefined) next.totalCents = patch.totalCents;

  if (Object.prototype.hasOwnProperty.call(patch, "shippingAddress")) {
    next.shippingAddress = patch.shippingAddress || undefined;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "carrier")) {
    next.carrier = patch.carrier || undefined;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "trackingNumber")) {
    next.trackingNumber = patch.trackingNumber || undefined;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "shippedAt")) {
    next.shippedAt = patch.shippedAt || undefined;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "notes")) {
    next.notes = patch.notes || undefined;
  }

  // Auto-set shippedAt when moving to fulfilled with tracking.
  if (patch.status === "fulfilled" && !next.shippedAt) {
    next.shippedAt = new Date().toISOString();
  }
  if (patch.status === "paid" && !next.paymentStatus) {
    next.paymentStatus = "paid";
  }
  if (patch.status === "refunded") {
    next.paymentStatus = "refunded";
  }

  store.orders[idx] = next;
  saveStore(store);
  return next;
}

export function createPendingOrder(input: Omit<Order, "updatedAt">): Order {
  return upsertOrder({
    ...input,
    paymentStatus: input.paymentStatus || (input.status === "paid" ? "paid" : "unpaid"),
  });
}
