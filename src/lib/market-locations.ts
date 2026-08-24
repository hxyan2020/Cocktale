import type { CurrencyCode } from "@/lib/currency";

export const MARKET_LOCATION_CODES = ["sg", "hk", "sha", "ny", "par", "tyo"] as const;

export type MarketLocationCode = (typeof MARKET_LOCATION_CODES)[number];

export type MarketLocation = {
  code: MarketLocationCode;
  label: string;
  city: string;
  currency: CurrencyCode;
  shortLabel: string;
};

export const MARKET_LOCATIONS: readonly MarketLocation[] = [
  { code: "sg", label: "Singapore", city: "Singapore", currency: "SGD", shortLabel: "SG" },
  { code: "hk", label: "Hong Kong", city: "Hong Kong", currency: "HKD", shortLabel: "HK" },
  { code: "sha", label: "Shanghai", city: "Shanghai", currency: "CNY", shortLabel: "SHA" },
  { code: "ny", label: "New York", city: "New York", currency: "USD", shortLabel: "NY" },
  { code: "par", label: "Paris", city: "Paris", currency: "EUR", shortLabel: "PAR" },
  { code: "tyo", label: "Tokyo", city: "Tokyo", currency: "JPY", shortLabel: "TYO" },
] as const;

export const MARKET_LOCATION_BY_CODE: Record<MarketLocationCode, MarketLocation> =
  Object.fromEntries(MARKET_LOCATIONS.map((loc) => [loc.code, loc])) as Record<
    MarketLocationCode,
    MarketLocation
  >;

/** Prefer a city shelf price when the shopper's display currency matches that market. */
export function marketLocationForCurrency(currency: string): MarketLocationCode | null {
  const code = currency.toUpperCase();
  const match = MARKET_LOCATIONS.find((loc) => loc.currency === code);
  return match?.code ?? null;
}

export function isMarketLocationCode(value: string): value is MarketLocationCode {
  return (MARKET_LOCATION_CODES as readonly string[]).includes(value);
}
