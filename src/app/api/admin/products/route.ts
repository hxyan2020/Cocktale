import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { MARKET_LOCATIONS } from "@/lib/market-locations";
import { getAllProducts } from "@/lib/products";
import { loadProductPriceOverrides } from "@/lib/product-price-overrides";
import {
  emptyLocationPrices,
  normalizeLocationPrices,
  resolveProductUsdCents,
} from "@/lib/product-price-types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const overrides = loadProductPriceOverrides();

  const products = getAllProducts()
    .filter((product) => {
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.id.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.subcategory.toLowerCase().includes(q)
      );
    })
    .map((product) => {
      const prices = normalizeLocationPrices(overrides[product.id] || emptyLocationPrices());
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        unit: product.unit,
        catalogUsdCents: product.priceCents,
        resolvedUsdCents: resolveProductUsdCents(product.id, product.priceCents, overrides),
        image: product.images[0]?.url || "/cocktail-fallback.svg",
        prices,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(
    {
      count: products.length,
      locations: MARKET_LOCATIONS,
      products,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
