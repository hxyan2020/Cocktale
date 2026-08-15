"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { formatMoney, productImageClass, productImageUnoptimized, searchProducts } from "@/lib/products";

const CATEGORIES = ["all", "ingredient", "utensil", "glassware", "accessory"] as const;

export default function MarketPage() {
  const { ready } = useAuth();
  const shop = useShop();
  const { locale } = useI18n();
  const { addItem } = useCart();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  const list = useMemo(() => searchProducts(q, category), [q, category]);

  const catLabel = (c: string) => {
    if (c === "all") return shop.all;
    if (c === "ingredient") return shop.ingredients;
    if (c === "utensil") return shop.utensils;
    if (c === "glassware") return shop.glassware;
    return shop.accessories;
  };

  if (!ready) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {shop.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">{shop.subtitle}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={shop.searchPlaceholder}
            className="w-full flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  category === c
                    ? "bg-[var(--ink)] text-[var(--foam)]"
                    : "bg-[var(--chip)] text-[var(--ink-soft)]"
                }`}
              >
                {catLabel(c)}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--ink-muted)]">{list.length} products</p>

        <div
          key={category}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {list.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-[1.25rem] bg-[var(--surface)] ring-1 ring-[var(--line)]"
            >
              <Link href={`/market/${p.slug}`} className="relative block aspect-square">
                <Image
                  src={p.images[0]?.url || "/cocktail-fallback.svg"}
                  alt={p.images[0]?.alt || p.name}
                  fill
                  className={productImageClass(p.images[0]?.url || "")}
                  sizes="260px"
                  unoptimized={productImageUnoptimized(p.images[0]?.url || "")}
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
                  {p.subcategory}
                </p>
                <Link
                  href={`/market/${p.slug}`}
                  className="font-[family-name:var(--font-display)] text-lg leading-snug text-[var(--ink)]"
                >
                  {p.name}
                </Link>
                <p className="line-clamp-2 text-xs text-[var(--ink-soft)]">{p.description}</p>
                <p className="mt-auto text-sm font-semibold text-[var(--ink)]">
                  {formatMoney(p.priceCents, p.currency, locale)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    addItem(p.id, 1);
                    setAddedId(p.id);
                    setTimeout(() => setAddedId(null), 1200);
                  }}
                  className="rounded-full bg-[var(--ink)] px-3 py-2 text-xs font-medium text-[var(--foam)]"
                >
                  {addedId === p.id ? shop.added : shop.addToCart}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
