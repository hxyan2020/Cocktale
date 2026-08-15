"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { useTranslatedTexts } from "@/components/useTranslatedContent";
import { formatMoney, getProduct, productImageClass, productImageUnoptimized } from "@/lib/products";
import type { Order, OrderLine } from "@/lib/commerce-types";

export default function CartPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const shop = useShop();
  const { locale } = useI18n();
  const { items, setQty, removeItem, clearCart, saveOrder } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMode, setCheckoutMode] = useState<"demo" | "stripe" | null>(null);

  useEffect(() => {
    fetch("/api/checkout")
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode === "stripe" || data?.mode === "demo") setCheckoutMode(data.mode);
      })
      .catch(() => setCheckoutMode("demo"));
  }, []);

  const lines = useMemo(
    () =>
      items
        .map((i) => {
          const product = getProduct(i.productId);
          if (!product) return null;
          return { item: i, product };
        })
        .filter(Boolean) as {
        item: (typeof items)[0];
        product: NonNullable<ReturnType<typeof getProduct>>;
      }[],
    [items],
  );

  const subtotal = lines.reduce(
    (sum, l) => sum + l.product.priceCents * l.item.quantity,
    0,
  );
  const productNames = useMemo(() => lines.map((line) => line.product.name), [lines]);
  const { texts: localizedProductNames } = useTranslatedTexts(productNames, "cart-products");
  const { texts: localizedError } = useTranslatedTexts(
    error ? [error] : [],
    "checkout-error",
  );

  async function checkout() {
    if (lines.length === 0) return;
    setBusy(true);
    setError("");
    const buyer = user ?? { id: "guest", email: "guest@cocktale.app", name: shop.guest };
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 pb-16 pt-3 sm:px-4 sm:pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--on-bg)] sm:text-3xl">
          {shop.cartTitle}
        </h1>

        {lines.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] bg-[var(--surface)] p-6 text-center ring-1 ring-[var(--line)] sm:mt-10 sm:p-10">
            <p className="text-[var(--ink-soft)]">{shop.cartEmpty}</p>
            <Link
              href="/market"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]"
            >
              {shop.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
            {lines.map(({ item, product }, lineIndex) => (
              <div
                key={product.id}
                className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 rounded-[1.25rem] bg-[var(--surface)] p-3 ring-1 ring-[var(--line)] sm:flex sm:gap-4 sm:p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f3efe6] sm:h-20 sm:w-20">
                  <Image
                    src={product.images[0]?.url || "/cocktail-fallback.svg"}
                    alt={localizedProductNames[lineIndex] || product.name}
                    fill
                    className={productImageClass(product.images[0]?.url || "", "thumb")}
                    sizes="80px"
                    unoptimized={productImageUnoptimized(product.images[0]?.url || "")}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/market/${product.slug}`} className="font-medium text-[var(--ink)]">
                    {localizedProductNames[lineIndex] || product.name}
                  </Link>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {formatMoney(product.priceCents, product.currency, locale)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                    <label className="inline-flex items-center text-xs text-[var(--ink-muted)]">
                      {shop.quantity}
                      <input
                        type="number"
                        min={1}
                        max={Math.min(20, product.stock)}
                        value={item.quantity}
                        onChange={(e) => setQty(product.id, Number(e.target.value))}
                        className="ms-2 min-h-10 w-14 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-base sm:w-16 sm:text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="min-h-10 rounded-full px-2 text-xs text-[var(--accent-deep)]"
                    >
                      {shop.remove}
                    </button>
                  </div>
                </div>
                <p className="col-start-2 text-end text-sm font-semibold text-[var(--ink)] sm:ms-auto">
                  {formatMoney(product.priceCents * item.quantity, "usd", locale)}
                </p>
              </div>
            ))}

            <div className="sticky bottom-2 z-10 space-y-2 rounded-[1.25rem] bg-[var(--surface)]/95 p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.22)] ring-1 ring-[var(--line)] backdrop-blur sm:static sm:space-y-4 sm:bg-transparent sm:p-0 sm:shadow-none sm:ring-0">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--chip)] px-4 py-3 sm:rounded-[1.25rem] sm:py-4">
                <span className="text-sm text-[var(--ink-soft)]">{shop.subtotal}</span>
                <span className="text-lg font-semibold text-[var(--ink)]">
                  {formatMoney(subtotal, "usd", locale)}
                </span>
              </div>

              {checkoutMode === "demo" && (
                <p className="px-1 text-xs text-[var(--accent-deep)] sm:text-sm sm:text-[var(--on-bg-accent)]">{shop.stripeMissing}</p>
              )}
              {error && <p className="px-1 text-xs text-red-700 sm:text-sm sm:text-red-300">{localizedError[0] || error}</p>}

              <button
                type="button"
                disabled={busy}
                onClick={() => void checkout()}
                className="min-h-12 w-full rounded-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--foam)] disabled:opacity-60"
              >
                {busy
                  ? shop.processing
                  : checkoutMode === "demo"
                    ? shop.checkoutDemo
                    : shop.checkout}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
