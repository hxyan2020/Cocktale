import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import products from "../src/data/products.json";

const OUTPUT_DIR = join(process.cwd(), "public", "utensils");
const DELAY_MS = 1100;
const RETRIES = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(url: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Cocktale/1.0 utensil photo cache (https://github.com/hxyan2020/Cocktale)",
        },
      });
      if (response.ok) return Buffer.from(await response.arrayBuffer());
      lastError = new Error(`HTTP ${response.status}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    await sleep(2500 * (attempt + 1));
  }
  throw lastError;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const equipment = products.filter(
    (product) => product.category === "utensil" || product.sourceKey === "ice",
  );

  for (const [index, product] of equipment.entries()) {
    const source = product.images[0]?.url;
    if (!source) throw new Error(`${product.sourceKey}: missing source image`);
    const original = await download(source);
    const normalized = await sharp(original)
      .resize(720, 420, {
        fit: "contain",
        background: "#f3efe6",
        withoutEnlargement: false,
        kernel: "lanczos3",
      })
      .sharpen({ sigma: 0.6 })
      .webp({ quality: 90, effort: 6 })
      .toBuffer();
    await writeFile(join(OUTPUT_DIR, `${product.sourceKey}.webp`), normalized);
    console.log(`${index + 1}/${equipment.length} ${product.sourceKey}`);
    await sleep(DELAY_MS);
  }
}

void main();
