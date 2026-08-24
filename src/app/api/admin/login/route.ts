import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  adminConfigured,
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin credentials are not configured on this server." },
      { status: 503 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username and password required." }, { status: 400 });
  }

  if (!verifyAdminCredentials(parsed.data.username, parsed.data.password)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = createAdminSessionToken(parsed.data.username);
  const res = NextResponse.json({ ok: true, username: parsed.data.username });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  return res;
}
