"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import { ArrowLeft, LoaderCircle, Save, Search } from "lucide-react";
import type { MarketLocation } from "@/lib/market-locations";
import { formatLocalMoneyAmount } from "@/lib/product-price-types";
import type { CurrencyCode } from "@/lib/currency";
import { productImageClass, productImageUnoptimized } from "@/lib/products";

type LocationPrice = { amountCents: number; currency: CurrencyCode };

type AdminProduct = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  unit: string;
  catalogUsdCents: number;
  resolvedUsdCents: number;
  image: string;
  prices: Record<string, LocationPrice>;
};

function majorFromCents(amountCents: number, currency: CurrencyCode) {
  if (currency === "JPY" || currency === "KRW" || currency === "VND") return String(amountCents);
  return (amountCents / 100).toFixed(2);
}

function centsFromMajor(raw: string, currency: CurrencyCode) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  if (currency === "JPY" || currency === "KRW" || currency === "VND") return Math.round(n);
  return Math.round(n * 100);
}

export default function AdminPricesPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [locations, setLocations] = useState<MarketLocation[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load products");
      setProducts(data.products || []);
      setLocations(data.locations || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) || null,
    [products, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    const next: Record<string, string> = {};
    for (const loc of locations) {
      const row = selected.prices[loc.code];
      next[loc.code] = row ? majorFromCents(row.amountCents, row.currency) : "0";
    }
    setDraft(next);
    setStatus("");
  }, [selected, locations]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setStatus("");
    try {
      const prices: Record<string, { amountCents: number }> = {};
      for (const loc of locations) {
        const cents = centsFromMajor(draft[loc.code] ?? "0", loc.currency);
        if (cents === null) throw new Error(`Invalid ${loc.shortLabel} price`);
        prices[loc.code] = { amountCents: cents };
      }
      const res = await fetch(`/api/admin/products/${selected.id}/prices`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setStatus("Prices saved.");
      await load(query);
      setSelectedId(selected.id);
      window.dispatchEvent(new Event("cocktale:product-prices-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminAuthGate>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Product prices
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)]">
              Shelf prices for Singapore, Hong Kong, Shanghai, New York, Paris, and Tokyo
              (Numbeo-calibrated retail indices + 10% markup). Edit any city amount and save.
            </p>
          </div>
        </div>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load(query);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]"
          >
            Search
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[1.25rem] bg-[var(--surface)] ring-1 ring-[var(--line)]">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="sticky top-0 bg-[var(--surface)] text-[10px] tracking-wide text-[var(--ink-muted)] uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">Product</th>
                    {locations.map((loc) => (
                      <th key={loc.code} className="px-2 py-2 font-medium whitespace-nowrap">
                        {loc.shortLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={1 + locations.length} className="px-3 py-8 text-[var(--ink-soft)]">
                        <span className="inline-flex items-center gap-2">
                          <LoaderCircle className="h-4 w-4 animate-spin" /> Loading…
                        </span>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() => setSelectedId(product.id)}
                        className={`cursor-pointer border-t border-[var(--line)] ${
                          selectedId === product.id ? "bg-[var(--chip)]" : "hover:bg-[var(--chip)]/60"
                        }`}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-[var(--chip)]">
                              <Image
                                src={product.image}
                                alt=""
                                fill
                                className={productImageClass(product.image, "thumb")}
                                sizes="32px"
                                unoptimized={productImageUnoptimized(product.image)}
                              />
                            </span>
                            <span>
                              <span className="block max-w-[160px] truncate font-medium text-[var(--ink)]">
                                {product.name}
                              </span>
                              <span className="text-[10px] text-[var(--ink-muted)]">
                                {product.subcategory}
                              </span>
                            </span>
                          </div>
                        </td>
                        {locations.map((loc) => {
                          const row = product.prices[loc.code];
                          return (
                            <td key={loc.code} className="px-2 py-2 whitespace-nowrap text-[var(--ink)]">
                              {row
                                ? formatLocalMoneyAmount(row.amountCents, row.currency)
                                : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[1.25rem] bg-[var(--surface)] p-5 ring-1 ring-[var(--line)]">
            {selected ? (
              <>
                <p className="text-xs tracking-[0.14em] text-[var(--accent-deep)] uppercase">
                  Edit prices
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  {selected.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {selected.unit} · catalog base ${(selected.catalogUsdCents / 100).toFixed(2)} USD
                </p>

                <div className="mt-5 space-y-3">
                  {locations.map((loc) => (
                    <label key={loc.code} className="block">
                      <span className="text-xs font-medium text-[var(--ink-muted)]">
                        {loc.label} ({loc.currency})
                      </span>
                      <input
                        value={draft[loc.code] ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, [loc.code]: e.target.value }))
                        }
                        inputMode="decimal"
                        className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save()}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm text-[var(--foam)] disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save prices
                </button>
                {status ? <p className="mt-3 text-sm text-[var(--ink-soft)]">{status}</p> : null}
              </>
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">
                Select a product to review or change city prices.
              </p>
            )}
          </div>
        </div>
      </main>
    </AdminAuthGate>
  );
}
