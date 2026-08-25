"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { CocktailDetail } from "@/components/CocktailDetail";
import { TriedModal } from "@/components/TriedModal";
import { useLocalizedCocktail, useTranslatedTexts } from "@/components/useTranslatedContent";
import { useCocktailImage } from "@/components/CocktailImageProvider";
import { useCocktailCatalog } from "@/components/CocktailCatalogProvider";
import {
  readCachedCoords,
  readGeolocationPermission,
  writeCachedCoords,
} from "@/lib/location-permission";
import { maybeAdvanceRankOffset, getRankOffset, rotateRanked } from "@/lib/rank-rotation";
import type { Cocktail, WeatherBucket } from "@/lib/types";

const SHIFT_PER_VISIT = 36;

const COUNTRY_FLAGS = [
  ["United Kingdom", "🇬🇧"],
  ["United States", "🇺🇸"],
  ["Bahamas", "🇧🇸"],
  ["Belgium", "🇧🇪"],
  ["Bermuda", "🇧🇲"],
  ["Brazil", "🇧🇷"],
  ["Canada", "🇨🇦"],
  ["Chile", "🇨🇱"],
  ["Cuba", "🇨🇺"],
  ["France", "🇫🇷"],
  ["Ireland", "🇮🇪"],
  ["Italy", "🇮🇹"],
  ["Jamaica", "🇯🇲"],
  ["Mexico", "🇲🇽"],
  ["Peru", "🇵🇪"],
  ["Scotland", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
] as const;

function formatOrigin(origin: string) {
  return COUNTRY_FLAGS.reduce(
    (formatted, [country, flag]) => formatted.replaceAll(country, flag),
    origin,
  );
}

function CatalogueCard({
  cocktail,
  onSelect,
}: {
  cocktail: Cocktail;
  onSelect: (cocktail: Cocktail) => void;
}) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);
  const withFlags = useMemo(
    () => ({ ...cocktail, origin: formatOrigin(cocktail.origin) }),
    [cocktail],
  );
  const localized = useLocalizedCocktail(withFlags, visible);
  const imageSrc = useCocktailImage(cocktail);

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
    <button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(cocktail)}
      className="flex h-full min-h-52 flex-col overflow-hidden rounded-[1.15rem] bg-[var(--surface)] text-left ring-1 ring-[var(--line)] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-28 w-full bg-[#ebe8e0] min-[380px]:h-32 sm:h-40">
        <Image
          src={imageSrc}
          alt={localized.name}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 50vw, 240px"
        />
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h2 className="line-clamp-2 font-[family-name:var(--font-display)] text-base leading-tight text-[var(--ink)] sm:text-lg">
          {localized.name}
        </h2>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--ink-soft)] sm:text-sm">
          {localized.description}
        </p>
        <p className="mt-2 line-clamp-2 text-[11px] text-[var(--ink-muted)] sm:text-xs">
          {localized.category}
          {localized.origin ? ` · ${localized.origin}` : ""}
        </p>
      </div>
    </button>
  );
}

export default function CataloguePage() {
  const { user, ready, data, collect, markTried, isCollected, requireAuth } = useAuth();
  const { t } = useI18n();
  const { searchCocktails, cocktailCategories } = useCocktailCatalog();
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
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial?.trim()) setQ(initial.trim());
  }, []);

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
      const cached = readCachedCoords();
      if (cached) {
        lat = cached.lat;
        lon = cached.lon;
      } else {
        const permission = await readGeolocationPermission();
        if (permission === "granted" && navigator.geolocation) {
          const pos = await new Promise<GeolocationPosition | null>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              () => resolve(null),
              { timeout: 4000, maximumAge: 10 * 60 * 1000 },
            );
          });
          lat = pos?.coords.latitude;
          lon = pos?.coords.longitude;
          if (lat != null && lon != null) {
            writeCachedCoords({ lat, lon });
          }
        }
      }

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: data.history,
          moodPreference: data.moodPreference,
          surveyPreferences: data.surveyPreferences,
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
  }, [ready, accountId, data.moodPreference, data.surveyPreferences]);

  useEffect(() => {
    if (shifted.current || ranked.length === 0) return;
    shifted.current = true;
    maybeAdvanceRankOffset(accountId, "catalogue", SHIFT_PER_VISIT, ranked.length);
  }, [accountId, ranked.length]);

  const categories = useMemo(() => cocktailCategories(), [cocktailCategories]);
  const { texts: categoryLabels } = useTranslatedTexts(categories, "cocktail-categories");

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
  }, [q, category, ranked, visitOffset, searchCocktails]);

  if (!ready) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pb-16 pt-3 sm:px-4 sm:pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--on-bg)] sm:text-3xl">
          {t("catalogue.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--on-bg-soft)] sm:text-base">
          {t("catalogue.subtitle")}
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("catalogue.searchPlaceholder")}
            className="min-h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2.5 pe-4 ps-10 text-base outline-none focus:border-[var(--accent)] sm:text-sm"
          />
        </div>

        <div className="mobile-scrollbar-none -mx-3 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`min-h-11 shrink-0 snap-start rounded-full px-3.5 py-2 text-xs font-medium ${
              category === "all"
                ? "bg-[var(--ink)] text-[var(--foam)]"
                : "bg-[var(--chip)] text-[var(--ink-soft)]"
            }`}
          >
            {t("catalogue.all")}
          </button>
          {categories.map((c, categoryIndex) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`min-h-11 shrink-0 snap-start rounded-full px-3.5 py-2 text-xs font-medium ${
                category === c
                  ? "bg-[var(--ink)] text-[var(--foam)]"
                  : "bg-[var(--chip)] text-[var(--ink-soft)]"
              }`}
            >
              {categoryLabels[categoryIndex] || c}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-[var(--on-bg-muted)]">
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
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {list.map((cocktail) => (
              <CatalogueCard
                key={cocktail.id}
                cocktail={cocktail}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </main>

      {selected && !triedOpen && (
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
