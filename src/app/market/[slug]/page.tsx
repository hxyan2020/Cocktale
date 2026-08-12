"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { formatMoney, getProductBySlug, productImageClass, productImageUnoptimized } from "@/lib/products";
import { getCocktail } from "@/lib/cocktails";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { ready } = useAuth();
  const shop = useShop();
  const { locale } = useI18n();
  const { addItem } = useCart();
  const product = useMemo(() => getProductBySlug(params.slug), [params.slug]);
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);

  if (!ready) return null;

  if (!product) {
    return (
      <>
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--ink-soft)]">
          Product not found.{" "}
          <Link href="/market" className="underline">
            {shop.continueShopping}
          </Link>
        </main>
      </>
    );
  }

  const related = product.relatedCocktailIds
    .map((id) => getCocktail(id))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[#f3efe6] ring-1 ring-[var(--line)]">
              <Image
                src={product.images[active]?.url || "/cocktail-fallback.svg"}
                alt={product.images[active]?.alt || product.name}
                fill
                className={productImageClass(product.images[active]?.url || "", "hero")}
                sizes="560px"
                unoptimized={productImageUnoptimized(product.images[active]?.url || "")}
                priority
              />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
              {shop.images}
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img.angle}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 ${
                    active === i ? "ring-[var(--accent)]" : "ring-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className={productImageClass(img.url, "thumb")}
                    sizes="80px"
                    unoptimized={productImageUnoptimized(img.url)}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--accent-deep)]">
                {product.subcategory}
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                {shop.brand}: {product.brand} · {shop.unit}: {product.unit}
              </p>
            </div>

            <p className="text-2xl font-semibold text-[var(--ink)]">
              {formatMoney(product.priceCents, product.currency, locale)}
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              {product.stock > 0 ? `${shop.inStock} (${product.stock})` : shop.outOfStock}
            </p>

            <p className="text-[15px] leading-relaxed text-[var(--ink-soft)]">
              {product.longDescription}
            </p>

            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => {
                addItem(product.id, 1);
                setAdded(true);
                setTimeout(() => setAdded(false), 1200);
              }}
              className="w-full rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--foam)] disabled:opacity-40 sm:w-auto sm:px-8"
            >
              {added ? shop.added : shop.addToCart}
            </button>

            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)]">{shop.specs}</h2>
              <ul className="mt-2 divide-y divide-[var(--line)] rounded-2xl bg-[var(--surface)] ring-1 ring-[var(--line)]">
                {product.specs.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="text-[var(--ink-muted)]">{s.label}</span>
                    <span className="text-end text-[var(--ink)]">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {related.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)]">{shop.related}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {related.map((c) =>
                    c ? (
                      <li
                        key={c.id}
                        className="rounded-full bg-[var(--chip)] px-3 py-1 text-xs text-[var(--ink-soft)]"
                      >
                        {c.name}
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
