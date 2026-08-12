"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { SHOP_KEYS, getShopMessages, type ShopMessages } from "@/i18n/shop";

export function useShop(): ShopMessages {
  const { locale, t } = useI18n();
  return useMemo(() => {
    const base = getShopMessages(locale);
    const next = { ...base };
    for (const key of SHOP_KEYS) {
      next[key] = t(`shop.${key}`);
    }
    return next;
  }, [locale, t]);
}
