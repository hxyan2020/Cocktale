import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { emptyCocktailDraft, slugifyCocktailId, WEATHER_BUCKETS } from "@/lib/cocktail-profile-types";
import { upsertCustomCocktail } from "@/lib/cocktail-profiles";
import { getAllCocktailsForAdmin, getResolvedCocktail } from "@/lib/cocktails-server";
import type { Cocktail } from "@/lib/types";

export const dynamic = "force-dynamic";

const ingredientSchema = z.object({
  name: z.string(),
  measure: z.string().nullable(),
});

const cocktailBodySchema = z.object({
  name: z.string().min(1).max(120),
  alternateName: z.string().nullable().optional(),
  image: z.string().optional(),
  category: z.string().min(1).max(80),
  iba: z.string().nullable().optional(),
  alcoholic: z.boolean(),
  glass: z.string().min(1).max(80),
  origin: z.string().max(200),
  description: z.string().max(2000),
  story: z.string().max(12000),
  ingredients: z.array(ingredientSchema).min(1).max(40),
  instructions: z.array(z.string()).min(1).max(40),
  tags: z.array(z.string()).max(40),
  moods: z.array(z.string()).max(40),
  situations: z.array(z.string()).max(40),
  suitableFor: z.array(z.string()).max(40),
  weatherAffinity: z
    .array(z.enum(["hot", "warm", "mild", "cool", "cold", "rainy"]))
    .max(10),
  popularity: z.number().min(0).max(100),
  flavorProfile: z.array(z.string()).max(40),
});

export async function GET(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const includeDeleted = searchParams.get("includeDeleted") === "1";

  const rows = getAllCocktailsForAdmin()
    .filter((cocktail) => {
      if (!includeDeleted && cocktail.isDeleted) return false;
      if (!q) return true;
      return (
        cocktail.name.toLowerCase().includes(q) ||
        cocktail.id.toLowerCase().includes(q) ||
        cocktail.category.toLowerCase().includes(q) ||
        cocktail.glass.toLowerCase().includes(q) ||
        cocktail.origin.toLowerCase().includes(q)
      );
    })
    .map((cocktail) => ({
      id: cocktail.id,
      name: cocktail.name,
      category: cocktail.category,
      glass: cocktail.glass,
      origin: cocktail.origin,
      image: cocktail.image,
      catalogImage: cocktail.catalogImage,
      overrideImage: cocktail.overrideImage,
      gallery: cocktail.gallery,
      alcoholic: cocktail.alcoholic,
      isCustom: cocktail.isCustom,
      isDeleted: cocktail.isDeleted,
      hasContentOverride: cocktail.hasContentOverride,
      hasImageOverride: cocktail.hasImageOverride,
      hasOverride: cocktail.hasOverride,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(
    { count: rows.length, cocktails: rows },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = cocktailBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cocktail payload" }, { status: 400 });
  }

  const id = slugifyCocktailId(parsed.data.name);
  const cocktail: Cocktail = {
    ...emptyCocktailDraft(id),
    ...parsed.data,
    id,
    alternateName: parsed.data.alternateName ?? null,
    iba: parsed.data.iba ?? null,
    image: parsed.data.image || "/cocktail-fallback.svg",
    ingredients: parsed.data.ingredients
      .map((i) => ({ name: i.name.trim(), measure: i.measure?.trim() || null }))
      .filter((i) => i.name),
    instructions: parsed.data.instructions.map((s) => s.trim()).filter(Boolean),
    tags: parsed.data.tags.map((t) => t.trim()).filter(Boolean),
    moods: parsed.data.moods.map((t) => t.trim()).filter(Boolean),
    situations: parsed.data.situations.map((t) => t.trim()).filter(Boolean),
    suitableFor: parsed.data.suitableFor.map((t) => t.trim()).filter(Boolean),
    weatherAffinity: parsed.data.weatherAffinity.filter((w) =>
      (WEATHER_BUCKETS as string[]).includes(w),
    ),
    flavorProfile: parsed.data.flavorProfile.map((t) => t.trim()).filter(Boolean),
  };

  if (cocktail.ingredients.length === 0) {
    return NextResponse.json({ error: "At least one ingredient is required" }, { status: 400 });
  }
  if (cocktail.instructions.length === 0) {
    return NextResponse.json({ error: "At least one instruction is required" }, { status: 400 });
  }

  upsertCustomCocktail(cocktail);
  return NextResponse.json({ ok: true, cocktail: getResolvedCocktail(id) });
}
