"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { useTranslatedTexts } from "@/components/useTranslatedContent";
import {
  EN_SHOP_MESSAGES,
  SHOP_KEYS,
  getShopMessages,
  type ShopMessages,
} from "@/i18n/shop";

export function useShop(): ShopMessages {
  const { locale, t } = useI18n();
  const source = useMemo(() => SHOP_KEYS.map((key) => EN_SHOP_MESSAGES[key]), []);
  const { texts: machineTranslated } = useTranslatedTexts(source, "shop-ui");
  return useMemo(() => {
    const base = getShopMessages(locale);
    const next = { ...base };
    for (const [index, key] of SHOP_KEYS.entries()) {
      const dictionaryValue = t(`shop.${key}`);
      const shouldUseDictionary =
        locale === "en" || dictionaryValue !== EN_SHOP_MESSAGES[key];
      next[key] = shouldUseDictionary
        ? dictionaryValue
        : machineTranslated[index] || dictionaryValue;
    }
    return next;
  }, [locale, machineTranslated, t]);
}
