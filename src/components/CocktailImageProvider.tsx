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
  COCKTAIL_FALLBACK_IMAGE,
  resolveCocktailImageUrl,
  type CocktailImageOverrides,
} from "@/lib/cocktail-image-types";
import type { Cocktail } from "@/lib/types";

type Ctx = {
  overrides: CocktailImageOverrides;
  ready: boolean;
  refresh: () => Promise<void>;
  resolveImage: (cocktail: Pick<Cocktail, "id" | "image">) => string;
};

const CocktailImageContext = createContext<Ctx>({
  overrides: {},
  ready: false,
  refresh: async () => undefined,
  resolveImage: (cocktail) => cocktail.image || COCKTAIL_FALLBACK_IMAGE,
});

export function CocktailImageProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<CocktailImageOverrides>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cocktail-image-overrides", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { overrides?: CocktailImageOverrides };
      setOverrides(data.overrides || {});
    } catch {
      // Keep last known overrides.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => {
      void refresh();
    };
    window.addEventListener("cocktale:cocktail-images-updated", onUpdate);
    return () => window.removeEventListener("cocktale:cocktail-images-updated", onUpdate);
  }, [refresh]);

  const value = useMemo<Ctx>(
    () => ({
      overrides,
      ready,
      refresh,
      resolveImage: (cocktail) =>
        resolveCocktailImageUrl(cocktail.id, cocktail.image, overrides),
    }),
    [overrides, ready, refresh],
  );

  return (
    <CocktailImageContext.Provider value={value}>{children}</CocktailImageContext.Provider>
  );
}

export function useCocktailImages() {
  return useContext(CocktailImageContext);
}

export function useCocktailImage(cocktail: Pick<Cocktail, "id" | "image"> | null | undefined) {
  const { resolveImage } = useCocktailImages();
  if (!cocktail) return COCKTAIL_FALLBACK_IMAGE;
  return resolveImage(cocktail);
}
