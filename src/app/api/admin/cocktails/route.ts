import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { getAllCocktailsForAdmin } from "@/lib/cocktails-server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const rows = getAllCocktailsForAdmin()
    .filter((cocktail) => {
      if (!q) return true;
      return (
        cocktail.name.toLowerCase().includes(q) ||
        cocktail.id.toLowerCase().includes(q) ||
        cocktail.category.toLowerCase().includes(q) ||
        cocktail.glass.toLowerCase().includes(q)
      );
    })
    .map((cocktail) => ({
      id: cocktail.id,
      name: cocktail.name,
      category: cocktail.category,
      glass: cocktail.glass,
      image: cocktail.image,
      catalogImage: cocktail.catalogImage,
      overrideImage: cocktail.overrideImage,
      gallery: cocktail.gallery,
      hasOverride: cocktail.hasOverride,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(
    { count: rows.length, cocktails: rows },
    { headers: { "Cache-Control": "no-store" } },
  );
}
