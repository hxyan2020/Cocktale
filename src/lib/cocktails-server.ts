import "server-only";

import { getAllCocktails, getCocktail } from "@/lib/cocktails";
import {
  getCocktailImageOverride,
  loadCocktailImageOverrides,
  resolveStoredCocktailImageUrl,
} from "@/lib/cocktail-image-overrides";
import type { Cocktail } from "@/lib/types";

function withResolvedImage(cocktail: Cocktail): Cocktail {
  return {
    ...cocktail,
    image: resolveStoredCocktailImageUrl(cocktail.id, cocktail.image),
  };
}

export function getResolvedCocktail(id: string): Cocktail | undefined {
  const cocktail = getCocktail(id);
  return cocktail ? withResolvedImage(cocktail) : undefined;
}

export function getAllResolvedCocktails(): Cocktail[] {
  return getAllCocktails().map(withResolvedImage);
}

export function getAllCocktailsForAdmin(): Array<
  Cocktail & {
    catalogImage: string;
    overrideImage?: string | null;
    gallery: string[];
    hasOverride: boolean;
  }
> {
  const overrides = loadCocktailImageOverrides();
  return getAllCocktails().map((cocktail) => {
    const override = overrides[cocktail.id];
    const hasImageOverride = Boolean(
      override && Object.prototype.hasOwnProperty.call(override, "image"),
    );
    return {
      ...withResolvedImage(cocktail),
      catalogImage: cocktail.image,
      overrideImage: hasImageOverride ? (override?.image ?? null) : undefined,
      gallery: override?.gallery ?? [],
      hasOverride: Boolean(
        override && (hasImageOverride || (override.gallery?.length ?? 0) > 0),
      ),
    };
  });
}

export function getCatalogCocktail(id: string) {
  return getCocktail(id);
}

export function getCocktailImageOverridePublic(id: string) {
  return getCocktailImageOverride(id);
}
