import { NextResponse } from "next/server";
import { defaultsForCountry } from "@/lib/geo-defaults";

export const runtime = "nodejs";

function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") || headers.get("cf-connecting-ip");
}

async function lookupCountryByIp(ip: string | null): Promise<string | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return null;
  }
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country_code/`, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const text = (await response.text()).trim().toUpperCase();
    return /^[A-Z]{2}$/.test(text) ? text : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const headers = req.headers;
  let country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    headers.get("cloudfront-viewer-country");

  if (!country || country === "XX" || country === "T1") {
    country = (await lookupCountryByIp(clientIp(headers))) || "US";
  }

  return NextResponse.json(defaultsForCountry(country), {
    headers: {
      "Cache-Control": "private, max-age=3600",
    },
  });
}
