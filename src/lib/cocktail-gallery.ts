import { getAllCocktails } from "@/lib/cocktails";
import type { Cocktail } from "@/lib/types";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  label: string;
  unoptimized?: boolean;
};

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isSameDrinkName(a: string, b: string) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na === `${nb} cocktail` || nb === `${na} cocktail`;
}

/**
 * Photos of this cocktail only — never ingredient pack shots or unrelated drinks.
 */
export function getCocktailGallery(cocktail: Cocktail, limit = 6): GalleryImage[] {
  const out: GalleryImage[] = [];
  const seen = new Set<string>();

  const push = (img: GalleryImage) => {
    if (!img.url || seen.has(img.url) || out.length >= limit) return;
    seen.add(img.url);
    out.push(img);
  };

  if (cocktail.image) {
    push({
      id: `${cocktail.id}-finished`,
      url: cocktail.image,
      alt: cocktail.name,
      label: cocktail.name,
    });
  }

  for (const other of getAllCocktails()) {
    if (other.id === cocktail.id || !other.image) continue;
    if (!isSameDrinkName(other.name, cocktail.name) && !isSameDrinkName(other.alternateName || "", cocktail.name)) {
      continue;
    }
    push({
      id: `${cocktail.id}-variant-${other.id}`,
      url: other.image,
      alt: `${cocktail.name} — ${other.name}`,
      label: other.name,
    });
  }

  return out;
}

export function mergeCocktailGallery(
  base: GalleryImage[],
  extra: GalleryImage[],
  limit = 6,
): GalleryImage[] {
  const seen = new Set<string>();
  const out: GalleryImage[] = [];
  for (const img of [...base, ...extra]) {
    if (!img.url || seen.has(img.url) || out.length >= limit) continue;
    seen.add(img.url);
    out.push(img);
  }
  return out;
}
