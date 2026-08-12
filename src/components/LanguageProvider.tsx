"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectBrowserLocale,
  getLocaleMeta,
  isLocaleCode,
  type LocaleCode,
} from "@/i18n/locales";
import { getMessages, interpolate } from "@/i18n";
import { getShopMessages } from "@/i18n/shop";
import { equipmentLabel } from "@/i18n/equipment";
import { I18N_UPDATED_EVENT, readPath } from "@/lib/i18n-catalog";
import type { Messages } from "@/i18n/messages/en";
import type { EquipmentId } from "@/lib/make-guide";

type TranslateFn = (path: string, vars?: Record<string, string | number>) => string;

type LanguageContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  messages: Messages;
  t: TranslateFn;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);
  const [overridesAll, setOverridesAll] = useState<Record<string, Record<string, string>>>({});

  const refreshOverrides = useCallback(() => {
    fetch("/api/i18n/overrides", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setOverridesAll(data as Record<string, Record<string, string>>);
        }
      })
      .catch(() => {
        // keep built-in catalogs if the overlay API is unreachable
      });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const initial =
      stored && isLocaleCode(stored) ? stored : detectBrowserLocale();
    setLocaleState(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    refreshOverrides();
    window.addEventListener(I18N_UPDATED_EVENT, refreshOverrides);
    return () => window.removeEventListener(I18N_UPDATED_EVENT, refreshOverrides);
  }, [refreshOverrides]);

  useEffect(() => {
    if (!ready) return;
    const meta = getLocaleMeta(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale, ready]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const dir = getLocaleMeta(locale).dir;
  const overrides = overridesAll[locale] ?? {};

  const t = useCallback<TranslateFn>(
    (path, vars) => {
      const over = overrides[path];
      if (typeof over === "string") return interpolate(over, vars);

      if (path.startsWith("shop.")) {
        const key = path.slice(5) as keyof ReturnType<typeof getShopMessages>;
        const value = getShopMessages(locale)[key] ?? getShopMessages("en")[key];
        if (typeof value === "string") return interpolate(value, vars);
      }

      if (path.startsWith("equipment.")) {
        const id = path.slice("equipment.".length) as EquipmentId;
        return interpolate(equipmentLabel(locale, id), vars);
      }

      const value = readPath(messages, path) ?? readPath(getMessages("en"), path) ?? path;
      return interpolate(value, vars);
    },
    [locale, messages, overrides],
  );

  const value = useMemo(
    () => ({ locale, setLocale, messages, t, dir }),
    [locale, setLocale, messages, t, dir],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
