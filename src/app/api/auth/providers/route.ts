import { NextResponse } from "next/server";
import { googleConfigured } from "@/lib/google-oauth";
import { twilioConfigured } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      googleEnabled: googleConfigured(),
      smsEnabled: twilioConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
