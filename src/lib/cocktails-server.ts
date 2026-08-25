import "server-only";

import { getAllCocktails, getCocktail, isCocktailDrink } from "@/lib/cocktails";
import {
  getCocktailImageOverride,
  loadCocktailImageOverrides,
  resolveStoredCocktailImageUrl,
} from "@/lib/cocktail-image-overrides";
import {
  listCocktailsFromProfiles,
  resolveCocktailFromProfiles,
} from "@/lib/cocktail-profile-types";
import { loadCocktailProfiles } from "@/lib/cocktail-profiles";
import type { Cocktail } from "@/lib/types";

function withResolvedImage(cocktail: Cocktail): Cocktail {
  return {
    ...cocktail,
    image: resolveStoredCocktailImageUrl(cocktail.id, cocktail.image),
  };
}

function catalogBase(id: string): Cocktail | undefined {
  return getCocktail(id);
}

export function getResolvedCocktail(id: string): Cocktail | undefined {
  const profiles = loadCocktailProfiles();
  const resolved = resolveCocktailFromProfiles(id, catalogBase(id), profiles);
  return resolved ? withResolvedImage(resolved) : undefined;
}

export function getAllResolvedCocktails(): Cocktail[] {
  const profiles = loadCocktailProfiles();
  return listCocktailsFromProfiles(getAllCocktails(), profiles)
    .filter(isCocktailDrink)
    .map(withResolvedImage);
}

export function getAllCocktailsForAdmin(): Array<
  Cocktail & {
    catalogImage: string;
    overrideImage?: string | null;
    gallery: string[];
    hasOverride: boolean;
    hasImageOverride: boolean;
    hasContentOverride: boolean;
    isCustom: boolean;
    isDeleted: boolean;
  }
> {
  const imageOverrides = loadCocktailImageOverrides();
  const profiles = loadCocktailProfiles();
  const deleted = new Set(profiles.deleted);

  type AdminRow = Cocktail & {
    catalogImage: string;
    overrideImage?: string | null;
    gallery: string[];
    hasOverride: boolean;
    hasImageOverride: boolean;
    hasContentOverride: boolean;
    isCustom: boolean;
    isDeleted: boolean;
  };

  const rows: AdminRow[] = [];
  const seen = new Set<string>();

  const pushRow = (
    cocktail: Cocktail,
    opts: { catalogImage: string; isCustom: boolean; isDeleted: boolean },
  ) => {
    if (seen.has(cocktail.id)) return;
    seen.add(cocktail.id);
    const override = imageOverrides[cocktail.id];
    const hasImageOverride = Boolean(
      override && Object.prototype.hasOwnProperty.call(override, "image"),
    );
    const hasContentOverride = Boolean(profiles.overrides[cocktail.id]);
    rows.push({
      ...withResolvedImage(cocktail),
      catalogImage: opts.catalogImage,
      overrideImage: hasImageOverride ? (override?.image ?? null) : undefined,
      gallery: override?.gallery ?? [],
      hasImageOverride,
      hasContentOverride,
      hasOverride:
        hasImageOverride || (override?.gallery?.length ?? 0) > 0 || hasContentOverride,
      isCustom: opts.isCustom,
      isDeleted: opts.isDeleted,
    });
  };

  for (const cocktail of getAllCocktails()) {
    const patched = resolveCocktailFromProfiles(cocktail.id, cocktail, {
      ...profiles,
      deleted: [],
    });
    if (!patched) continue;
    pushRow(patched, {
      catalogImage: cocktail.image,
      isCustom: false,
      isDeleted: deleted.has(cocktail.id),
    });
  }

  for (const custom of Object.values(profiles.customs)) {
    const patched = resolveCocktailFromProfiles(custom.id, custom, {
      ...profiles,
      deleted: [],
    });
    if (!patched) continue;
    pushRow(patched, {
      catalogImage: custom.image,
      isCustom: true,
      isDeleted: deleted.has(custom.id),
    });
  }

  return rows;
}

export function getCatalogCocktail(id: string) {
  const profiles = loadCocktailProfiles();
  if (profiles.customs[id]) return profiles.customs[id];
  return getCocktail(id);
}

export function getCocktailImageOverridePublic(id: string) {
  return getCocktailImageOverride(id);
}
