import { NextResponse } from "next/server";
import { loadProductPriceOverrides } from "@/lib/product-price-overrides";
import { MARKET_LOCATIONS } from "@/lib/market-locations";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      locations: MARKET_LOCATIONS,
      overrides: loadProductPriceOverrides(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    },
  );
}
