"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { formatMoney, getProduct } from "@/lib/products";
import type { Order, OrderLine } from "@/lib/commerce-types";

export default function CartPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const shop = useShop();
  const { locale } = useI18n();
  const { items, setQty, removeItem, clearCart, saveOrder } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  const lines = useMemo(
    () =>
      items
        .map((i) => {
          const product = getProduct(i.productId);
          if (!product) return null;
          return { item: i, product };
        })
        .filter(Boolean) as { item: (typeof items)[0]; product: NonNullable<ReturnType<typeof getProduct>> }[],
    [items],
  );

  const subtotal = lines.reduce(
    (sum, l) => sum + l.product.priceCents * l.item.quantity,
    0,
  );

  async function checkout() {
    if (lines.length === 0) return;
    setBusy(true);
    setError("");
    setHint("");
    const buyer = user ?? { id: "guest", email: "guest@cocktale.app", name: "Guest" };
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: buyer.id,
          email: buyer.email,
          name: buyer.name,
          items: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.item.quantity,
          })),
          successUrl: `${origin}/orders/success`,
          cancelUrl: `${origin}/cart`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.mode === "demo") {
        setHint(shop.stripeMissing);
        const orderLines: OrderLine[] = data.lineItems;
        const order: Order = {
          id: data.orderId,
          userId: buyer.id,
          createdAt: new Date().toISOString(),
          status: "paid",
          currency: "usd",
          subtotalCents: data.subtotalCents,
          totalCents: data.subtotalCents,
          items: orderLines,
          shippingEmail: buyer.email,
          shippingName: buyer.name,
          demo: true,
        };
        saveOrder(order);
        clearCart();
        router.push(`/orders/success?demo=1&orderId=${order.id}`);
        return;
      }

      // Persist a pending order before redirect
      const pending: Order = {
        id: data.orderId,
        userId: buyer.id,
        createdAt: new Date().toISOString(),
        status: "pending",
        currency: "usd",
        subtotalCents: subtotal,
        totalCents: subtotal,
        items: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          unitAmountCents: l.product.priceCents,
          quantity: l.item.quantity,
          image: l.product.images[0]?.url || "",
        })),
        stripeSessionId: data.sessionId,
        shippingEmail: buyer.email,
        shippingName: buyer.name,
      };
      saveOrder(pending);
      if (data.url) window.location.href = data.url;
      else throw new Error("Missing Stripe Checkout URL");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {shop.cartTitle}
        </h1>

        {lines.length === 0 ? (
          <div className="mt-10 rounded-[1.5rem] bg-[var(--surface)] p-10 text-center ring-1 ring-[var(--line)]">
            <p className="text-[var(--ink-soft)]">{shop.cartEmpty}</p>
            <Link
              href="/market"
              className="mt-4 inline-block rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]"
            >
              {shop.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {lines.map(({ item, product }) => (
              <div
                key={product.id}
                className="flex gap-4 rounded-[1.25rem] bg-[var(--surface)] p-4 ring-1 ring-[var(--line)]"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3efe6]">
                  <Image
                    src={product.images[0]?.url || "/cocktail-fallback.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                    unoptimized={product.images[0]?.url.startsWith("/api/")}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/market/${product.slug}`} className="font-medium text-[var(--ink)]">
                    {product.name}
                  </Link>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {formatMoney(product.priceCents, product.currency, locale)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-xs text-[var(--ink-muted)]">
                      {shop.quantity}
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={item.quantity}
                        onChange={(e) => setQty(product.id, Number(e.target.value))}
                        className="ml-2 w-16 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-xs text-[var(--accent-deep)]"
                    >
                      {shop.remove}
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {formatMoney(product.priceCents * item.quantity, "usd", locale)}
                </p>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-[1.25rem] bg-[var(--chip)] px-4 py-4">
              <span className="text-sm text-[var(--ink-soft)]">{shop.subtotal}</span>
              <span className="text-lg font-semibold text-[var(--ink)]">
                {formatMoney(subtotal, "usd", locale)}
              </span>
            </div>

            {hint && <p className="text-sm text-[var(--accent-deep)]">{hint}</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}

            <button
              type="button"
              disabled={busy}
              onClick={() => void checkout()}
              className="w-full rounded-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--foam)] disabled:opacity-60"
            >
              {busy ? shop.processing : shop.checkout}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
