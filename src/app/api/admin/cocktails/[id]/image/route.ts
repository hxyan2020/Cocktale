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
import {
  MAX_COCKTAIL_IMAGES,
  cocktailImageSlotCount,
  remainingCocktailImageSlots,
} from "@/lib/cocktail-image-types";
import { isAllowedCocktailImageRef, storeCocktailUpload } from "@/lib/cocktail-upload-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const imageRefSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/.+/),
  z.string().regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,/),
  z.literal(""),
  z.null(),
]);

const patchSchema = z.object({
  image: imageRefSchema.optional(),
  gallery: z.array(imageRefSchema).max(MAX_COCKTAIL_IMAGES).optional(),
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
    const catalog = getCatalogCocktail(id);
    const patch: { image?: string | null; gallery?: string[] } = {};
    if (Object.prototype.hasOwnProperty.call(parsed.data, "image")) {
      patch.image = parsed.data.image ?? null;
    }
    if (parsed.data.gallery) {
      const gallery = [
        ...new Set(
          parsed.data.gallery
            .map((url) => (typeof url === "string" ? url.trim() : ""))
            .filter((url) => url && isAllowedCocktailImageRef(url)),
        ),
      ];
      const resolved = getResolvedCocktail(id) || catalog;
      const primary =
        Object.prototype.hasOwnProperty.call(patch, "image")
          ? patch.image || cocktailFallbackImage()
          : resolved?.image || catalog?.image || cocktailFallbackImage();
      if (cocktailImageSlotCount(primary, gallery) > MAX_COCKTAIL_IMAGES) {
        return NextResponse.json(
          { error: `A cocktail can have at most ${MAX_COCKTAIL_IMAGES} images (including primary).` },
          { status: 400 },
        );
      }
      patch.gallery = gallery;
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
  let stored;
  try {
    stored = await storeCocktailUpload({
      cocktailId: id,
      bytes,
      contentType: file.type || "image/jpeg",
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 500 },
    );
  }

  const publicUrl = stored.url;
  const resolved = getResolvedCocktail(id) || getCatalogCocktail(id);
  if (target === "gallery") {
    const existing = getCocktailImageOverride(id)?.gallery ?? [];
    const primary = resolved?.image || cocktailFallbackImage();
    if (remainingCocktailImageSlots(primary, existing) < 1) {
      return NextResponse.json(
        { error: `Gallery is full (${MAX_COCKTAIL_IMAGES} images max including primary).` },
        { status: 400 },
      );
    }
    upsertCocktailImageOverride(id, { gallery: [...existing, publicUrl] });
  } else {
    upsertCocktailImageOverride(id, { image: publicUrl });
  }

  return NextResponse.json({
    ok: true,
    url: publicUrl,
    storage: stored.storage,
    cocktail: adminCocktailPayload(id),
  });
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
