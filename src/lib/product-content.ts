import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  touchEditorial,
  type CocktailEditorial,
} from "@/lib/cocktail-profile-types";

export type ProductCopyPatch = {
  description?: string;
  longDescription?: string;
};

export type ProductContentStore = {
  overrides: Record<string, ProductCopyPatch>;
  editorial: Record<string, CocktailEditorial>;
};

const RUNTIME_PATHS = ["data/product-content.json"];

let cache: ProductContentStore | null = null;

function emptyStore(): ProductContentStore {
  return { overrides: {}, editorial: {} };
}

function runtimePaths() {
  return RUNTIME_PATHS.map((rel) => join(process.cwd(), rel));
}

function normalize(raw: unknown): ProductContentStore {
  const base = emptyStore();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ProductContentStore>;
  if (data.overrides && typeof data.overrides === "object") base.overrides = { ...data.overrides };
  if (data.editorial && typeof data.editorial === "object") base.editorial = { ...data.editorial };
  return base;
}

export function loadProductContent(): ProductContentStore {
  if (cache) return cache;
  for (const file of runtimePaths()) {
    try {
      cache = normalize(JSON.parse(readFileSync(file, "utf8")));
      return cache;
    } catch {
      // try next
    }
  }
  cache = emptyStore();
  return cache;
}

export function saveProductContent(next: ProductContentStore) {
  cache = normalize(next);
  const json = `${JSON.stringify(cache, null, 2)}\n`;
  for (const file of runtimePaths()) {
    try {
      mkdirSync(join(file, ".."), { recursive: true });
      writeFileSync(file, json);
    } catch {
      // Vercel read-only: keep memory cache
    }
  }
}

export function getProductCopyOverride(id: string): ProductCopyPatch | undefined {
  return loadProductContent().overrides[id];
}

export function getProductEditorial(id: string): CocktailEditorial | undefined {
  return loadProductContent().editorial[id];
}

export function saveProductCopy(id: string, patch: ProductCopyPatch, source: "human" | "ai", field: string) {
  const store = structuredClone(loadProductContent());
  store.overrides[id] = { ...store.overrides[id], ...patch };
  const mode = store.editorial[id] ? "update" : "catalog";
  store.editorial[id] = touchEditorial(store.editorial[id], source, [field], mode);
  saveProductContent(store);
  return {
    copy: store.overrides[id],
    editorial: store.editorial[id],
  };
}
