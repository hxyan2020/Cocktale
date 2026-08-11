import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const weather = await fetchWeather(
    lat ? Number(lat) : undefined,
    lon ? Number(lon) : undefined,
  );
  return NextResponse.json(weather);
}
