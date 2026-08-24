import { USD_RATES, type CurrencyCode } from "@/lib/currency";
import {
  MARKET_LOCATION_BY_CODE,
  MARKET_LOCATION_CODES,
  marketLocationForCurrency,
  type MarketLocationCode,
} from "@/lib/market-locations";

export type LocationPrice = {
  amountCents: number;
  currency: CurrencyCode;
};

export type ProductLocationPrices = Record<MarketLocationCode, LocationPrice>;

export type ProductPriceOverrides = Record<string, ProductLocationPrices>;

const ZERO_DECIMAL: ReadonlySet<CurrencyCode> = new Set(["JPY", "KRW", "VND"]);

export function emptyLocationPrices(): ProductLocationPrices {
  return {
    sg: { amountCents: 0, currency: "SGD" },
    hk: { amountCents: 0, currency: "HKD" },
    sha: { amountCents: 0, currency: "CNY" },
    ny: { amountCents: 0, currency: "USD" },
    par: { amountCents: 0, currency: "EUR" },
    tyo: { amountCents: 0, currency: "JPY" },
  };
}

export function normalizeLocationPrices(
  input: Partial<Record<MarketLocationCode, Partial<LocationPrice>>> | null | undefined,
): ProductLocationPrices {
  const base = emptyLocationPrices();
  for (const code of MARKET_LOCATION_CODES) {
    const row = input?.[code];
    const expected = MARKET_LOCATION_BY_CODE[code].currency;
    if (!row) continue;
    const amount = Number(row.amountCents);
    if (!Number.isFinite(amount) || amount < 0) continue;
    base[code] = {
      amountCents: Math.round(amount),
      currency: expected,
    };
  }
  return base;
}

/** Format a city-local amount (minor units; JPY is whole yen). */
export function formatLocalMoneyAmount(
  amountCents: number,
  currency: CurrencyCode,
  locale = "en",
) {
  const major = ZERO_DECIMAL.has(currency) ? amountCents : amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: ZERO_DECIMAL.has(currency) ? 0 : 2,
  }).format(major);
}

export function resolveProductUsdCents(
  productId: string,
  catalogUsdCents: number,
  overrides: ProductPriceOverrides,
): number {
  const ny = overrides[productId]?.ny;
  if (ny && ny.currency === "USD" && ny.amountCents > 0) return ny.amountCents;
  return catalogUsdCents;
}

export function resolveDisplayPrice(
  productId: string,
  catalogUsdCents: number,
  displayCurrency: CurrencyCode,
  overrides: ProductPriceOverrides,
  locale = "en",
): { text: string; amountCents: number; currency: CurrencyCode; location: MarketLocationCode | null } {
  const location = marketLocationForCurrency(displayCurrency);
  const local = location ? overrides[productId]?.[location] : undefined;
  if (local && local.amountCents > 0 && local.currency === displayCurrency) {
    return {
      text: formatLocalMoneyAmount(local.amountCents, local.currency, locale),
      amountCents: local.amountCents,
      currency: local.currency,
      location,
    };
  }

  const usdCents = resolveProductUsdCents(productId, catalogUsdCents, overrides);
  const major = (usdCents / 100) * (USD_RATES[displayCurrency] ?? 1);
  return {
    text: new Intl.NumberFormat(locale, {
      style: "currency",
      currency: displayCurrency,
      maximumFractionDigits: ZERO_DECIMAL.has(displayCurrency) ? 0 : 2,
    }).format(major),
    amountCents: usdCents,
    currency: displayCurrency,
    location: null,
  };
}
