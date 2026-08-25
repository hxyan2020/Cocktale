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
  cocktailCategories as catalogCategories,
  getAllCocktails as getCatalogCocktails,
  getCocktail as getCatalogCocktail,
  isCocktailDrink,
} from "@/lib/cocktails";
import {
  listCocktailsFromProfiles,
  normalizeProfilesStore,
  resolveCocktailFromProfiles,
  type CocktailProfilesStore,
} from "@/lib/cocktail-profile-types";
import type { Cocktail } from "@/lib/types";
import {
  resolveCocktailImageUrl,
  type CocktailImageOverrides,
} from "@/lib/cocktail-image-types";

type Ctx = {
  ready: boolean;
  profiles: CocktailProfilesStore;
  imageOverrides: CocktailImageOverrides;
  refresh: () => Promise<void>;
  getCocktail: (id: string) => Cocktail | undefined;
  getAllCocktails: () => Cocktail[];
  searchCocktails: (query: string, category?: string) => Cocktail[];
  cocktailCategories: () => string[];
};

const CocktailCatalogContext = createContext<Ctx | null>(null);

function withImage(cocktail: Cocktail, imageOverrides: CocktailImageOverrides): Cocktail {
  return {
    ...cocktail,
    image: resolveCocktailImageUrl(cocktail.id, cocktail.image, imageOverrides),
  };
}

export function CocktailCatalogProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<CocktailProfilesStore>(normalizeProfilesStore(null));
  const [imageOverrides, setImageOverrides] = useState<CocktailImageOverrides>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [profilesRes, imagesRes] = await Promise.all([
        fetch("/api/cocktail-profiles", { cache: "no-store" }),
        fetch("/api/cocktail-image-overrides", { cache: "no-store" }),
      ]);
      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setProfiles(normalizeProfilesStore(data.store));
      }
      if (imagesRes.ok) {
        const data = await imagesRes.json();
        setImageOverrides(data.overrides || {});
      }
    } catch {
      // keep last
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => {
      void refresh();
    };
    window.addEventListener("cocktale:cocktail-profiles-updated", onUpdate);
    window.addEventListener("cocktale:cocktail-images-updated", onUpdate);
    return () => {
      window.removeEventListener("cocktale:cocktail-profiles-updated", onUpdate);
      window.removeEventListener("cocktale:cocktail-images-updated", onUpdate);
    };
  }, [refresh]);

  const value = useMemo<Ctx>(() => {
    const getAll = () =>
      listCocktailsFromProfiles(getCatalogCocktails(), profiles)
        .filter(isCocktailDrink)
        .map((c) => withImage(c, imageOverrides));

    return {
      ready,
      profiles,
      imageOverrides,
      refresh,
      getCocktail: (id) => {
        const resolved = resolveCocktailFromProfiles(id, getCatalogCocktail(id), profiles);
        return resolved ? withImage(resolved, imageOverrides) : undefined;
      },
      getAllCocktails: getAll,
      searchCocktails: (query, category) => {
        const q = query.trim().toLowerCase();
        const cat = category && category !== "all" ? category : null;
        return getAll().filter((c) => {
          if (cat && c.category !== cat) return false;
          if (!q) return true;
          return (
            c.name.toLowerCase().includes(q) ||
            (c.alternateName && c.alternateName.toLowerCase().includes(q)) ||
            c.origin.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.glass.toLowerCase().includes(q) ||
            c.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
            c.moods.some((m) => m.toLowerCase().includes(q)) ||
            c.tags.some((t) => t.toLowerCase().includes(q)) ||
            c.flavorProfile.some((f) => f.toLowerCase().includes(q))
          );
        });
      },
      cocktailCategories: () =>
        [...new Set(getAll().map((c) => c.category))].sort((a, b) => a.localeCompare(b)),
    };
  }, [profiles, imageOverrides, ready, refresh]);

  return (
    <CocktailCatalogContext.Provider value={value}>{children}</CocktailCatalogContext.Provider>
  );
}

export function useCocktailCatalog() {
  const ctx = useContext(CocktailCatalogContext);
  if (!ctx) {
    // Fallback for pages outside provider (should not happen in app layout)
    return {
      ready: true,
      profiles: normalizeProfilesStore(null),
      imageOverrides: {},
      refresh: async () => undefined,
      getCocktail: getCatalogCocktail,
      getAllCocktails: getCatalogCocktails,
      searchCocktails: (query: string, category?: string) => {
        const q = query.trim().toLowerCase();
        const cat = category && category !== "all" ? category : null;
        return getCatalogCocktails().filter((c) => {
          if (cat && c.category !== cat) return false;
          if (!q) return true;
          return c.name.toLowerCase().includes(q);
        });
      },
      cocktailCategories: catalogCategories,
    } satisfies Ctx;
  }
  return ctx;
}
