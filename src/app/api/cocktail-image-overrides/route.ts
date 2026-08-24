import { NextResponse } from "next/server";
import { loadCocktailImageOverrides } from "@/lib/cocktail-image-overrides";

export const dynamic = "force-dynamic";

/** Public read of admin image overrides so the client UI can show curated photos. */
export async function GET() {
  return NextResponse.json(
    { overrides: loadCocktailImageOverrides() },
    {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    },
  );
}
