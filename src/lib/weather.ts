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

export async function fetchWeather(
  lat?: number,
  lon?: number,
): Promise<WeatherInfo> {
  const latitude = lat ?? 40.71;
  const longitude = lon ?? -74.01;
  const city = lat == null ? "default" : "near_you";

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) {
    return {
      tempC: 18,
      weatherCode: 0,
      bucket: "mild",
      label: LABELS.mild,
      city,
    };
  }
  const json = (await res.json()) as {
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
