"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { formatMoney } from "@/lib/products";
import type { OrderStatus } from "@/lib/commerce-types";

function trackingSteps(status: OrderStatus, shop: ReturnType<typeof useShop>) {
  const paid = status === "paid" || status === "fulfilled";
  const preparing = status === "paid" || status === "fulfilled";
  const fulfilled = status === "fulfilled";
  return [
    { label: shop.trackPlaced, done: true },
    {
      label: status === "pending" ? shop.trackPending : shop.trackPaid,
      done: paid,
    },
    { label: shop.trackPreparing, done: preparing },
    { label: shop.trackFulfilled, done: fulfilled },
  ];
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { ready } = useAuth();
  const shop = useShop();
  const { locale } = useI18n();
  const { getOrder, hydrated } = useCart();
  const order = getOrder(params.id);

  if (!ready || !hydrated) return null;

  if (!order) {
    return (
      <>
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--on-bg-soft)]">
          Order not found.{" "}
          <Link href="/orders" className="underline text-[var(--on-bg)]">
            {shop.orders}
          </Link>
        </main>
      </>
    );
  }

  const steps = trackingSteps(order.status, shop);

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <p className="text-xs uppercase tracking-wide text-[var(--on-bg-accent)]">{shop.orders}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--on-bg)]">
          {order.id}
        </h1>
        <p className="mt-2 text-sm text-[var(--on-bg-muted)]">
          {new Date(order.createdAt).toLocaleString(locale)} · {shop.orderStatus}:{" "}
          <span className="capitalize text-[var(--on-bg)]">{order.status}</span>
          {order.demo ? " · demo" : ""}
        </p>
        {order.shippingEmail && (
          <p className="mt-1 text-sm text-[var(--on-bg-soft)]">
            {order.shippingName} · {order.shippingEmail}
          </p>
        )}
        {order.stripeSessionId && (
          <p className="mt-1 text-xs text-[var(--on-bg-muted)]">
            Stripe session: {order.stripeSessionId}
          </p>
        )}

        <section className="mt-8 rounded-[1.5rem] bg-[var(--surface)] p-5 ring-1 ring-[var(--line)]">
          <h2 className="text-sm font-semibold text-[var(--ink)]">{shop.trackTitle}</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={step.label} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step.done
                      ? "bg-[var(--ink)] text-[var(--foam)]"
                      : "bg-[var(--chip)] text-[var(--ink-muted)]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className={step.done ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <ul className="mt-8 space-y-3">
          {order.items.map((item) => (
            <li
              key={`${item.productId}-${item.name}`}
              className="flex gap-3 rounded-[1.25rem] bg-[var(--surface)] p-3 ring-1 ring-[var(--line)]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f3efe6]">
                <Image
                  src={item.image || "/cocktail-fallback.svg"}
                  alt={item.name}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                  unoptimized={item.image?.startsWith("/api/")}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--ink)]">{item.name}</p>
                <p className="text-xs text-[var(--ink-muted)]">
                  {item.quantity} × {formatMoney(item.unitAmountCents, "usd", locale)}
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {formatMoney(item.unitAmountCents * item.quantity, "usd", locale)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between rounded-[1.25rem] bg-[var(--chip)] px-4 py-4 text-[var(--ink)]">
          <span>{shop.orderTotal}</span>
          <span className="font-semibold">
            {formatMoney(order.totalCents, order.currency, locale)}
          </span>
        </div>
      </main>
    </>
  );
}
