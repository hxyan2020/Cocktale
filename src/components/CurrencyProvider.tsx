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
  CURRENCIES,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  formatMoneyAmount,
  getStoredCurrency,
  isCurrencyCode,
  peekStoredCurrency,
  setStoredCurrency,
  type CurrencyCode,
} from "@/lib/currency";
import { useI18n } from "@/components/LanguageProvider";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  currencies: readonly CurrencyCode[];
  format: (usdCents: number) => string;
  applyDefaultCurrency: (code: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrencyState(getStoredCurrency());
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    setStoredCurrency(code);
  }, []);

  const applyDefaultCurrency = useCallback((code: CurrencyCode) => {
    if (peekStoredCurrency()) return;
    if (!isCurrencyCode(code)) return;
    setCurrencyState(code);
    setStoredCurrency(code);
  }, []);

  const format = useCallback(
    (usdCents: number) => formatMoneyAmount(usdCents, currency, locale),
    [currency, locale],
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      currencies: CURRENCIES,
      format,
      applyDefaultCurrency,
    }),
    [currency, setCurrency, format, applyDefaultCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export { CURRENCY_STORAGE_KEY };
