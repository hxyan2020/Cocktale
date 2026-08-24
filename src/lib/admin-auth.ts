import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "cocktale_admin_session";
const SESSION_DAYS = 7;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-insecure-admin-secret";
}

function expectedUsername() {
  return process.env.ADMIN_USERNAME || "";
}

function expectedPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function adminConfigured() {
  return Boolean(expectedUsername() && expectedPassword());
}

export function verifyAdminCredentials(username: string, password: string) {
  const user = expectedUsername();
  const pass = expectedPassword();
  if (!user || !pass) return false;
  return safeEqual(username, user) && safeEqual(password, pass);
}

export function createAdminSessionToken(username: string) {
  const payload = {
    u: username,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): { username: string } | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      u?: string;
      exp?: number;
    };
    if (!payload.u || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (payload.u !== expectedUsername()) return null;
    return { username: payload.u };
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions(maxAgeSeconds = SESSION_DAYS * 24 * 60 * 60) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function getAdminSession() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminApi() {
  if (!adminConfigured()) {
    return {
      session: null as null,
      error: NextResponse.json(
        { error: "Admin credentials are not configured on this server." },
        { status: 503 },
      ),
    };
  }
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null as null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null as null };
}

export function readSessionFromRequest(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`));
  const raw = match?.[1] ? decodeURIComponent(match[1]) : null;
  return verifyAdminSessionToken(raw);
}
