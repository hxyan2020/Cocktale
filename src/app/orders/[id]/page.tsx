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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { ready } = useAuth();
  const shop = useShop();
  const { locale } = useI18n();
  const { getOrder } = useCart();
  const order = getOrder(params.id);

  if (!ready) return null;

  if (!order) {
    return (
      <>
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--ink-soft)]">
          Order not found.{" "}
          <Link href="/orders" className="underline">
            {shop.orders}
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <p className="text-xs uppercase tracking-wide text-[var(--accent-deep)]">{shop.orders}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {order.id}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {new Date(order.createdAt).toLocaleString(locale)} · {shop.orderStatus}:{" "}
          <span className="capitalize text-[var(--ink)]">{order.status}</span>
          {order.demo ? " · demo" : ""}
        </p>
        {order.shippingEmail && (
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {order.shippingName} · {order.shippingEmail}
          </p>
        )}
        {order.stripeSessionId && (
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Stripe session: {order.stripeSessionId}
          </p>
        )}

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

        <div className="mt-6 flex justify-between rounded-[1.25rem] bg-[var(--chip)] px-4 py-4">
          <span>{shop.orderTotal}</span>
          <span className="font-semibold">
            {formatMoney(order.totalCents, order.currency, locale)}
          </span>
        </div>
      </main>
    </>
  );
}
