import { NextResponse } from "next/server";
import { googleConfigured } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { configured: googleConfigured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
