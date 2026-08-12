import { NextResponse } from "next/server";
import { z } from "zod";
import { buildTranslationRows } from "@/lib/i18n-catalog";
import { LOCALES } from "@/i18n/locales";
import { loadOverrides, mergeLocaleStrings, parseLocale } from "@/lib/i18n-overrides";

export const dynamic = "force-dynamic";

const putSchema = z.object({
  locale: z.string(),
  strings: z.record(z.string(), z.string()),
});

export async function GET() {
  const overrides = loadOverrides();
  return NextResponse.json(
    {
      locales: LOCALES.filter((l) => l.code !== "en"),
      rows: buildTranslationRows(overrides),
      overrides,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(req: Request) {
  const json = await req.json();
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const locale = parseLocale(parsed.data.locale);
  if (!locale) {
    return NextResponse.json({ error: "Pick a non-English language to edit" }, { status: 400 });
  }
  const overrides = mergeLocaleStrings(locale, parsed.data.strings);
  return NextResponse.json({
    ok: true,
    locale,
    rows: buildTranslationRows(overrides),
    overrides,
  });
}
