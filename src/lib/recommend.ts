import type { BrowseEvent, Cocktail, WeatherBucket } from "@/lib/types";

export type RecommendInput = {
  cocktails: Cocktail[];
  weather: WeatherBucket;
  history: BrowseEvent[];
  moodPreference?: string | null;
  excludeIds?: string[];
  limit?: number;
};

export function enrichHistorySignals(
  history: BrowseEvent[],
  cocktails: Cocktail[],
) {
  const byId = new Map(cocktails.map((c) => [c.id, c]));
  const ingredients = new Map<string, number>();
  const moods = new Map<string, number>();
  const categories = new Map<string, number>();
  const flavors = new Map<string, number>();
  const seen = new Map<string, number>();

  const weight: Record<BrowseEvent["action"], number> = {
    open: 4,
    collect: 6,
    tried: 7,
    view: 1.5,
    skip: -3,
  };

  for (const event of history) {
    const w = weight[event.action];
    seen.set(event.cocktailId, (seen.get(event.cocktailId) || 0) + w);
    const cocktail = byId.get(event.cocktailId);
    if (!cocktail || w <= 0) continue;
    for (const ing of cocktail.ingredients) {
      const key = ing.name.toLowerCase();
      ingredients.set(key, (ingredients.get(key) || 0) + w);
    }
    for (const mood of cocktail.moods) {
      moods.set(mood, (moods.get(mood) || 0) + w);
    }
    categories.set(cocktail.category, (categories.get(cocktail.category) || 0) + w);
    for (const flavor of cocktail.flavorProfile) {
      flavors.set(flavor, (flavors.get(flavor) || 0) + w);
    }
  }

  return { ingredients, moods, categories, flavors, seen };
}

export function scoreCocktail(
  cocktail: Cocktail,
  weather: WeatherBucket,
  signals: ReturnType<typeof enrichHistorySignals>,
  moodPreference?: string | null,
): number {
  let score = 0;

  // Popularity (0-100 → up to 35 pts)
  score += (cocktail.popularity / 100) * 35;

  // Weather affinity (up to 30 pts)
  if (cocktail.weatherAffinity.includes(weather)) score += 30;
  else if (
    (weather === "hot" && cocktail.weatherAffinity.includes("warm")) ||
    (weather === "cold" && cocktail.weatherAffinity.includes("cool")) ||
    (weather === "rainy" && cocktail.weatherAffinity.includes("cool"))
  ) {
    score += 14;
  }

  // Browsing history similarity (up to 40 pts)
  let historyPts = 0;
  for (const ing of cocktail.ingredients) {
    historyPts += (signals.ingredients.get(ing.name.toLowerCase()) || 0) * 0.35;
  }
  for (const mood of cocktail.moods) {
    historyPts += (signals.moods.get(mood) || 0) * 0.8;
  }
  historyPts += (signals.categories.get(cocktail.category) || 0) * 0.5;
  for (const flavor of cocktail.flavorProfile) {
    historyPts += (signals.flavors.get(flavor) || 0) * 0.6;
  }
  score += Math.min(40, historyPts);

  // Mild penalty for recently viewed heavy skip/view without engagement
  const seen = signals.seen.get(cocktail.id) || 0;
  if (seen < 0) score += seen * 2;
  if (seen > 0 && seen < 3) score -= 8; // already lightly seen

  // Explicit mood preference
  if (moodPreference && cocktail.moods.includes(moodPreference)) score += 18;

  // Tiny deterministic jitter so ties feel alive but stable per id
  const jitter = (cocktail.id.charCodeAt(0) + cocktail.id.charCodeAt(cocktail.id.length - 1)) % 7;
  score += jitter * 0.1;

  return score;
}

export function rankCocktails(input: Omit<RecommendInput, "limit">): Cocktail[] {
  const { cocktails, weather, history, moodPreference, excludeIds = [] } = input;
  const excluded = new Set(excludeIds);
  const signals = enrichHistorySignals(history, cocktails);

  return cocktails
    .filter((c) => !excluded.has(c.id))
    .map((c) => ({
      cocktail: c,
      score: scoreCocktail(c, weather, signals, moodPreference),
    }))
    .sort((a, b) => b.score - a.score || b.cocktail.popularity - a.cocktail.popularity)
    .map((r) => r.cocktail);
}

export function recommendCocktails(input: RecommendInput): Cocktail[] {
  const ranked = rankCocktails(input);
  const limit = input.limit ?? 50;
  return ranked.slice(0, limit);
}

export function weatherBucketFromTemp(
  tempC: number,
  weatherCode: number,
): WeatherBucket {
  // Open-Meteo weather codes: rain/drizzle/thunder roughly 51-67, 80-99
  const rainy =
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 99);

  if (rainy) return "rainy";
  if (tempC >= 28) return "hot";
  if (tempC >= 22) return "warm";
  if (tempC >= 16) return "mild";
  if (tempC >= 8) return "cool";
  return "cold";
}
