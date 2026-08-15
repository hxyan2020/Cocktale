import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import cocktails from "../src/data/cocktails.json";

type AuditResult = {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
};

const MIN_EDGE = 640;
const MIN_PIXELS = 640 * 640;
const CONCURRENCY = 10;

async function auditImage(cocktail: (typeof cocktails)[number]): Promise<AuditResult> {
  if (!cocktail.image) {
    return { id: cocktail.id, name: cocktail.name, url: "", error: "Missing URL" };
  }

  try {
    const buffer = cocktail.image.startsWith("/")
      ? await readFile(join(process.cwd(), "public", cocktail.image))
      : await fetch(cocktail.image, {
          headers: { "User-Agent": "Cocktale image quality audit" },
        }).then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return Buffer.from(await response.arrayBuffer());
        });
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    return {
      id: cocktail.id,
      name: cocktail.name,
      url: cocktail.image,
      width,
      height,
      bytes: buffer.byteLength,
      error:
        width < MIN_EDGE || height < MIN_EDGE || width * height < MIN_PIXELS
          ? `Below ${MIN_EDGE}px quality floor`
          : undefined,
    };
  } catch (error) {
    return {
      id: cocktail.id,
      name: cocktail.name,
      url: cocktail.image,
      error: error instanceof Error ? error.message : "Image check failed",
    };
  }
}

async function main() {
  const results: AuditResult[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < cocktails.length) {
      const cocktail = cocktails[cursor++];
      results.push(await auditImage(cocktail));
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  const failures = results.filter((result) => result.error);
  const dimensions = results.filter(
    (result): result is AuditResult & { width: number; height: number } =>
      Boolean(result.width && result.height),
  );

  console.log(
    JSON.stringify(
      {
        cocktails: cocktails.length,
        reachable: results.length - failures.filter((result) => !result.width).length,
        passingQualityFloor: results.length - failures.length,
        minimumWidth: Math.min(...dimensions.map((result) => result.width)),
        minimumHeight: Math.min(...dimensions.map((result) => result.height)),
        failures,
      },
      null,
      2,
    ),
  );

  if (failures.length) process.exitCode = 1;
}

void main();
