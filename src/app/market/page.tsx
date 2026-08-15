"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { useLocalizedProduct } from "@/components/useTranslatedContent";
import { formatMoney, productImageClass, productImageUnoptimized, searchProducts } from "@/lib/products";
import type { Product } from "@/lib/commerce-types";

const CATEGORIES = ["all", "ingredient", "utensil", "glassware", "accessory"] as const;

function ProductCard({
  product,
  added,
  onAdd,
  addLabel,
  addedLabel,
  locale,
}: {
  product: Product;
  added: boolean;
  onAdd: () => void;
  addLabel: string;
  addedLabel: string;
  locale: string;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const localized = useLocalizedProduct(product, visible) ?? product;

  useEffect(() => {
    const node = cardRef.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <article
      ref={cardRef}
      className="flex flex-col overflow-hidden rounded-[1.25rem] bg-[var(--surface)] ring-1 ring-[var(--line)]"
    >
      <Link href={`/market/${product.slug}`} className="relative block aspect-square">
        <Image
          src={product.images[0]?.url || "/cocktail-fallback.svg"}
          alt={localized.name}
          fill
          className={productImageClass(product.images[0]?.url || "")}
          sizes="260px"
          unoptimized={productImageUnoptimized(product.images[0]?.url || "")}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
          {localized.subcategory}
        </p>
        <Link
          href={`/market/${product.slug}`}
          className="font-[family-name:var(--font-display)] text-lg leading-snug text-[var(--ink)]"
        >
          {localized.name}
        </Link>
        <p className="line-clamp-2 text-xs text-[var(--ink-soft)]">{localized.description}</p>
        <p className="mt-auto text-sm font-semibold text-[var(--ink)]">
          {formatMoney(product.priceCents, product.currency, locale)}
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-[var(--ink)] px-3 py-2 text-xs font-medium text-[var(--foam)]"
        >
          {added ? addedLabel : addLabel}
        </button>
      </div>
    </article>
  );
}

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
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--on-bg)]">
          {shop.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--on-bg-soft)]">{shop.subtitle}</p>

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

        <p className="mt-4 text-xs text-[var(--on-bg-muted)]">
          {shop.productCount.replace("{n}", String(list.length))}
        </p>

        <div
          key={category}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              added={addedId === p.id}
              addLabel={shop.addToCart}
              addedLabel={shop.added}
              locale={locale}
              onAdd={() => {
                addItem(p.id, 1);
                setAddedId(p.id);
                setTimeout(() => setAddedId(null), 1200);
              }}
            />
          ))}
        </div>
      </main>
    </>
  );
}
