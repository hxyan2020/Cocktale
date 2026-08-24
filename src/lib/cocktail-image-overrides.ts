import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  COCKTAIL_FALLBACK_IMAGE,
  resolveCocktailImageUrl,
  type CocktailImageOverride,
  type CocktailImageOverrides,
} from "@/lib/cocktail-image-types";

export type { CocktailImageOverride, CocktailImageOverrides };
export { COCKTAIL_FALLBACK_IMAGE, resolveCocktailImageUrl };

const RELATIVE_PATHS = ["data/cocktail-image-overrides.json"];

let cache: CocktailImageOverrides | null = null;

function filePaths() {
  return RELATIVE_PATHS.map((rel) => join(process.cwd(), rel));
}

export function loadCocktailImageOverrides(): CocktailImageOverrides {
  if (cache) return cache;
  for (const file of filePaths()) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as CocktailImageOverrides;
      if (parsed && typeof parsed === "object") {
        cache = parsed;
        return cache;
      }
    } catch {
      // try next location
    }
  }
  cache = {};
  return cache;
}

export function saveCocktailImageOverrides(next: CocktailImageOverrides) {
  cache = next;
  const json = `${JSON.stringify(next, null, 2)}\n`;
  for (const file of filePaths()) {
    try {
      mkdirSync(join(file, ".."), { recursive: true });
      writeFileSync(file, json);
    } catch {
      // Vercel / read-only paths are skipped; in-memory cache still applies.
    }
  }
}

export function getCocktailImageOverride(id: string): CocktailImageOverride | undefined {
  return loadCocktailImageOverrides()[id];
}

export function cocktailFallbackImage() {
  return COCKTAIL_FALLBACK_IMAGE;
}

export function resolveStoredCocktailImageUrl(id: string, catalogImage: string): string {
  return resolveCocktailImageUrl(id, catalogImage, loadCocktailImageOverrides());
}

export function upsertCocktailImageOverride(
  id: string,
  patch: CocktailImageOverride,
): CocktailImageOverride {
  const current = structuredClone(loadCocktailImageOverrides());
  const existing = current[id] || {};
  const next: CocktailImageOverride = { ...existing };

  if (Object.prototype.hasOwnProperty.call(patch, "image")) {
    next.image = patch.image;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "gallery")) {
    next.gallery = patch.gallery;
  }

  const empty =
    !Object.prototype.hasOwnProperty.call(next, "image") &&
    (!next.gallery || next.gallery.length === 0);
  if (empty) delete current[id];
  else current[id] = next;

  saveCocktailImageOverrides(current);
  return current[id] || {};
}

export function clearCocktailImageOverride(id: string) {
  const current = structuredClone(loadCocktailImageOverrides());
  delete current[id];
  saveCocktailImageOverrides(current);
}
