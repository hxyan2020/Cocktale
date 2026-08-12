"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudSun, Sparkles } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { CocktailDetail } from "@/components/CocktailDetail";
import { SwipeDeck } from "@/components/SwipeDeck";
import { TriedModal } from "@/components/TriedModal";
import type { BrowseEvent, Cocktail, WeatherBucket } from "@/lib/types";

type WeatherPayload = {
  tempC: number;
  bucket: WeatherBucket;
  label: string;
  city: string;
};

const MOODS = [
  "celebratory",
  "sophisticated",
  "cozy",
  "adventurous",
  "romantic",
  "curious",
  "social",
] as const;

export default function FeedPage() {
  const { user, ready, data, browse, collect, markTried, isCollected, setMood } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [queue, setQueue] = useState<Cocktail[]>([]);
  const [index, setIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [triedOpen, setTriedOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const seenIds = useRef<Set<string>>(new Set());
  const loadingMore = useRef(false);
  const historyRef = useRef<BrowseEvent[]>(data.history);
  const moodRef = useRef(data.moodPreference);

  historyRef.current = data.history;
  moodRef.current = data.moodPreference;

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({}),
      { timeout: 5000 },
    );
  }, []);

  const fetchRecommendations = useCallback(
    async (nextCursor: number, replace: boolean) => {
      if (loadingMore.current) return;
      loadingMore.current = true;
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: historyRef.current,
            moodPreference: moodRef.current,
            excludeIds: replace ? [] : [...seenIds.current],
            lat: coords.lat,
            lon: coords.lon,
            cursor: nextCursor,
            limit: 25,
          }),
        });
        const json = (await res.json()) as {
          weather: WeatherPayload;
          cocktails: Cocktail[];
          nextCursor: number;
        };
        setWeather(json.weather);
        setCursor(json.nextCursor);
        setQueue((prev) => {
          const incoming = json.cocktails.filter(
            (c) => replace || !seenIds.current.has(c.id),
          );
          if (replace) {
            seenIds.current = new Set(incoming.map((c) => c.id));
            return incoming;
          }
          for (const c of incoming) seenIds.current.add(c.id);
          return [...prev, ...incoming];
        });
      } finally {
        loadingMore.current = false;
        setLoading(false);
      }
    },
    [coords.lat, coords.lon],
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setIndex(0);
    seenIds.current = new Set();
    void fetchRecommendations(0, true);
  }, [user, data.moodPreference, coords.lat, coords.lon, fetchRecommendations]);

  const current = queue[index] ?? null;

  useEffect(() => {
    if (current) browse(current.id, "view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useEffect(() => {
    if (index >= queue.length - 5 && queue.length > 0) {
      void fetchRecommendations(cursor, false);
    }
  }, [index, queue.length, cursor, fetchRecommendations]);

  const swipeNext = () => {
    if (current) browse(current.id, "skip");
    setDetailOpen(false);
    setTriedOpen(false);
    setIndex((i) => {
      const next = i + 1;
      if (next >= queue.length) {
        seenIds.current = new Set();
        void fetchRecommendations(0, true);
        return 0;
      }
      return next;
    });
  };

  const swipePrev = () => {
    setDetailOpen(false);
    setTriedOpen(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-[var(--ink-soft)]">{t("feed.openingBar")}</p>
      </main>
    );
  }

  const weatherLabel = weather ? t(`weather.${weather.bucket}`) : "";

  const cityDisplay = (() => {
    if (!weather) return "";
    if (weather.city === "near_you" || weather.city === "Near you") return t("weather.nearYou");
    if (
      weather.city === "default" ||
      weather.city === "New York (default)" ||
      weather.city.includes("default")
    ) {
      return t("weather.defaultCity");
    }
    if (weather.city === "manual") return "";
    return weather.city;
  })();

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-deep)]">
              {t("feed.forUser", { name: user.name })}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              {t("feed.title")}
            </h1>
          </div>
          {weather && (
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-4 py-2 text-sm text-[var(--ink-soft)] ring-1 ring-[var(--line)]">
              <CloudSun className="h-4 w-4 text-[var(--accent)]" />
              <span>
                {weatherLabel}
                {weather.tempC ? ` · ${Math.round(weather.tempC)}°C` : ""}
                {cityDisplay ? ` · ${cityDisplay}` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMood(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              !data.moodPreference
                ? "bg-[var(--ink)] text-[var(--foam)]"
                : "bg-[var(--chip)] text-[var(--ink-soft)]"
            }`}
          >
            {t("feed.anyMood")}
          </button>
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => setMood(mood)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                data.moodPreference === mood
                  ? "bg-[var(--accent)] text-[var(--foam)]"
                  : "bg-[var(--chip)] text-[var(--ink-soft)]"
              }`}
            >
              {t(`moods.${mood}`)}
            </button>
          ))}
        </div>

        <div className="mb-4 inline-flex items-center gap-2 text-xs text-[var(--ink-muted)]">
          <Sparkles className="h-3.5 w-3.5" />
          {t("feed.rankingHint")}
        </div>

        {loading && !current ? (
          <div className="flex h-[min(680px,78vh)] items-center justify-center rounded-[1.75rem] bg-[var(--surface)]/70">
            <p className="text-[var(--ink-soft)]">{t("feed.shaking")}</p>
          </div>
        ) : (
          <SwipeDeck
            cocktail={current}
            collected={current ? isCollected(current.id) : false}
            canGoBack={index > 0}
            onSwipeNext={swipeNext}
            onSwipePrev={swipePrev}
            onOpen={() => {
              if (current) {
                browse(current.id, "open");
                setDetailOpen(true);
              }
            }}
            onCollect={() => current && collect(current.id)}
            onTried={() => setTriedOpen(true)}
          />
        )}
      </main>

      {detailOpen && current && (
        <CocktailDetail
          cocktail={current}
          collected={isCollected(current.id)}
          onClose={() => setDetailOpen(false)}
          onCollect={() => collect(current.id)}
          onTried={() => {
            setDetailOpen(false);
            setTriedOpen(true);
          }}
        />
      )}

      {triedOpen && current && (
        <TriedModal
          cocktail={current}
          onClose={() => setTriedOpen(false)}
          onSave={(triedAt, note) => {
            markTried(current.id, triedAt, note);
            setTriedOpen(false);
          }}
        />
      )}
    </>
  );
}
