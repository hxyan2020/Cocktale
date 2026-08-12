import { NextResponse } from "next/server";
import { loadOverrides } from "@/lib/i18n-overrides";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(loadOverrides(), {
    headers: { "Cache-Control": "no-store" },
  });
}
