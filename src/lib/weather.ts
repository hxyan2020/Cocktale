import { weatherBucketFromTemp, type RecommendInput } from "@/lib/recommend";
import type { WeatherBucket } from "@/lib/types";

export type WeatherInfo = {
  tempC: number;
  weatherCode: number;
  bucket: WeatherBucket;
  label: string;
  city: string;
};

const LABELS: Record<WeatherBucket, string> = {
  hot: "Hot & sunny",
  warm: "Warm evening",
  mild: "Mild day",
  cool: "Cool air",
  cold: "Cold snap",
  rainy: "Rainy mood",
};

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
};

function formatPlace(city: string | undefined, country: string | undefined): string {
  const place = city?.trim();
  const nation = country?.trim();
  if (place && nation && place.toLowerCase() !== nation.toLowerCase()) {
    return `${place}, ${nation}`;
  }
  return place || nation || "";
}

async function resolvePlaceName(lat: number, lon: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "10");
    url.searchParams.set("accept-language", "en");

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Cocktale/1.0 (https://cocktale.vercel.app)",
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return "";

    const json = (await res.json()) as { address?: NominatimAddress };
    const address = json.address;
    if (!address) return "";

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state;

    return formatPlace(city, address.country);
  } catch {
    return "";
  }
}

export async function fetchWeather(
  lat?: number,
  lon?: number,
): Promise<WeatherInfo> {
  const hasCoords = lat != null && lon != null && Number.isFinite(lat) && Number.isFinite(lon);
  const latitude = hasCoords ? lat : 40.71;
  const longitude = hasCoords ? lon : -74.01;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
  const [weatherRes, placeName] = await Promise.all([
    fetch(weatherUrl, { next: { revalidate: 1800 } }),
    hasCoords ? resolvePlaceName(latitude, longitude) : Promise.resolve(""),
  ]);

  const city = hasCoords ? placeName || "near_you" : "default";

  if (!weatherRes.ok) {
    return {
      tempC: 18,
      weatherCode: 0,
      bucket: "mild",
      label: LABELS.mild,
      city,
    };
  }
  const json = (await weatherRes.json()) as {
    current: { temperature_2m: number; weather_code: number };
  };
  const tempC = json.current.temperature_2m;
  const weatherCode = json.current.weather_code;
  const bucket = weatherBucketFromTemp(tempC, weatherCode);
  return {
    tempC,
    weatherCode,
    bucket,
    label: LABELS[bucket],
    city,
  };
}

export type { RecommendInput };
