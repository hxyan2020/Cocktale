import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { applyPatchToCustomOrOverride, loadCocktailProfiles, recordCocktailEdit } from "@/lib/cocktail-profiles";
import { getResolvedCocktail } from "@/lib/cocktails-server";
import { getProduct } from "@/lib/products";
import { getProductCopyOverride, saveProductCopy } from "@/lib/product-content";
import type { Cocktail } from "@/lib/types";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  kind: z.enum(["cocktail", "product"]),
  id: z.string().min(1).max(160),
  field: z.string().min(1).max(80),
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  selectedText: z.string().min(1).max(4000),
  replacement: z.string().min(1).max(8000),
});

function cocktailField(cocktail: Cocktail, field: string): string | null {
  if (field === "description" || field === "story" || field === "origin") return cocktail[field] || "";
  if (field.startsWith("instruction:")) {
    const index = Number(field.slice("instruction:".length));
    if (!Number.isInteger(index) || index < 0) return null;
    return cocktail.instructions[index] ?? null;
  }
  return null;
}

function replaceSlice(value: string, start: number, end: number, selectedText: string, replacement: string) {
  if (end < start || end > value.length) return null;
  if (value.slice(start, end) !== selectedText) {
    const at = value.indexOf(selectedText);
    if (at < 0 || value.indexOf(selectedText, at + 1) !== -1) return null;
    return value.slice(0, at) + replacement + value.slice(at + selectedText.length);
  }
  return value.slice(0, start) + replacement + value.slice(end);
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid passage edit" }, { status: 400 });
  }

  const { kind, id, field, start, end, selectedText, replacement } = parsed.data;

  if (kind === "product") {
    if (field !== "description" && field !== "longDescription") {
      return NextResponse.json({ error: "That product field cannot be edited here." }, { status: 400 });
    }
    const product = getProduct(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const current = getProductCopyOverride(id)?.[field] ?? product[field] ?? "";
    const next = replaceSlice(current, start, end, selectedText, replacement);
    if (next == null) {
      return NextResponse.json(
        { error: "That selection no longer matches the saved text. Refresh and select it again." },
        { status: 409 },
      );
    }
    const saved = saveProductCopy(id, { [field]: next }, "ai", field);
    return NextResponse.json({ text: next, editorial: saved.editorial });
  }

  const cocktail = getResolvedCocktail(id);
  if (!cocktail) return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  const current = cocktailField(cocktail, field);
  if (current == null) {
    return NextResponse.json({ error: "That cocktail field cannot be edited here." }, { status: 400 });
  }
  const next = replaceSlice(current, start, end, selectedText, replacement);
  if (next == null) {
    return NextResponse.json(
      { error: "That selection no longer matches the saved text. Refresh and select it again." },
      { status: 409 },
    );
  }

  const isCustom = Boolean(loadCocktailProfiles().customs[id]);
  if (field.startsWith("instruction:")) {
    const index = Number(field.slice("instruction:".length));
    const instructions = [...cocktail.instructions];
    instructions[index] = next;
    applyPatchToCustomOrOverride(id, cocktail, { instructions }, isCustom);
  } else if (field === "description" || field === "story" || field === "origin") {
    applyPatchToCustomOrOverride(id, cocktail, { [field]: next }, isCustom);
  }

  const profiles = loadCocktailProfiles();
  const mode = profiles.editorial[id] ? "update" : isCustom ? "create" : "catalog";
  const editorial = recordCocktailEdit(id, "ai", [field], mode);
  return NextResponse.json({ text: next, editorial });
}
