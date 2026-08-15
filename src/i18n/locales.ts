export const LOCALES = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr", flag: "gb" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", dir: "ltr", flag: "cn" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", dir: "ltr", flag: "tw" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr", flag: "es" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr", flag: "in" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl", flag: "sa" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr", flag: "fr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr", flag: "pt" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr", flag: "ru" },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr", flag: "jp" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr", flag: "de" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr", flag: "kr" },
  { code: "it", name: "Italian", nativeName: "Italiano", dir: "ltr", flag: "it" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", dir: "ltr", flag: "tr" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr", flag: "vn" },
  { code: "th", name: "Thai", nativeName: "ไทย", dir: "ltr", flag: "th" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr", flag: "id" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", dir: "ltr", flag: "nl" },
  { code: "pl", name: "Polish", nativeName: "Polski", dir: "ltr", flag: "pl" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", dir: "ltr", flag: "bd" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", dir: "ltr", flag: "ua" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", dir: "ltr", flag: "my" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl", flag: "ir" },
  { code: "he", name: "Hebrew", nativeName: "עברית", dir: "rtl", flag: "il" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", dir: "ltr", flag: "se" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export function localeFlagUrl(flag: string, width = 40) {
  return `https://flagcdn.com/w${width}/${flag}.png`;
}

export const DEFAULT_LOCALE: LocaleCode = "en";

export const LOCALE_STORAGE_KEY = "cocktale:locale";

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}

export function getLocaleMeta(code: LocaleCode) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function detectBrowserLocale(): LocaleCode {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const candidates = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const raw of candidates) {
    const tag = raw.toLowerCase();
    const exact = LOCALES.find((l) => l.code.toLowerCase() === tag);
    if (exact) return exact.code;
    if (tag.startsWith("zh-tw") || tag.startsWith("zh-hk") || tag.startsWith("zh-hant")) return "zh-TW";
    if (tag.startsWith("zh")) return "zh-CN";
    if (tag.startsWith("pt")) return "pt";
    const base = tag.split("-")[0];
    const byBase = LOCALES.find((l) => l.code.toLowerCase() === base || l.code.toLowerCase().startsWith(`${base}-`));
    if (byBase) return byBase.code;
  }
  return DEFAULT_LOCALE;
}
