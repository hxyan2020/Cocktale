"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { getShopMessages, type ShopMessages } from "@/i18n/shop";

export function useShop(): ShopMessages {
  const { locale } = useI18n();
  return useMemo(() => getShopMessages(locale), [locale]);
}
