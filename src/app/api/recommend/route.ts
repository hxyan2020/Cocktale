import { NextResponse } from "next/server";
import { getAllCocktails } from "@/lib/cocktails";
import { rankCocktails } from "@/lib/recommend";
import { fetchWeather } from "@/lib/weather";
import type {
  BrowseEvent,
  SurveyPreferences,
  WeatherBucket,
} from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    history?: BrowseEvent[];
    moodPreference?: string | null;
    surveyPreferences?: SurveyPreferences | null;
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

  const all = getAllCocktails();
  const limit = Math.min(Math.max(body.limit ?? 30, 1), all.length);
  const cursor = Math.max(0, body.cursor ?? 0);

  const ranked = rankCocktails({
    cocktails: all,
    weather: weather.bucket,
    history: body.history ?? [],
    moodPreference: body.moodPreference,
    surveyPreferences: body.surveyPreferences,
    excludeIds: body.excludeIds ?? [],
  });

  const start = cursor % Math.max(ranked.length, 1);
  const rotated = ranked.length
    ? [...ranked.slice(start), ...ranked.slice(0, start)]
    : [];
  const page = rotated.slice(0, limit);
  const nextCursor = (start + page.length) % Math.max(ranked.length, 1);

  return NextResponse.json({
    weather,
    cocktails: page,
    nextCursor,
    hasMore: ranked.length > page.length,
    total: ranked.length,
  });
}

export async function GET() {
  const all = getAllCocktails();
  return NextResponse.json({ count: all.length, sample: all.slice(0, 3) });
}
