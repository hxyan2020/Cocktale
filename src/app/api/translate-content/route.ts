import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocaleCode } from "@/i18n/locales";

const requestSchema = z.object({
  locale: z.string(),
  texts: z.array(z.string().max(2000)).max(120),
}).refine(
  ({ texts }) => texts.reduce((sum, text) => sum + text.length, 0) <= 25_000,
  "Translation request is too large",
);

const TARGETS: Record<string, string> = {
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  he: "iw",
};

const cache = new Map<string, string>();
const MAX_BATCH_CHARS = 1800;
const MARKER_PREFIX = "9876543210";

function translatedText(data: unknown): string {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return "";
  return (data[0] as unknown[])
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""))
    .join("");
}

async function translateBatch(texts: string[], locale: string): Promise<string[]> {
  if (texts.length === 0) return [];
  const markers = texts.slice(0, -1).map((_, index) => `[[[${MARKER_PREFIX}_${index}]]]`);
  const joined = texts
    .map((text, index) => (index < markers.length ? `${text}\n${markers[index]}\n` : text))
    .join("");
  const target = TARGETS[locale] ?? locale.split("-")[0];
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", joined);

  const response = await fetch(url, {
    headers: { "User-Agent": "Cocktale/1.0" },
    next: { revalidate: 2_592_000 },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Translation service returned ${response.status}`);
  const output = translatedText(await response.json());
  if (!output) throw new Error("Translation service returned no text");

  const markerPattern = new RegExp(
    `\\s*\\[\\[\\[${MARKER_PREFIX}_(\\d+)\\]\\]\\]\\s*`,
    "g",
  );
  const parts = output.split(markerPattern).filter((_, index) => index % 2 === 0);
  if (parts.length !== texts.length) throw new Error("Translation response could not be separated");
  return parts.map((part) => part.trim());
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success || !isLocaleCode(parsed.data.locale)) {
      return NextResponse.json({ error: "Invalid translation request" }, { status: 400 });
    }

    const { locale, texts } = parsed.data;
    if (locale === "en" || texts.length === 0) {
      return NextResponse.json({ translations: texts });
    }

    const translations = [...texts];
    const missing: Array<{ index: number; text: string }> = [];
    texts.forEach((text, index) => {
      const normalized = text.trim();
      if (!normalized) {
        translations[index] = text;
        return;
      }
      const key = `${locale}\u0000${normalized}`;
      const existing = cache.get(key);
      if (existing) translations[index] = existing;
      else missing.push({ index, text: normalized });
    });

    const batches: Array<Array<{ index: number; text: string }>> = [];
    for (const item of missing) {
      const current = batches.at(-1);
      const currentLength = current?.reduce((sum, entry) => sum + entry.text.length, 0) ?? 0;
      if (!current || currentLength + item.text.length > MAX_BATCH_CHARS) batches.push([item]);
      else current.push(item);
    }

    for (const batch of batches) {
      const output = await translateBatch(
        batch.map((entry) => entry.text),
        locale,
      );
      output.forEach((translated, batchIndex) => {
        const source = batch[batchIndex];
        translations[source.index] = translated || source.text;
        cache.set(`${locale}\u0000${source.text}`, translations[source.index]);
      });
    }

    return NextResponse.json(
      { translations },
      { headers: { "Cache-Control": "private, max-age=86400" } },
    );
  } catch (error) {
    console.error("content translation failed", error);
    return NextResponse.json({ error: "Translation temporarily unavailable" }, { status: 502 });
  }
}
