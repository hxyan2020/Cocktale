import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ filename: string }> };

const SAFE_NAME = /^[a-zA-Z0-9_-]+\.(jpe?g|png|webp|gif|svg)$/i;

export async function GET(_req: Request, context: RouteContext) {
  const { filename } = await context.params;
  if (!SAFE_NAME.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = join(process.cwd(), "data", "cocktail-uploads", filename);
  try {
    const bytes = readFileSync(filePath);
    const lower = filename.toLowerCase();
    const contentType = lower.endsWith(".png")
      ? "image/png"
      : lower.endsWith(".webp")
        ? "image/webp"
        : lower.endsWith(".gif")
          ? "image/gif"
          : lower.endsWith(".svg")
            ? "image/svg+xml"
            : "image/jpeg";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
