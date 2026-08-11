import { NextResponse } from "next/server";
import { getAllCocktails } from "@/lib/cocktails";
import { recommendCocktails } from "@/lib/recommend";
import { fetchWeather } from "@/lib/weather";
import type { BrowseEvent, WeatherBucket } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    history?: BrowseEvent[];
    moodPreference?: string | null;
    excludeIds?: string[];
    lat?: number;
    lon?: number;
    weatherBucket?: WeatherBucket;
    cursor?: number;
    limit?: number;
  };

  const weather =
    body.weatherBucket != null
      ? {
          bucket: body.weatherBucket,
          tempC: 0,
          weatherCode: 0,
          label: body.weatherBucket,
          city: "manual",
        }
      : await fetchWeather(body.lat, body.lon);

  const limit = Math.min(body.limit ?? 30, 80);
  const cursor = body.cursor ?? 0;

  const ranked = recommendCocktails({
    cocktails: getAllCocktails(),
    weather: weather.bucket,
    history: body.history ?? [],
    moodPreference: body.moodPreference,
    excludeIds: body.excludeIds ?? [],
    limit: cursor + limit + 40,
  });

  const page = ranked.slice(cursor, cursor + limit);
  const nextCursor = cursor + page.length;

  return NextResponse.json({
    weather,
    cocktails: page,
    nextCursor,
    hasMore: nextCursor < ranked.length || nextCursor < getAllCocktails().length,
    total: getAllCocktails().length,
  });
}

export async function GET() {
  const all = getAllCocktails();
  return NextResponse.json({ count: all.length, sample: all.slice(0, 3) });
}
