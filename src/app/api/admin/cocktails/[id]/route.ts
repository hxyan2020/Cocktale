import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { clearCocktailImageOverride } from "@/lib/cocktail-image-overrides";
import { WEATHER_BUCKETS } from "@/lib/cocktail-profile-types";
import {
  clearCocktailContentOverride,
  deleteCocktailProfile,
  loadCocktailProfiles,
  restoreDeletedCocktail,
  upsertCocktailContentOverride,
  upsertCustomCocktail,
} from "@/lib/cocktail-profiles";
import { getCatalogCocktail, getResolvedCocktail } from "@/lib/cocktails-server";
import type { Cocktail } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

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
  restoreContent: z.boolean().optional(),
  restoreDeleted: z.boolean().optional(),
});

function sanitize(data: z.infer<typeof cocktailBodySchema>, id: string, existingImage: string): Cocktail {
  return {
    id,
    name: data.name.trim(),
    alternateName: data.alternateName?.trim() || null,
    image: data.image?.trim() || existingImage || "/cocktail-fallback.svg",
    category: data.category.trim(),
    iba: data.iba?.trim() || null,
    alcoholic: data.alcoholic,
    glass: data.glass.trim(),
    origin: data.origin.trim(),
    description: data.description.trim(),
    story: data.story.trim(),
    ingredients: data.ingredients
      .map((i) => ({ name: i.name.trim(), measure: i.measure?.trim() || null }))
      .filter((i) => i.name),
    instructions: data.instructions.map((s) => s.trim()).filter(Boolean),
    tags: data.tags.map((t) => t.trim()).filter(Boolean),
    moods: data.moods.map((t) => t.trim()).filter(Boolean),
    situations: data.situations.map((t) => t.trim()).filter(Boolean),
    suitableFor: data.suitableFor.map((t) => t.trim()).filter(Boolean),
    weatherAffinity: data.weatherAffinity.filter((w) =>
      (WEATHER_BUCKETS as string[]).includes(w),
    ),
    popularity: Math.round(data.popularity),
    flavorProfile: data.flavorProfile.map((t) => t.trim()).filter(Boolean),
  };
}

function detailPayload(id: string) {
  const profiles = loadCocktailProfiles();
  const isCustom = Boolean(profiles.customs[id]);
  const isDeleted = profiles.deleted.includes(id);
  const catalog = getCatalogCocktail(id);
  const resolved = getResolvedCocktail(id);

  if (!resolved && !isDeleted) {
    if (!catalog && !profiles.customs[id]) return null;
  }

  const cocktail =
    resolved ||
    (profiles.customs[id]
      ? { ...profiles.customs[id], ...profiles.overrides[id], id }
      : catalog
        ? { ...catalog, ...profiles.overrides[id], id }
        : null);

  if (!cocktail) return null;

  return {
    cocktail,
    catalog: isCustom ? null : getCatalogCocktail(id),
    isCustom,
    isDeleted,
    hasContentOverride: Boolean(profiles.overrides[id]),
  };
}

export async function GET(_req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  const payload = detailPayload(id);
  if (!payload) return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  const json = await req.json().catch(() => null);
  const parsed = cocktailBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cocktail payload" }, { status: 400 });
  }

  const profiles = loadCocktailProfiles();

  if (parsed.data.restoreDeleted) {
    restoreDeletedCocktail(id);
    return NextResponse.json({ ok: true, ...detailPayload(id) });
  }

  if (parsed.data.restoreContent) {
    if (profiles.customs[id]) {
      return NextResponse.json(
        { error: "Custom cocktails have no catalog restore; edit or delete instead." },
        { status: 400 },
      );
    }
    clearCocktailContentOverride(id);
    return NextResponse.json({ ok: true, ...detailPayload(id) });
  }

  const existing = getResolvedCocktail(id) || profiles.customs[id] || getCatalogCocktail(id);
  if (!existing && !profiles.deleted.includes(id)) {
    return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  }

  const cocktail = sanitize(parsed.data, id, existing?.image || "/cocktail-fallback.svg");
  if (cocktail.ingredients.length === 0) {
    return NextResponse.json({ error: "At least one ingredient is required" }, { status: 400 });
  }
  if (cocktail.instructions.length === 0) {
    return NextResponse.json({ error: "At least one instruction is required" }, { status: 400 });
  }

  const isCustom = Boolean(profiles.customs[id]);
  if (isCustom) {
    upsertCustomCocktail(cocktail);
  } else {
    const { id: _id, ...patch } = cocktail;
    void _id;
    upsertCocktailContentOverride(id, patch);
  }

  return NextResponse.json({ ok: true, ...detailPayload(id) });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  const profiles = loadCocktailProfiles();
  const exists =
    Boolean(profiles.customs[id]) ||
    Boolean(getCatalogCocktail(id)) ||
    profiles.deleted.includes(id);
  if (!exists) {
    return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  }

  deleteCocktailProfile(id);
  clearCocktailImageOverride(id);
  return NextResponse.json({ ok: true, id });
}
