import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getBuiltInString } from "@/lib/i18n-catalog";
import { isLocaleCode, type LocaleCode } from "@/i18n/locales";

export type I18nOverrides = Record<string, Record<string, string>>;

const RELATIVE_PATHS = ["data/i18n-overrides.json"];

let cache: I18nOverrides | null = null;

function filePaths() {
  return RELATIVE_PATHS.map((rel) => join(process.cwd(), rel));
}

export function loadOverrides(): I18nOverrides {
  if (cache) return cache;
  for (const file of filePaths()) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as I18nOverrides;
      if (parsed && typeof parsed === "object") {
        cache = parsed;
        return cache;
      }
    } catch {
      // try next location
    }
  }
  cache = {};
  return cache;
}

export function saveOverrides(next: I18nOverrides) {
  cache = next;
  const json = `${JSON.stringify(next, null, 2)}\n`;
  for (const file of filePaths()) {
    try {
      mkdirSync(join(file, ".."), { recursive: true });
      writeFileSync(file, json);
    } catch {
      // Vercel / read-only paths are skipped; in-memory cache still applies.
    }
  }
}

export function mergeLocaleStrings(
  locale: LocaleCode,
  strings: Record<string, string>,
): I18nOverrides {
  const current = structuredClone(loadOverrides());
  const bucket = { ...(current[locale] || {}) };
  for (const [path, value] of Object.entries(strings)) {
    const trimmed = value.trim();
    const builtIn = getBuiltInString(locale, path);
    if (!trimmed || trimmed === builtIn) delete bucket[path];
    else bucket[path] = value;
  }
  if (Object.keys(bucket).length === 0) delete current[locale];
  else current[locale] = bucket;
  saveOverrides(current);
  return current;
}

export function parseLocale(value: unknown): LocaleCode | null {
  return typeof value === "string" && isLocaleCode(value) && value !== "en" ? value : null;
}
