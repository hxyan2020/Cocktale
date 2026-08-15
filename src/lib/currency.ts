export const CURRENCIES = [
  "USD",
  "CNY",
  "EUR",
  "GBP",
  "JPY",
  "KRW",
  "SGD",
  "HKD",
  "TWD",
  "AUD",
  "CAD",
  "INR",
  "THB",
  "MYR",
  "IDR",
  "VND",
  "PHP",
  "TRY",
  "RUB",
  "BRL",
  "MXN",
  "AED",
  "SAR",
  "SEK",
  "PLN",
  "CHF",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";
export const CURRENCY_STORAGE_KEY = "cocktale:currency";

/** Approximate units of each currency per 1 USD (display conversion only). */
export const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  CNY: 7.25,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151,
  KRW: 1350,
  SGD: 1.34,
  HKD: 7.82,
  TWD: 32.2,
  AUD: 1.53,
  CAD: 1.36,
  INR: 83.5,
  THB: 35.5,
  MYR: 4.7,
  IDR: 15800,
  VND: 25400,
  PHP: 56.5,
  TRY: 32.5,
  RUB: 92,
  BRL: 5.1,
  MXN: 17.2,
  AED: 3.67,
  SAR: 3.75,
  SEK: 10.5,
  PLN: 3.95,
  CHF: 0.88,
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCIES as readonly string[]).includes(value.toUpperCase());
}

export function peekStoredCurrency(): CurrencyCode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (value && isCurrencyCode(value)) return value.toUpperCase() as CurrencyCode;
  } catch {
    /* ignore */
  }
  return null;
}

export function getStoredCurrency(): CurrencyCode {
  return peekStoredCurrency() ?? DEFAULT_CURRENCY;
}

export function setStoredCurrency(currency: CurrencyCode) {
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

export function convertUsdCents(usdCents: number, currency: CurrencyCode) {
  return (usdCents / 100) * (USD_RATES[currency] ?? 1);
}

export function formatMoneyAmount(
  usdCents: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  locale = "en",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" || currency === "KRW" || currency === "VND" ? 0 : 2,
  }).format(convertUsdCents(usdCents, currency));
}
