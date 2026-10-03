import { NextResponse } from "next/server";
import { loadProductContent } from "@/lib/product-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = loadProductContent();
  return NextResponse.json(
    { overrides: store.overrides, editorial: store.editorial },
    { headers: { "Cache-Control": "no-store" } },
  );
}
