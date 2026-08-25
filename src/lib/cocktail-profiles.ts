import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  emptyProfilesStore,
  mergeCocktailContent,
  normalizeProfilesStore,
  type CocktailContentPatch,
  type CocktailProfilesStore,
} from "@/lib/cocktail-profile-types";
import type { Cocktail } from "@/lib/types";

const RELATIVE_PATHS = ["data/cocktail-profiles.json"];

let cache: CocktailProfilesStore | null = null;

function filePaths() {
  return RELATIVE_PATHS.map((rel) => join(/* turbopackIgnore: true */ process.cwd(), rel));
}

export function loadCocktailProfiles(): CocktailProfilesStore {
  if (cache) return cache;
  for (const file of filePaths()) {
    try {
      const parsed = JSON.parse(readFileSync(/* turbopackIgnore: true */ file, "utf8"));
      cache = normalizeProfilesStore(parsed);
      return cache;
    } catch {
      // try next
    }
  }
  cache = emptyProfilesStore();
  return cache;
}

export function saveCocktailProfiles(next: CocktailProfilesStore) {
  cache = normalizeProfilesStore(next);
  const json = `${JSON.stringify(cache, null, 2)}\n`;
  for (const file of filePaths()) {
    try {
      mkdirSync(join(file, ".."), { recursive: true });
      writeFileSync(/* turbopackIgnore: true */ file, json);
    } catch {
      // Vercel read-only: keep memory cache
    }
  }
}

export function getCocktailContentOverride(id: string): CocktailContentPatch | undefined {
  return loadCocktailProfiles().overrides[id];
}

export function upsertCocktailContentOverride(id: string, patch: CocktailContentPatch) {
  const store = structuredClone(loadCocktailProfiles());
  store.deleted = store.deleted.filter((x) => x !== id);
  const existing = store.overrides[id] || {};
  store.overrides[id] = { ...existing, ...patch };
  // Drop empty strings for nullable fields handled by caller
  saveCocktailProfiles(store);
  return store.overrides[id];
}

export function clearCocktailContentOverride(id: string) {
  const store = structuredClone(loadCocktailProfiles());
  delete store.overrides[id];
  saveCocktailProfiles(store);
}

export function upsertCustomCocktail(cocktail: Cocktail) {
  const store = structuredClone(loadCocktailProfiles());
  store.deleted = store.deleted.filter((x) => x !== cocktail.id);
  store.customs[cocktail.id] = cocktail;
  // Custom cocktails are full records; clear sparse override to avoid double-merge confusion
  delete store.overrides[cocktail.id];
  saveCocktailProfiles(store);
  return cocktail;
}

export function deleteCocktailProfile(id: string, options?: { isCatalog: boolean }) {
  const store = structuredClone(loadCocktailProfiles());
  const isCustom = Boolean(store.customs[id]);
  if (isCustom) {
    delete store.customs[id];
    delete store.overrides[id];
    store.deleted = store.deleted.filter((x) => x !== id);
  } else {
    delete store.overrides[id];
    if (!store.deleted.includes(id)) store.deleted.push(id);
  }
  // options reserved for callers that know catalog vs custom
  void options;
  saveCocktailProfiles(store);
  return { deleted: true, custom: isCustom };
}

export function restoreDeletedCocktail(id: string) {
  const store = structuredClone(loadCocktailProfiles());
  store.deleted = store.deleted.filter((x) => x !== id);
  saveCocktailProfiles(store);
}

export function replaceCustomCocktail(cocktail: Cocktail) {
  return upsertCustomCocktail(cocktail);
}

export function applyPatchToCustomOrOverride(
  id: string,
  base: Cocktail,
  patch: CocktailContentPatch,
  isCustom: boolean,
): Cocktail {
  const merged = mergeCocktailContent(base, patch);
  if (isCustom) {
    upsertCustomCocktail(merged);
  } else {
    upsertCocktailContentOverride(id, patch);
  }
  return merged;
}
