"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useShop } from "@/components/useShop";
import type { Order } from "@/lib/commerce-types";

export default function OrderSuccessClient() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const shop = useShop();
  const search = useSearchParams();
  const { clearCart, saveOrder, updateOrder, getOrder, orders } = useCart();
  const ran = useRef(false);

  const sessionId = search.get("session_id");
  const demo = search.get("demo") === "1";
  const orderId = search.get("orderId");

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user || ran.current) return;

    async function finalize() {
      if (demo && orderId) {
        ran.current = true;
        return;
      }
      if (!sessionId) return;
      ran.current = true;

      try {
        const res = await fetch(`/api/checkout/session?session_id=${sessionId}`);
        const data = await res.json();
        if (!res.ok) return;

        const existing =
          orders.find((o) => o.stripeSessionId === sessionId) ||
          (data.metadata?.orderDraftId
            ? getOrder(data.metadata.orderDraftId)
            : undefined);

        if (existing) {
          updateOrder(existing.id, {
            status: data.paymentStatus === "paid" ? "paid" : existing.status,
            stripeSessionId: sessionId,
            stripePaymentIntentId: data.paymentIntentId,
            totalCents: data.amountTotal ?? existing.totalCents,
            subtotalCents: data.amountTotal ?? existing.subtotalCents,
            shippingEmail: data.customerEmail || existing.shippingEmail,
            shippingName: data.customerName || existing.shippingName,
          });
        } else {
          const order: Order = {
            id: data.metadata?.orderDraftId || `ord_${Date.now().toString(36)}`,
            userId: user!.id,
            createdAt: new Date().toISOString(),
            status: data.paymentStatus === "paid" ? "paid" : "pending",
            currency: "usd",
            subtotalCents: data.amountTotal || 0,
            totalCents: data.amountTotal || 0,
            items: (data.lineItems || []).map(
              (li: { name: string; quantity: number; amountTotal: number }) => ({
                productId: "stripe-line",
                name: li.name || "Item",
                unitAmountCents: li.quantity
                  ? Math.round((li.amountTotal || 0) / li.quantity)
                  : 0,
                quantity: li.quantity || 1,
                image: "",
              }),
            ),
            stripeSessionId: sessionId,
            stripePaymentIntentId: data.paymentIntentId,
            shippingEmail: data.customerEmail,
            shippingName: data.customerName,
          };
          saveOrder(order);
        }
        clearCart();
      } catch {
        // soft-fail offline
      }
    }

    void finalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionId, demo, orderId]);

  if (!ready || !user) return null;

  const linked =
    (orderId && getOrder(orderId)) ||
    (sessionId && orders.find((o) => o.stripeSessionId === sessionId)) ||
    orders[0];

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          {shop.successTitle}
        </h1>
        <p className="mt-3 text-[var(--ink-soft)]">{shop.successBody}</p>
        {demo && <p className="mt-3 text-sm text-[var(--accent-deep)]">{shop.demoPaid}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {linked && (
            <Link
              href={`/orders/${linked.id}`}
              className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm text-[var(--foam)]"
            >
              {shop.viewOrder}
            </Link>
          )}
          <Link
            href="/orders"
            className="rounded-full bg-[var(--chip)] px-5 py-2.5 text-sm text-[var(--ink)]"
          >
            {shop.orders}
          </Link>
          <Link
            href="/market"
            className="rounded-full bg-[var(--chip)] px-5 py-2.5 text-sm text-[var(--ink)]"
          >
            {shop.continueShopping}
          </Link>
        </div>
      </main>
    </>
  );
}
