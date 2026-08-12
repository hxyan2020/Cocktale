import { getMessages } from "@/i18n";
import { EQUIPMENT_IDS, equipmentLabel } from "@/i18n/equipment";
import { LOCALES, type LocaleCode } from "@/i18n/locales";
import { SHOP_KEYS, getShopMessages } from "@/i18n/shop";
import { en } from "@/i18n/messages/en";

export type TranslationRow = {
  path: string;
  section: string;
  values: Record<string, string>;
};

export const I18N_UPDATED_EVENT = "cocktale:i18n-updated";

export function flattenStrings(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj == null || typeof obj !== "object") return out;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, flattenStrings(value, path));
  }
  return out;
}

export function allTranslationPaths(): string[] {
  return [
    ...Object.keys(flattenStrings(en)),
    ...SHOP_KEYS.map((key) => `shop.${key}`),
    ...EQUIPMENT_IDS.map((id) => `equipment.${id}`),
  ];
}

export function readPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function getBuiltInString(locale: LocaleCode, path: string): string {
  if (path.startsWith("shop.")) {
    const key = path.slice(5) as (typeof SHOP_KEYS)[number];
    return getShopMessages(locale)[key] ?? getShopMessages("en")[key] ?? "";
  }
  if (path.startsWith("equipment.")) {
    const id = path.slice("equipment.".length);
    return equipmentLabel(locale, id as (typeof EQUIPMENT_IDS)[number]);
  }
  return readPath(getMessages(locale), path) ?? readPath(en, path) ?? "";
}

export function effectiveString(
  locale: LocaleCode,
  path: string,
  overrides: Record<string, Record<string, string>>,
): string {
  const over = overrides[locale]?.[path];
  if (typeof over === "string") return over;
  return getBuiltInString(locale, path);
}

export function buildTranslationRows(
  overrides: Record<string, Record<string, string>>,
): TranslationRow[] {
  const locales = LOCALES.map((l) => l.code);
  return allTranslationPaths().map((path) => {
    const values: Record<string, string> = {};
    for (const locale of locales) {
      values[locale] = effectiveString(locale, path, overrides);
    }
    return {
      path,
      section: path.split(".")[0] || "general",
      values,
    };
  });
}
