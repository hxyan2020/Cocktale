import { NextRequest, NextResponse } from "next/server";
import { fetchWikiCocktailPhotos } from "@/lib/wiki-cocktail-photos";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim() || "";
  if (!name) {
    return NextResponse.json({ photos: [] });
  }

  try {
    const photos = await fetchWikiCocktailPhotos(name, 5);
    return NextResponse.json(
      { photos },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
