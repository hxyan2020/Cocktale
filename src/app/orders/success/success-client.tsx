"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useShop } from "@/components/useShop";
import type { Order } from "@/lib/commerce-types";

type Phase = "loading" | "confirming" | "confirmed" | "missing" | "failed";

export default function OrderSuccessClient() {
  const { user, ready } = useAuth();
  const shop = useShop();
  const search = useSearchParams();
  const {
    clearCart,
    saveOrder,
    updateOrder,
    getOrder,
    findOrderBySession,
    hydrated,
  } = useCart();

  const sessionId = search.get("session_id");
  const demo = search.get("demo") === "1";
  const orderId = search.get("orderId");

  const [phase, setPhase] = useState<Phase>("loading");
  const [linkedId, setLinkedId] = useState<string | null>(orderId);

  useEffect(() => {
    if (!ready || !hydrated) return;

    let cancelled = false;

    async function finalize() {
      if (demo && orderId) {
        const existing = getOrder(orderId);
        if (!cancelled) {
          setLinkedId(existing?.id || orderId);
          setPhase("confirmed");
        }
        return;
      }

      if (!sessionId) {
        if (!cancelled) setPhase("missing");
        return;
      }

      if (!cancelled) setPhase("confirming");

      try {
        const res = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setPhase("failed");
          return;
        }

        const paid = data.paymentStatus === "paid";
        const draftId = data.metadata?.orderDraftId as string | undefined;
        const existing =
          findOrderBySession(sessionId) || (draftId ? getOrder(draftId) : undefined);

        let finalId = existing?.id || draftId || `ord_${Date.now().toString(36)}`;

        if (existing) {
          updateOrder(existing.id, {
            status: paid ? "paid" : existing.status,
            stripeSessionId: sessionId,
            stripePaymentIntentId: data.paymentIntentId,
            totalCents: data.amountTotal ?? existing.totalCents,
            subtotalCents: data.amountTotal ?? existing.subtotalCents,
            shippingEmail: data.customerEmail || existing.shippingEmail,
            shippingName: data.customerName || existing.shippingName,
          });
          finalId = existing.id;
        } else {
          const order: Order = {
            id: finalId,
            userId: user?.id ?? "guest",
            createdAt: new Date().toISOString(),
            status: paid ? "paid" : "pending",
            currency: "usd",
            subtotalCents: data.amountTotal || 0,
            totalCents: data.amountTotal || 0,
            items: (data.lineItems || []).map(
              (li: {
                name: string;
                quantity: number;
                amountTotal: number;
                productId?: string;
              }) => ({
                productId: li.productId || "stripe-line",
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

        if (paid) clearCart();
        if (!cancelled) {
          setLinkedId(finalId);
          setPhase(paid ? "confirmed" : "failed");
        }
      } catch {
        if (!cancelled) setPhase("failed");
      }
    }

    void finalize();
    return () => {
      cancelled = true;
    };
  }, [
    ready,
    hydrated,
    user?.id,
    sessionId,
    demo,
    orderId,
    clearCart,
    findOrderBySession,
    getOrder,
    saveOrder,
    updateOrder,
  ]);

  if (!ready || !hydrated) return null;

  const title =
    phase === "confirmed"
      ? shop.successTitle
      : phase === "confirming" || phase === "loading"
        ? shop.successPending
        : phase === "missing"
          ? shop.successMissing
          : shop.successFailed;

  const body =
    phase === "confirmed"
      ? shop.successBody
      : phase === "confirming" || phase === "loading"
        ? shop.successPending
        : phase === "missing"
          ? shop.successMissing
          : shop.successFailed;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--on-bg)]">
          {title}
        </h1>
        <p className="mt-3 text-[var(--on-bg-soft)]">{body}</p>
        {demo && phase === "confirmed" && (
          <p className="mt-3 text-sm text-[var(--on-bg-accent)]">{shop.demoPaid}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {phase === "confirmed" && linkedId && (
            <Link
              href={`/orders/${linkedId}`}
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
            href={phase === "failed" || phase === "missing" ? "/cart" : "/market"}
            className="rounded-full bg-[var(--chip)] px-5 py-2.5 text-sm text-[var(--ink)]"
          >
            {phase === "failed" || phase === "missing" ? shop.cart : shop.continueShopping}
          </Link>
        </div>
      </main>
    </>
  );
}
