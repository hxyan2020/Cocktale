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
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/LanguageProvider";
import type { Product } from "@/lib/commerce-types";
import { formatMoneyAmount } from "@/lib/currency";
import { marketLocationForCurrency } from "@/lib/market-locations";
import {
  formatLocalMoneyAmount,
  resolveDisplayPrice,
  resolveProductUsdCents,
  type ProductPriceOverrides,
} from "@/lib/product-price-types";

type Priced = Pick<Product, "id" | "priceCents">;

type Ctx = {
  overrides: ProductPriceOverrides;
  ready: boolean;
  refresh: () => Promise<void>;
  usdCents: (product: Priced) => number;
  formatProduct: (product: Priced) => string;
  formatLine: (product: Priced, quantity: number) => string;
  formatUsdTotal: (usdCentsTotal: number) => string;
  lineUsdCents: (product: Priced, quantity: number) => number;
};

const ProductPriceContext = createContext<Ctx>({
  overrides: {},
  ready: false,
  refresh: async () => undefined,
  usdCents: (product) => product.priceCents,
  formatProduct: () => "",
  formatLine: () => "",
  formatUsdTotal: () => "",
  lineUsdCents: (product, quantity) => product.priceCents * quantity,
});

export function ProductPriceProvider({ children }: { children: ReactNode }) {
  const { currency } = useCurrency();
  const { locale } = useI18n();
  const [overrides, setOverrides] = useState<ProductPriceOverrides>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/product-price-overrides", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { overrides?: ProductPriceOverrides };
      setOverrides(data.overrides || {});
    } catch {
      // keep last known
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => {
      void refresh();
    };
    window.addEventListener("cocktale:product-prices-updated", onUpdate);
    return () => window.removeEventListener("cocktale:product-prices-updated", onUpdate);
  }, [refresh]);

  const value = useMemo<Ctx>(() => {
    const usdCents = (product: Priced) =>
      resolveProductUsdCents(product.id, product.priceCents, overrides);

    return {
      overrides,
      ready,
      refresh,
      usdCents,
      formatProduct: (product) =>
        resolveDisplayPrice(product.id, product.priceCents, currency, overrides, locale).text,
      formatLine: (product, quantity) => {
        const location = marketLocationForCurrency(currency);
        const local = location ? overrides[product.id]?.[location] : undefined;
        if (local && local.amountCents > 0 && local.currency === currency) {
          return formatLocalMoneyAmount(local.amountCents * quantity, local.currency, locale);
        }
        return formatMoneyAmount(usdCents(product) * quantity, currency, locale);
      },
      formatUsdTotal: (usdCentsTotal) => formatMoneyAmount(usdCentsTotal, currency, locale),
      lineUsdCents: (product, quantity) => usdCents(product) * quantity,
    };
  }, [overrides, ready, refresh, currency, locale]);

  return (
    <ProductPriceContext.Provider value={value}>{children}</ProductPriceContext.Provider>
  );
}

export function useProductPrices() {
  return useContext(ProductPriceContext);
}

export function useProductPrice(product: Priced | null | undefined) {
  const { formatProduct, usdCents } = useProductPrices();
  if (!product) return { text: "", usdCents: 0 };
  return { text: formatProduct(product), usdCents: usdCents(product) };
}
