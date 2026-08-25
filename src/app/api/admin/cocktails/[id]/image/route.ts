import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { getCatalogCocktail, getResolvedCocktail } from "@/lib/cocktails-server";
import {
  clearCocktailImageOverride,
  cocktailFallbackImage,
  getCocktailImageOverride,
  upsertCocktailImageOverride,
} from "@/lib/cocktail-image-overrides";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  image: z
    .union([
      z.string().url(),
      z.string().regex(/^\/.+/),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  gallery: z
    .array(z.union([z.string().url(), z.string().regex(/^\/.+/)]))
    .optional(),
  restore: z.boolean().optional(),
});


function adminCocktailPayload(id: string) {
  const catalog = getCatalogCocktail(id);
  if (!catalog) return null;
  const resolved = getResolvedCocktail(id) || catalog;
  const override = getCocktailImageOverride(id);
  const hasImageOverride = Boolean(
    override && Object.prototype.hasOwnProperty.call(override, "image"),
  );
  return {
    id: catalog.id,
    name: resolved.name,
    category: resolved.category,
    glass: resolved.glass,
    image: resolved.image || catalog.image,
    catalogImage: catalog.image,
    overrideImage: hasImageOverride ? (override?.image ?? null) : undefined,
    gallery: override?.gallery ?? [],
    hasOverride: Boolean(
      override && (hasImageOverride || (override.gallery?.length ?? 0) > 0),
    ),
    fallbackImage: cocktailFallbackImage(),
  };
}

export async function GET(_req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  const payload = adminCocktailPayload(id);
  if (!payload) return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  if (!getCatalogCocktail(id)) {
    return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.restore) {
    clearCocktailImageOverride(id);
  } else {
    const patch: { image?: string | null; gallery?: string[] } = {};
    if (Object.prototype.hasOwnProperty.call(parsed.data, "image")) {
      patch.image = parsed.data.image ?? null;
    }
    if (parsed.data.gallery) {
      patch.gallery = [...new Set(parsed.data.gallery.map((url) => url.trim()).filter(Boolean))];
    }
    upsertCocktailImageOverride(id, patch);
  }

  return NextResponse.json({ ok: true, cocktail: adminCocktailPayload(id) });
}

export async function POST(req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  if (!getCatalogCocktail(id)) {
    return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  const file = form.get("file");
  const target = String(form.get("target") || "primary");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `${safeId}-${Date.now()}.${ext}`;
  const dir = join(process.cwd(), "public", "cocktails");
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), bytes);
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not write image on this host. Use an image URL instead, or deploy on a writable filesystem.",
      },
      { status: 500 },
    );
  }

  const publicUrl = `/cocktails/${filename}`;
  if (target === "gallery") {
    const existing = getCocktailImageOverride(id)?.gallery ?? [];
    upsertCocktailImageOverride(id, { gallery: [...existing, publicUrl] });
  } else {
    upsertCocktailImageOverride(id, { image: publicUrl });
  }

  return NextResponse.json({ ok: true, url: publicUrl, cocktail: adminCocktailPayload(id) });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  if (!getCatalogCocktail(id)) {
    return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  }
  upsertCocktailImageOverride(id, { image: null });
  return NextResponse.json({ ok: true, cocktail: adminCocktailPayload(id) });
}
