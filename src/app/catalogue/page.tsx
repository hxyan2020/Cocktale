"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { CocktailDetail } from "@/components/CocktailDetail";
import { TriedModal } from "@/components/TriedModal";
import { cocktailCategories, searchCocktails } from "@/lib/cocktails";
import { maybeAdvanceRankOffset, getRankOffset, rotateRanked } from "@/lib/rank-rotation";
import type { Cocktail, WeatherBucket } from "@/lib/types";

const SHIFT_PER_VISIT = 36;

export default function CataloguePage() {
  const { user, ready, data, collect, markTried, isCollected, requireAuth } = useAuth();
  const { t } = useI18n();
  const accountId = user?.id ?? "guest";
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Cocktail | null>(null);
  const [triedOpen, setTriedOpen] = useState(false);
  const [ranked, setRanked] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitOffset, setVisitOffset] = useState(0);
  const shifted = useRef(false);

  useEffect(() => {
    setVisitOffset(getRankOffset(accountId, "catalogue"));
    shifted.current = false;
  }, [accountId]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      let lat: number | undefined;
      let lon: number | undefined;
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            () => resolve(null),
            { timeout: 4000 },
          );
        });
        lat = pos?.coords.latitude;
        lon = pos?.coords.longitude;
      }

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: data.history,
          moodPreference: data.moodPreference,
          lat,
          lon,
          cursor: 0,
          limit: 500,
        }),
      });
      const json = (await res.json()) as {
        cocktails: Cocktail[];
        weather?: { bucket: WeatherBucket };
      };
      if (cancelled) return;
      setRanked(json.cocktails ?? []);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
    // Rank once per visit; history updates from opening cards shouldn't reshuffle the grid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, accountId, data.moodPreference]);

  useEffect(() => {
    if (shifted.current || ranked.length === 0) return;
    shifted.current = true;
    maybeAdvanceRankOffset(accountId, "catalogue", SHIFT_PER_VISIT, ranked.length);
  }, [accountId, ranked.length]);

  const categories = useMemo(() => cocktailCategories(), []);

  const list = useMemo(() => {
    const filtered =
      q.trim() || category !== "all"
        ? searchCocktails(q, category)
        : ranked.length
          ? ranked
          : searchCocktails(q, category);

    if (q.trim() || category !== "all") {
      const order = new Map(ranked.map((c, i) => [c.id, i]));
      return [...filtered].sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999));
    }

    return rotateRanked(filtered, visitOffset);
  }, [q, category, ranked, visitOffset]);

  if (!ready) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pb-16 pt-4 sm:px-4 sm:pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
          {t("catalogue.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)] sm:text-base">
          {t("catalogue.subtitle")}
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("catalogue.searchPlaceholder")}
            className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2.5 pe-4 ps-10 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="-mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              category === "all"
                ? "bg-[var(--ink)] text-[var(--foam)]"
                : "bg-[var(--chip)] text-[var(--ink-soft)]"
            }`}
          >
            {t("catalogue.all")}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                category === c
                  ? "bg-[var(--ink)] text-[var(--foam)]"
                  : "bg-[var(--chip)] text-[var(--ink-soft)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          {loading ? t("feed.shaking") : t("catalogue.count", { n: list.length })}
        </p>

        {loading ? (
          <div className="mt-10 rounded-[1.5rem] bg-[var(--surface)] p-10 text-center ring-1 ring-[var(--line)]">
            <p className="text-[var(--ink-soft)]">{t("feed.shaking")}</p>
          </div>
        ) : list.length === 0 ? (
          <div className="mt-10 rounded-[1.5rem] bg-[var(--surface)] p-10 text-center ring-1 ring-[var(--line)]">
            <p className="text-[var(--ink-soft)]">{t("catalogue.empty")}</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {list.map((cocktail) => (
              <button
                key={cocktail.id}
                type="button"
                onClick={() => setSelected(cocktail)}
                className="overflow-hidden rounded-[1.15rem] bg-[var(--surface)] text-left ring-1 ring-[var(--line)] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-32 w-full sm:h-40">
                  <Image
                    src={cocktail.image || "/cocktail-fallback.svg"}
                    alt={cocktail.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 240px"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="line-clamp-2 font-[family-name:var(--font-display)] text-base leading-tight text-[var(--ink)] sm:text-lg">
                    {cocktail.name}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-[11px] text-[var(--ink-muted)] sm:text-xs">
                    {cocktail.category}
                    {cocktail.origin ? ` · ${cocktail.origin}` : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <CocktailDetail
          cocktail={selected}
          collected={isCollected(selected.id)}
          onClose={() => setSelected(null)}
          onCollect={() => collect(selected.id)}
          onTried={() => requireAuth(() => setTriedOpen(true))}
        />
      )}

      {triedOpen && selected && (
        <TriedModal
          cocktail={selected}
          onClose={() => setTriedOpen(false)}
          onSave={(triedAt, note) => {
            markTried(selected.id, triedAt, note);
            setTriedOpen(false);
          }}
        />
      )}
    </>
  );
}
