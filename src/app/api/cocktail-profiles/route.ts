import { NextResponse } from "next/server";
import { loadCocktailProfiles } from "@/lib/cocktail-profiles";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { store: loadCocktailProfiles() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    },
  );
}
