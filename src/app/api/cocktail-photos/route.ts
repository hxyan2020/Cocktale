import { NextRequest, NextResponse } from "next/server";
import { mergeCocktailGallery } from "@/lib/cocktail-gallery";
import { getResolvedCocktail } from "@/lib/cocktails-server";
import { fetchOpenverseCocktailPhotos } from "@/lib/openverse-cocktail-photos";
import { fetchWikiCocktailPhotos } from "@/lib/wiki-cocktail-photos";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim() || "";
  const cocktail = getResolvedCocktail(id);
  if (!cocktail) {
    return NextResponse.json({ photos: [] });
  }

  try {
    const wikiPhotos = await fetchWikiCocktailPhotos(cocktail.name, 5);
    const openversePhotos =
      wikiPhotos.length >= 5
        ? []
        : await fetchOpenverseCocktailPhotos(cocktail.name, 5 - wikiPhotos.length);
    const photos = mergeCocktailGallery([], [...wikiPhotos, ...openversePhotos], 5);
    return NextResponse.json(
      { photos },
      {
        headers: {
          "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=7776000",
        },
      },
    );
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
