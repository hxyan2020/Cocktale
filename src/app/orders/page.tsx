"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { formatMoney } from "@/lib/products";

export default function OrdersPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const shop = useShop();
  const { locale } = useI18n();
  const { orders } = useCart();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {shop.ordersTitle}
        </h1>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-[1.5rem] bg-[var(--surface)] p-10 text-center ring-1 ring-[var(--line)]">
            <p className="text-[var(--ink-soft)]">{shop.ordersEmpty}</p>
            <Link
              href="/market"
              className="mt-4 inline-block rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]"
            >
              {shop.continueShopping}
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-[1.25rem] bg-[var(--surface)] p-4 ring-1 ring-[var(--line)] transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[var(--ink)]">{order.id}</p>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {new Date(order.createdAt).toLocaleString(locale)}
                        {order.demo ? " · demo" : ""}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {formatMoney(order.totalCents, order.currency, locale)}
                      </p>
                      <p className="text-xs capitalize text-[var(--accent-deep)]">
                        {shop.orderStatus}: {order.status}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[var(--ink-soft)]">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(" · ")}
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
