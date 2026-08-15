"use client";

import { useEffect, useRef } from "react";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useMeasureUnit } from "@/components/MeasureUnitProvider";
import { LOCALE_STORAGE_KEY, isLocaleCode } from "@/i18n/locales";
import { CURRENCY_STORAGE_KEY, isCurrencyCode } from "@/lib/currency";
import type { GeoDefaults } from "@/lib/geo-defaults";
import { MEASURE_STORAGE_KEY, isMeasureUnit } from "@/lib/units";

/**
 * Applies language / currency / measure defaults from the visitor's IP once,
 * only when the user has not already chosen a preference.
 */
export function GeoDefaultsBootstrap() {
  const { applyDefaultLocale } = useI18n();
  const { applyDefaultUnit } = useMeasureUnit();
  const { applyDefaultCurrency } = useCurrency();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const needsLocale = !localStorage.getItem(LOCALE_STORAGE_KEY);
    const needsMeasure = !localStorage.getItem(MEASURE_STORAGE_KEY);
    const needsCurrency = !localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (!needsLocale && !needsMeasure && !needsCurrency) return;

    let active = true;
    fetch("/api/geo", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GeoDefaults | null) => {
        if (!active || !data) return;
        if (needsLocale && isLocaleCode(data.locale)) applyDefaultLocale(data.locale);
        if (needsMeasure && isMeasureUnit(data.measure)) applyDefaultUnit(data.measure);
        if (needsCurrency && isCurrencyCode(data.currency)) applyDefaultCurrency(data.currency);
      })
      .catch(() => {
        // Keep browser / built-in defaults when geo lookup fails.
      });

    return () => {
      active = false;
    };
  }, [applyDefaultLocale, applyDefaultUnit, applyDefaultCurrency]);

  return null;
}
