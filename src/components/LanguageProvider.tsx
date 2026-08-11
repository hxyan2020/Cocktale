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
import type { Messages } from "@/i18n/messages/en";

type TranslateFn = (path: string, vars?: Record<string, string | number>) => string;

type LanguageContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  messages: Messages;
  t: TranslateFn;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const initial =
      stored && isLocaleCode(stored) ? stored : detectBrowserLocale();
    setLocaleState(initial);
    setReady(true);
  }, []);

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

  const t = useCallback<TranslateFn>(
    (path, vars) => {
      const value = readPath(messages, path) ?? readPath(getMessages("en"), path) ?? path;
      return interpolate(value, vars);
    },
    [messages],
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
