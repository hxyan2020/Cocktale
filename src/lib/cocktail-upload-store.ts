import "server-only";

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { put } from "@vercel/blob";

const MAX_DATA_URL_BYTES = 1.5 * 1024 * 1024;

export type StoredCocktailImage = {
  url: string;
  storage: "blob" | "local" | "data-url";
};

function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  return "jpg";
}

async function storeInVercelBlob(
  filename: string,
  bytes: Buffer,
  contentType: string,
): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const blob = await put(`cocktails/${filename}`, bytes, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return blob.url;
  } catch {
    return null;
  }
}

function storeOnLocalDisk(filename: string, bytes: Buffer): string | null {
  const dataDir = join(process.cwd(), "data", "cocktail-uploads");
  const publicDir = join(process.cwd(), "public", "cocktails");

  try {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(join(dataDir, filename), bytes);
    return `/api/media/cocktails/${filename}`;
  } catch {
    // fall through
  }

  try {
    mkdirSync(publicDir, { recursive: true });
    writeFileSync(join(publicDir, filename), bytes);
    return `/cocktails/${filename}`;
  } catch {
    return null;
  }
}

function storeAsDataUrl(bytes: Buffer, contentType: string): string | null {
  if (bytes.length > MAX_DATA_URL_BYTES) return null;
  const mime = contentType.startsWith("image/") ? contentType : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

/**
 * Persist an admin-uploaded cocktail image.
 * Prefers Vercel Blob, then local disk (DO / writable hosts), then compact data URLs.
 */
export async function storeCocktailUpload(opts: {
  cocktailId: string;
  bytes: Buffer;
  contentType: string;
}): Promise<StoredCocktailImage> {
  const ext = extensionFor(opts.contentType);
  const safeId = opts.cocktailId.replace(/[^a-zA-Z0-9_-]/g, "") || "cocktail";
  const filename = `${safeId}-${Date.now()}.${ext}`;

  const blobUrl = await storeInVercelBlob(filename, opts.bytes, opts.contentType);
  if (blobUrl) return { url: blobUrl, storage: "blob" };

  const localUrl = storeOnLocalDisk(filename, opts.bytes);
  if (localUrl) return { url: localUrl, storage: "local" };

  const dataUrl = storeAsDataUrl(opts.bytes, opts.contentType);
  if (dataUrl) return { url: dataUrl, storage: "data-url" };

  throw new Error(
    "Could not store image. Add BLOB_READ_WRITE_TOKEN for Vercel, use a smaller image (under 1.5MB), or upload on the droplet host.",
  );
}

export function isAllowedCocktailImageRef(value: string): boolean {
  if (!value) return false;
  if (value.startsWith("data:image/")) return true;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
