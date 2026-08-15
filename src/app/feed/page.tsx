"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloudSun, MapPin, Sparkles } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { CocktailDetail } from "@/components/CocktailDetail";
import { SwipeDeck } from "@/components/SwipeDeck";
import { TriedModal } from "@/components/TriedModal";
import { useTranslatedTexts } from "@/components/useTranslatedContent";
import { getRankOffset, maybeAdvanceRankOffset, setRankOffset } from "@/lib/rank-rotation";
import type { BrowseEvent, Cocktail, WeatherBucket } from "@/lib/types";

type WeatherPayload = {
  tempC: number;
  bucket: WeatherBucket;
  label: string;
  city: string;
};

type LocationStatus =
  | "checking"
  | "prompt"
  | "requesting"
  | "granted"
  | "blocked"
  | "unavailable"
  | "dismissed";

const LOCATION_CACHE_KEY = "cocktale:recommendation-location";
const PERSONAL_MESSAGES = [
  "your cocktail journey has a fresh chapter waiting tonight.",
  "we found a few unexpected pours that feel right for this moment.",
  "your taste is shaping a more personal lineup with every visit.",
  "tonight's selection was refreshed with your recent discoveries in mind.",
  "there may be a new favorite waiting in this lineup.",
] as const;

function messageIndex(seed: string, count: number) {
  const sequence = Number.parseInt(seed, 10);
  if (Number.isFinite(sequence) && sequence > 0) return (sequence - 1) % count;
  let value = 0;
  for (let index = 0; index < seed.length; index++) {
    value = (value * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return value % count;
}

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
  const {
    user,
    ready,
    data,
    loginSeed,
    browse,
    collect,
    markTried,
    isCollected,
    setMood,
    requireAuth,
  } = useAuth();
  const { t } = useI18n();
  const accountId = user?.id ?? "guest";
  const [queue, setQueue] = useState<Cocktail[]>([]);
  const [index, setIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [triedOpen, setTriedOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("prompt");
  const seenIds = useRef<Set<string>>(new Set());
  const loadingMore = useRef(false);
  const historyRef = useRef<BrowseEvent[]>(data.history);
  const moodRef = useRef(data.moodPreference);
  const startCursorRef = useRef(0);
  const totalRef = useRef(0);

  historyRef.current = data.history;
  moodRef.current = data.moodPreference;

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoords(nextCoords);
        setLocationStatus("granted");
        try {
          sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(nextCoords));
        } catch {
          // Recommendations still work if browser storage is unavailable.
        }
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED ? "blocked" : "unavailable");
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => setLocationStatus("unavailable"));
      return;
    }

    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "granted") {
          requestLocation();
        } else {
          setLocationStatus(permission.state === "denied" ? "blocked" : "prompt");
        }
      } catch {
        setLocationStatus("prompt");
      }
    };

    void checkPermission();
  }, [loginSeed, requestLocation]);

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
            excludeIds: [],
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
          total?: number;
        };
        setWeather(json.weather);
        setCursor(json.nextCursor);
        if (typeof json.total === "number") totalRef.current = json.total;
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
    startCursorRef.current = getRankOffset(accountId, "feed");
  }, [accountId]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    setIndex(0);
    seenIds.current = new Set();
    void fetchRecommendations(startCursorRef.current, true);
  }, [ready, accountId, data.moodPreference, coords.lat, coords.lon, fetchRecommendations]);

  const current = queue[index] ?? null;

  useEffect(() => {
    if (current) browse(current.id, "view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useEffect(() => {
    if (totalRef.current <= 0) return;
    maybeAdvanceRankOffset(accountId, "feed", 25, totalRef.current);
    const pos = startCursorRef.current + index + 1;
    const stored = getRankOffset(accountId, "feed");
    if (pos > stored) setRankOffset(accountId, "feed", pos % totalRef.current);
  }, [accountId, index, queue.length]);

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
        const wrap = totalRef.current > 0 ? (startCursorRef.current + next) % totalRef.current : 0;
        startCursorRef.current = wrap;
        void fetchRecommendations(wrap, true);
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

  const weatherLabel = weather ? t(`weather.${weather.bucket}`) : "";
  const personalMessageSource = useMemo(() => {
    const choices: string[] = [
      ...PERSONAL_MESSAGES,
      data.moodPreference
        ? `tonight's lineup leans into your ${data.moodPreference} mood.`
        : "tonight is wide open, so we mixed in a little of everything.",
      data.history.length >= 5
        ? "your recent explorations inspired a fresh set of pours."
        : "your first few discoveries are ready to begin.",
      data.collected.length > 0
        ? "we kept what you love in mind while preparing tonight's lineup."
        : "there is plenty of room here for a new favorite.",
    ];
    return choices[messageIndex(loginSeed || accountId, choices.length)];
  }, [
    accountId,
    data.collected.length,
    data.history.length,
    data.moodPreference,
    loginSeed,
  ]);
  const { texts: personalMessages } = useTranslatedTexts(
    [personalMessageSource],
    "feed-personal-message",
  );
  const { texts: locationCopy } = useTranslatedTexts(
    [
      "Share your location for more accurate recommendations",
      "Your local weather helps Cocktale choose drinks that better fit the moment.",
      "Use my location",
      "Not now",
      "Asking for location…",
      "Location access is blocked. Enable it in your browser settings for local recommendations.",
      "Your location is unavailable right now. You can try again.",
      "Try again",
    ],
    "feed-location-permission",
  );

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-[var(--on-bg-soft)]">{t("feed.openingBar")}</p>
      </main>
    );
  }

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
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 pb-10 pt-3 sm:px-4 sm:pb-16 sm:pt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-6 sm:items-end sm:gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[var(--on-bg-accent)] sm:text-xs">
              {t("feed.forUser", { name: user?.name ?? t("brand") })}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--on-bg)] sm:text-3xl">
              {t("feed.title")}
            </h1>
          </div>
          {weather && (
            <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink-soft)] ring-1 ring-[var(--line)] sm:px-4 sm:py-2 sm:text-sm">
              <CloudSun className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <span className="truncate">
                {weatherLabel}
                {weather.tempC ? ` · ${Math.round(weather.tempC)}°C` : ""}
                {cityDisplay ? ` · ${cityDisplay}` : ""}
              </span>
            </div>
          )}
        </div>

        {locationStatus !== "checking" &&
          locationStatus !== "granted" &&
          locationStatus !== "dismissed" && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-[var(--surface)] p-3 ring-1 ring-[var(--line)] sm:mb-6 sm:p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--ink)]">{locationCopy[0]}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-soft)]">
                  {locationStatus === "blocked"
                    ? locationCopy[5]
                    : locationStatus === "unavailable"
                      ? locationCopy[6]
                      : locationCopy[1]}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={locationStatus === "requesting"}
                    className="min-h-11 rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-medium text-[var(--foam)] disabled:opacity-60"
                  >
                    {locationStatus === "requesting"
                      ? locationCopy[4]
                      : locationStatus === "prompt"
                        ? locationCopy[2]
                        : locationCopy[7]}
                  </button>
                  {locationStatus === "prompt" && (
                    <button
                      type="button"
                      onClick={() => setLocationStatus("dismissed")}
                      className="min-h-11 rounded-full px-4 py-2 text-xs font-medium text-[var(--ink-soft)]"
                    >
                      {locationCopy[3]}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        <div className="mobile-scrollbar-none -mx-3 mb-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button
            type="button"
            onClick={() => setMood(null)}
            className={`min-h-11 shrink-0 snap-start rounded-full px-3.5 py-2 text-xs font-medium ${
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
              className={`min-h-11 shrink-0 snap-start rounded-full px-3.5 py-2 text-xs font-medium ${
                data.moodPreference === mood
                  ? "bg-[var(--accent)] text-[var(--foam)]"
                  : "bg-[var(--chip)] text-[var(--ink-soft)]"
              }`}
            >
              {t(`moods.${mood}`)}
            </button>
          ))}
        </div>

        <div className="mb-3 inline-flex max-w-full items-start gap-2 px-0.5 text-xs leading-snug text-[var(--on-bg-muted)] sm:mb-4">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {user?.name && <span className="font-medium">{user.name.split(/\s+/)[0]}, </span>}
            {personalMessages[0]}
          </span>
        </div>

        {loading && !current ? (
          <div className="flex h-[min(32rem,calc(100svh-14.5rem))] items-center justify-center rounded-[1.5rem] bg-[var(--surface)]/70 sm:h-[min(680px,78vh)] sm:rounded-[1.75rem]">
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
            onTried={() => requireAuth(() => setTriedOpen(true))}
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
            requireAuth(() => {
              setDetailOpen(false);
              setTriedOpen(true);
            });
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
