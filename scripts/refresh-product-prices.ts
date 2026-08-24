/**
 * Refresh local shelf prices for SG / HK / Shanghai / NY / Paris / Tokyo.
 *
 * Method:
 * 1. Start from catalog USD `priceCents` (synthetic NY retail bands).
 * 2. Scale by city × category USD-equivalent indices calibrated from
 *    Numbeo market alcohol prices (Aug 2026) plus published duty notes
 *    (Singapore high spirits excise; Hong Kong low alcohol tax).
 * 3. Convert to each city's currency with `USD_RATES`.
 * 4. Apply a +10% Cocktale markup.
 *
 * Sources:
 * - https://www.numbeo.com/cost-of-living/in/Singapore
 * - https://www.numbeo.com/cost-of-living/in/Tokyo
 * - https://www.numbeo.com/cost-of-living/in/Shanghai
 * - https://www.numbeo.com/cost-of-living/in/Paris
 * - https://www.numbeo.com/cost-of-living/compare_cities.jsp (NY ↔ SG, SG ↔ HK, SG ↔ Shanghai)
 * - https://wine-intelligence.com/.../singapore-s-alcohol-market... (SG spirits duty)
 * - https://hkexpatclub.com/hong-kong-vs-singapore-cost-of-living-expats/ (HK cheaper alcohol)
 *
 * Run: npx tsx scripts/refresh-product-prices.ts
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import productsData from "../src/data/products.json";
import { USD_RATES, type CurrencyCode } from "../src/lib/currency";
import {
  MARKET_LOCATIONS,
  type MarketLocationCode,
} from "../src/lib/market-locations";
import type { ProductLocationPrices, ProductPriceOverrides } from "../src/lib/product-price-types";

type ProductRow = {
  id: string;
  category: string;
  subcategory: string;
  priceCents: number;
};

const MARKUP = 1.1;

type PriceBand = "spirit" | "wine" | "beer" | "mixer" | "fresh" | "tool";

/** USD-equivalent retail index vs New York catalog (= 1.0). */
const CITY_INDEX: Record<MarketLocationCode, Record<PriceBand, number>> = {
  // Numbeo wine/beer + SG duty premium on spirits
  sg: { spirit: 1.55, wine: 1.18, beer: 1.34, mixer: 1.08, fresh: 1.05, tool: 1.12 },
  // Low alcohol tax / no GST — beer & wine much cheaper than SG/NY
  hk: { spirit: 0.88, wine: 0.8, beer: 0.55, mixer: 0.95, fresh: 0.98, tool: 1.0 },
  // Local beer/wine cheap; imported spirits + duty remain elevated
  sha: { spirit: 1.25, wine: 0.53, beer: 0.24, mixer: 0.72, fresh: 0.7, tool: 0.85 },
  ny: { spirit: 1.0, wine: 1.0, beer: 1.0, mixer: 1.0, fresh: 1.0, tool: 1.0 },
  // EU wine cheap at retail; spirits closer to NY with VAT
  par: { spirit: 1.1, wine: 0.44, beer: 0.74, mixer: 1.05, fresh: 1.08, tool: 1.1 },
  // Weak yen grocery/alcohol shelves; imported spirits still taxed
  tyo: { spirit: 1.2, wine: 0.5, beer: 0.54, mixer: 0.95, fresh: 0.92, tool: 1.05 },
};

const ZERO_DECIMAL = new Set<CurrencyCode>(["JPY", "KRW", "VND"]);

function priceBand(category: string, subcategory: string): PriceBand {
  const sub = subcategory.toLowerCase();
  if (category === "utensil" || category === "accessory" || category === "glassware") {
    return "tool";
  }
  if (sub.includes("spirit") || sub.includes("liqueur") || sub.includes("aperitif") || sub.includes("bitters")) {
    return "spirit";
  }
  if (sub.includes("wine") || sub.includes("sparkling")) return "wine";
  if (sub.includes("beer") || sub.includes("cider")) return "beer";
  if (sub.includes("fresh") || sub.includes("garnish") || sub.includes("ice")) return "fresh";
  return "mixer";
}

function toLocalCents(usdCents: number, currency: CurrencyCode): number {
  const major = (usdCents / 100) * (USD_RATES[currency] ?? 1);
  if (ZERO_DECIMAL.has(currency)) return Math.max(1, Math.round(major));
  // Keep storefront-friendly .x9 endings when possible
  const cents = Math.round(major * 100);
  if (cents < 50) return Math.max(1, cents);
  const floored = Math.floor(cents / 100) * 100;
  return floored + 99;
}

function buildPrices(product: ProductRow): ProductLocationPrices {
  const band = priceBand(product.category, product.subcategory);
  const out = {} as ProductLocationPrices;
  for (const loc of MARKET_LOCATIONS) {
    const usdEq = product.priceCents * CITY_INDEX[loc.code][band] * MARKUP;
    out[loc.code] = {
      amountCents: toLocalCents(usdEq, loc.currency),
      currency: loc.currency,
    };
  }
  return out;
}

function main() {
  const products = productsData as ProductRow[];
  const overrides: ProductPriceOverrides = {};
  for (const product of products) {
    overrides[product.id] = buildPrices(product);
  }

  const outPath = join(process.cwd(), "src", "data", "product-price-overrides.json");
  mkdirSync(join(process.cwd(), "src", "data"), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(overrides, null, 2)}\n`);

  // Local runtime mirror for admin edits during development
  const runtimePath = join(process.cwd(), "data", "product-price-overrides.json");
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(runtimePath, `${JSON.stringify(overrides, null, 2)}\n`);

  const sample = overrides[products[0]?.id];
  console.log(`Wrote ${Object.keys(overrides).length} products → ${outPath}`);
  console.log("Sample", products[0]?.id, sample);
}

main();
