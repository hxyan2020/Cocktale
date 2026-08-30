export type CocktailImageOverride = {
  /** Primary image URL. `null` clears to the local fallback. Omit to keep catalog default. */
  image?: string | null;
  /** Extra gallery URLs managed in admin (shown after the primary image). */
  gallery?: string[];
};

export type CocktailImageOverrides = Record<string, CocktailImageOverride>;

export const COCKTAIL_FALLBACK_IMAGE = "/cocktail-fallback.svg";
export const MAX_COCKTAIL_IMAGES = 9;

export function isFallbackCocktailImage(url: string | null | undefined): boolean {
  if (!url) return true;
  return url === COCKTAIL_FALLBACK_IMAGE || url.endsWith("/cocktail-fallback.svg");
}

export function cocktailImageSlotCount(primary: string, gallery: string[] = []): number {
  const primaryCount = isFallbackCocktailImage(primary) ? 0 : 1;
  return primaryCount + gallery.length;
}

export function remainingCocktailImageSlots(primary: string, gallery: string[] = []): number {
  return Math.max(0, MAX_COCKTAIL_IMAGES - cocktailImageSlotCount(primary, gallery));
}

export function resolveCocktailImageUrl(
  id: string,
  catalogImage: string,
  overrides: CocktailImageOverrides = {},
): string {
  const override = overrides[id];
  if (!override) return catalogImage || COCKTAIL_FALLBACK_IMAGE;
  if (Object.prototype.hasOwnProperty.call(override, "image")) {
    if (override.image === null || override.image === "") return COCKTAIL_FALLBACK_IMAGE;
    return override.image || COCKTAIL_FALLBACK_IMAGE;
  }
  return catalogImage || COCKTAIL_FALLBACK_IMAGE;
}
