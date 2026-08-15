"use client";

import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { useTranslatedTexts } from "@/components/useTranslatedContent";

export default function OrdersPage() {
  const { ready } = useAuth();
  const shop = useShop();
  const { locale } = useI18n();
  const { format: formatMoney } = useCurrency();
  const { orders, hydrated } = useCart();
  const itemNames = orders.flatMap((order) => order.items.map((item) => item.name));
  const { texts: localizedItemNames } = useTranslatedTexts(itemNames, "order-list-items");
  let itemNameIndex = 0;

  const statusLabel = (status: (typeof orders)[number]["status"]) => {
    if (status === "pending") return shop.trackPending;
    if (status === "paid") return shop.trackPaid;
    if (status === "fulfilled") return shop.trackFulfilled;
    if (status === "cancelled") return shop.trackCancelled;
    if (status === "refunded") return shop.trackRefunded;
    return status;
  };

  if (!ready || !hydrated) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 pb-16 pt-3 sm:px-4 sm:pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--on-bg)] sm:text-3xl">
          {shop.ordersTitle}
        </h1>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] bg-[var(--surface)] p-6 text-center ring-1 ring-[var(--line)] sm:mt-10 sm:p-10">
            <p className="text-[var(--ink-soft)]">{shop.ordersEmpty}</p>
            <Link
              href="/market"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]"
            >
              {shop.continueShopping}
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3 sm:mt-8">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-[1.25rem] bg-[var(--surface)] p-3 ring-1 ring-[var(--line)] transition hover:shadow-md sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all font-medium text-[var(--ink)]">{order.id}</p>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {new Date(order.createdAt).toLocaleString(locale)}
                        {order.demo ? ` · ${shop.demoLabel}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {formatMoney(order.totalCents)}
                      </p>
                      <p className="text-xs capitalize text-[var(--accent-deep)]">
                        {shop.orderStatus}: {statusLabel(order.status)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--ink-soft)]">
                    {order.items
                      .map((i) => `${localizedItemNames[itemNameIndex++] || i.name} ×${i.quantity}`)
                      .join(" · ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
