import type { LocaleCode } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages/en";
import { en } from "@/i18n/messages/en";
import { zhCN } from "@/i18n/messages/zh-CN";
import { zhTW } from "@/i18n/messages/zh-TW";
import { es } from "@/i18n/messages/es";
import { fr } from "@/i18n/messages/fr";
import { de } from "@/i18n/messages/de";
import { ja } from "@/i18n/messages/ja";
import { ko } from "@/i18n/messages/ko";
import { pt } from "@/i18n/messages/pt";
import { ru } from "@/i18n/messages/ru";
import { ar } from "@/i18n/messages/ar";
import { hi } from "@/i18n/messages/hi";
import { it } from "@/i18n/messages/it";
import { tr } from "@/i18n/messages/tr";
import { vi, th, id } from "@/i18n/messages/sea";
import { nl, pl, bn } from "@/i18n/messages/europe-asia";
import { uk, ms, fa, he, sv } from "@/i18n/messages/more";

export const catalogs: Record<LocaleCode, Messages> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  es,
  hi,
  ar,
  fr,
  pt,
  ru,
  ja,
  de,
  ko,
  it,
  tr,
  vi,
  th,
  id,
  nl,
  pl,
  bn,
  uk,
  ms,
  fa,
  he,
  sv,
};

export function getMessages(locale: LocaleCode): Messages {
  return catalogs[locale] ?? en;
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}
