import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import seedOverrides from "@/data/product-price-overrides.json";
import {
  normalizeLocationPrices,
  type ProductLocationPrices,
  type ProductPriceOverrides,
} from "@/lib/product-price-types";
import { isMarketLocationCode, type MarketLocationCode } from "@/lib/market-locations";

export type { ProductLocationPrices, ProductPriceOverrides };

/** Writable runtime path (DigitalOcean). Gitignored `/data/` folder. */
const RUNTIME_PATHS = ["data/product-price-overrides.json"];

let cache: ProductPriceOverrides | null = null;

function runtimePaths() {
  return RUNTIME_PATHS.map((rel) => join(process.cwd(), rel));
}

function readRuntimeOverrides(): ProductPriceOverrides | null {
  for (const file of runtimePaths()) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as ProductPriceOverrides;
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        return parsed;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export function loadProductPriceOverrides(): ProductPriceOverrides {
  if (cache) return cache;
  const runtime = readRuntimeOverrides();
  cache = runtime || (seedOverrides as ProductPriceOverrides);
  return cache;
}

export function saveProductPriceOverrides(next: ProductPriceOverrides) {
  cache = next;
  const json = `${JSON.stringify(next, null, 2)}\n`;
  for (const file of runtimePaths()) {
    try {
      mkdirSync(join(file, ".."), { recursive: true });
      writeFileSync(file, json);
    } catch {
      // Vercel / read-only paths are skipped; in-memory cache still applies.
    }
  }
}

export function getProductLocationPrices(productId: string): ProductLocationPrices | undefined {
  const row = loadProductPriceOverrides()[productId];
  return row ? normalizeLocationPrices(row) : undefined;
}

export function upsertProductLocationPrices(
  productId: string,
  prices: Partial<Record<MarketLocationCode, { amountCents: number }>>,
): ProductLocationPrices {
  const current = structuredClone(loadProductPriceOverrides());
  const existing = normalizeLocationPrices(current[productId]);
  for (const [code, value] of Object.entries(prices)) {
    if (!isMarketLocationCode(code) || !value) continue;
    const amount = Number(value.amountCents);
    if (!Number.isFinite(amount) || amount < 0) continue;
    existing[code] = {
      ...existing[code],
      amountCents: Math.round(amount),
    };
  }
  current[productId] = existing;
  saveProductPriceOverrides(current);
  return existing;
}

export function replaceAllProductPriceOverrides(next: ProductPriceOverrides) {
  const normalized: ProductPriceOverrides = {};
  for (const [id, prices] of Object.entries(next)) {
    normalized[id] = normalizeLocationPrices(prices);
  }
  saveProductPriceOverrides(normalized);
  return normalized;
}
