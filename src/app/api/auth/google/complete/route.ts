import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GOOGLE_PENDING_COOKIE, readPendingIdentity } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const identity = readPendingIdentity(jar.get(GOOGLE_PENDING_COOKIE)?.value);
  const res = NextResponse.json(
    identity
      ? { ok: true, identity }
      : { ok: false, error: "NO_PENDING_GOOGLE_LOGIN" },
    { status: identity ? 200 : 400, headers: { "Cache-Control": "no-store" } },
  );
  res.cookies.delete(GOOGLE_PENDING_COOKIE);
  return res;
}
