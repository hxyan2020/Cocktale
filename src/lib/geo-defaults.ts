import type { LocaleCode } from "@/i18n/locales";
import type { CurrencyCode } from "@/lib/currency";
import type { MeasureUnit } from "@/lib/units";

export type GeoDefaults = {
  country: string;
  locale: LocaleCode;
  currency: CurrencyCode;
  measure: MeasureUnit;
};

const DEFAULTS: GeoDefaults = {
  country: "US",
  locale: "en",
  currency: "USD",
  measure: "oz",
};

/** Country ISO-3166-1 alpha-2 → preference defaults. */
const BY_COUNTRY: Record<string, Partial<Omit<GeoDefaults, "country">>> = {
  CN: { locale: "zh-CN", currency: "CNY", measure: "cl" },
  HK: { locale: "zh-TW", currency: "HKD", measure: "ml" },
  MO: { locale: "zh-TW", currency: "HKD", measure: "ml" },
  TW: { locale: "zh-TW", currency: "TWD", measure: "ml" },
  JP: { locale: "ja", currency: "JPY", measure: "ml" },
  KR: { locale: "ko", currency: "KRW", measure: "ml" },
  SG: { locale: "en", currency: "SGD", measure: "ml" },
  MY: { locale: "ms", currency: "MYR", measure: "ml" },
  TH: { locale: "th", currency: "THB", measure: "ml" },
  VN: { locale: "vi", currency: "VND", measure: "ml" },
  ID: { locale: "id", currency: "IDR", measure: "ml" },
  PH: { locale: "en", currency: "PHP", measure: "ml" },
  IN: { locale: "hi", currency: "INR", measure: "ml" },
  BD: { locale: "bn", currency: "USD", measure: "ml" },
  AE: { locale: "ar", currency: "AED", measure: "ml" },
  SA: { locale: "ar", currency: "SAR", measure: "ml" },
  EG: { locale: "ar", currency: "USD", measure: "ml" },
  IR: { locale: "fa", currency: "USD", measure: "ml" },
  IL: { locale: "he", currency: "USD", measure: "ml" },
  TR: { locale: "tr", currency: "TRY", measure: "ml" },
  RU: { locale: "ru", currency: "RUB", measure: "ml" },
  UA: { locale: "uk", currency: "USD", measure: "ml" },
  PL: { locale: "pl", currency: "PLN", measure: "ml" },
  DE: { locale: "de", currency: "EUR", measure: "ml" },
  AT: { locale: "de", currency: "EUR", measure: "ml" },
  CH: { locale: "de", currency: "CHF", measure: "ml" },
  FR: { locale: "fr", currency: "EUR", measure: "ml" },
  BE: { locale: "fr", currency: "EUR", measure: "ml" },
  ES: { locale: "es", currency: "EUR", measure: "ml" },
  MX: { locale: "es", currency: "MXN", measure: "ml" },
  AR: { locale: "es", currency: "USD", measure: "ml" },
  CL: { locale: "es", currency: "USD", measure: "ml" },
  CO: { locale: "es", currency: "USD", measure: "ml" },
  PE: { locale: "es", currency: "USD", measure: "ml" },
  IT: { locale: "it", currency: "EUR", measure: "ml" },
  PT: { locale: "pt", currency: "EUR", measure: "ml" },
  BR: { locale: "pt", currency: "BRL", measure: "ml" },
  NL: { locale: "nl", currency: "EUR", measure: "ml" },
  SE: { locale: "sv", currency: "SEK", measure: "ml" },
  GB: { locale: "en", currency: "GBP", measure: "ml" },
  IE: { locale: "en", currency: "EUR", measure: "ml" },
  AU: { locale: "en", currency: "AUD", measure: "ml" },
  NZ: { locale: "en", currency: "AUD", measure: "ml" },
  CA: { locale: "en", currency: "CAD", measure: "oz" },
  US: { locale: "en", currency: "USD", measure: "oz" },
};

const EU_EUR_ML = new Set([
  "AD",
  "CY",
  "EE",
  "FI",
  "GR",
  "HR",
  "LT",
  "LU",
  "LV",
  "MT",
  "SI",
  "SK",
  "CZ",
  "RO",
  "BG",
  "HU",
  "DK",
  "NO",
  "IS",
]);

export function defaultsForCountry(countryCode?: string | null): GeoDefaults {
  const country = (countryCode || "US").trim().toUpperCase();
  if (!country || country === "XX" || country === "T1") {
    return { ...DEFAULTS };
  }
  const mapped = BY_COUNTRY[country];
  if (mapped) {
    return {
      country,
      locale: mapped.locale ?? DEFAULTS.locale,
      currency: mapped.currency ?? DEFAULTS.currency,
      measure: mapped.measure ?? DEFAULTS.measure,
    };
  }
  if (EU_EUR_ML.has(country)) {
    return { country, locale: "en", currency: "EUR", measure: "ml" };
  }
  return { ...DEFAULTS, country };
}
