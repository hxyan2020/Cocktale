import { NextResponse } from "next/server";
import { adminConfigured, getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json(
    {
      configured: adminConfigured(),
      authenticated: Boolean(session),
      username: session?.username ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
