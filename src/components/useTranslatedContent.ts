"use client";

/* eslint-disable react-hooks/set-state-in-effect -- this hook synchronizes async/cache translations with locale changes */

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import type { Product } from "@/lib/commerce-types";
import type { Cocktail } from "@/lib/types";

const CACHE_PREFIX = "cocktale:content-i18n:v1:";
const pendingTranslations = new Map<string, Promise<string[]>>();

function hash(value: string) {
  let out = 2166136261;
  for (let index = 0; index < value.length; index++) {
    out ^= value.charCodeAt(index);
    out = Math.imul(out, 16777619);
  }
  return (out >>> 0).toString(36);
}

export function useTranslatedTexts(
  texts: string[],
  cacheKey: string,
  enabled = true,
): { texts: string[]; loading: boolean } {
  const { locale } = useI18n();
  const signature = useMemo(() => JSON.stringify(texts), [texts]);
  const storageKey = `${CACHE_PREFIX}${locale}:${cacheKey}:${hash(signature)}`;
  const [translated, setTranslated] = useState<string[]>(texts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locale === "en" || !enabled || texts.length === 0) {
      setTranslated(texts);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed) && parsed.length === texts.length) {
          setTranslated(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore corrupt or unavailable browser storage.
    }

    let active = true;
    setTranslated(texts);
    setLoading(true);
    let request = pendingTranslations.get(storageKey);
    if (!request) {
      request = fetch("/api/translate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, texts }),
      }).then(async (response) => {
          const data = (await response.json()) as { translations?: string[] };
          if (!response.ok || !Array.isArray(data.translations)) {
            throw new Error("Translation failed");
          }
          return data.translations;
        });
      pendingTranslations.set(storageKey, request);
    }

    request
      .then((output) => {
        if (!active || output.length !== texts.length) return;
        setTranslated(output);
        try {
          localStorage.setItem(storageKey, JSON.stringify(output));
        } catch {
          // Translation still works when storage is full or blocked.
        }
      })
      .catch((error) => {
        if (active && (error as Error).name !== "AbortError") setTranslated(texts);
      })
      .finally(() => {
        if (pendingTranslations.get(storageKey) === request) {
          pendingTranslations.delete(storageKey);
        }
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale, enabled, signature, storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { texts: translated, loading };
}

export function useLocalizedCocktail(cocktail: Cocktail, enabled = true): Cocktail {
  const source = useMemo(
    () => [
      cocktail.name,
      cocktail.alternateName || "",
      cocktail.category,
      cocktail.glass,
      cocktail.origin,
      cocktail.description,
      cocktail.story,
      ...cocktail.ingredients.map((item) => item.name),
      ...cocktail.instructions,
      ...cocktail.tags,
      ...cocktail.situations,
      ...cocktail.suitableFor,
      ...cocktail.flavorProfile,
    ],
    [cocktail],
  );
  const { texts } = useTranslatedTexts(source, `cocktail:${cocktail.id}`, enabled);

  return useMemo(() => {
    let index = 0;
    const next = () => texts[index++] ?? source[index - 1] ?? "";
    const name = next();
    const alternateName = next() || null;
    const category = next();
    const glass = next();
    const origin = next();
    const description = next();
    const story = next();
    const ingredients = cocktail.ingredients.map((item) => ({ ...item, name: next() }));
    const instructions = cocktail.instructions.map(() => next());
    const tags = cocktail.tags.map(() => next());
    const situations = cocktail.situations.map(() => next());
    const suitableFor = cocktail.suitableFor.map(() => next());
    const flavorProfile = cocktail.flavorProfile.map(() => next());

    return {
      ...cocktail,
      name,
      alternateName,
      category,
      glass,
      origin,
      description,
      story,
      ingredients,
      instructions,
      tags,
      situations,
      suitableFor,
      flavorProfile,
    };
  }, [cocktail, source, texts]);
}

export function useLocalizedProduct(product: Product | undefined, enabled = true): Product | undefined {
  const source = useMemo(
    () =>
      product
        ? [
            product.name,
            product.subcategory,
            product.description,
            product.longDescription,
            product.unit,
            ...product.specs.flatMap((spec) => [spec.label, spec.value]),
          ]
        : [],
    [product],
  );
  const { texts } = useTranslatedTexts(source, `product:${product?.id ?? "missing"}`, enabled);

  return useMemo(() => {
    if (!product) return undefined;
    let index = 0;
    const next = () => texts[index++] ?? source[index - 1] ?? "";
    const name = next();
    const subcategory = next();
    const description = next();
    const longDescription = next();
    const unit = next();
    const specs = product.specs.map(() => ({ label: next(), value: next() }));
    return { ...product, name, subcategory, description, longDescription, unit, specs };
  }, [product, source, texts]);
}
