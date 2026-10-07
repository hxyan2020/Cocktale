import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  GOOGLE_PENDING_COOKIE,
  GOOGLE_STATE_COOKIE,
  appOrigin,
  createPendingIdentity,
  exchangeGoogleCode,
  googleConfigured,
  identityFromIdToken,
  oauthCookieOptions,
  readOauthState,
} from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

function loginRedirect(req: Request, query: string) {
  return NextResponse.redirect(`${appOrigin(req)}/login?${query}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (error) return loginRedirect(req, "google=error&reason=denied");
  if (!googleConfigured()) return loginRedirect(req, "google=error&reason=config");
  if (!code || !state) return loginRedirect(req, "google=error&reason=missing");

  const jar = await cookies();
  const stored = readOauthState(jar.get(GOOGLE_STATE_COOKIE)?.value);
  if (!stored || stored.nonce !== state) {
    const res = loginRedirect(req, "google=error&reason=state");
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  }

  try {
    const tokens = await exchangeGoogleCode(req, code, stored.verifier);
    if (!tokens.id_token) throw new Error("NO_ID_TOKEN");
    const identity = await identityFromIdToken(tokens.id_token);
    const res = loginRedirect(req, "google=ok");
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    res.cookies.set(GOOGLE_PENDING_COOKIE, createPendingIdentity(identity), oauthCookieOptions(5 * 60));
    return res;
  } catch {
    const res = loginRedirect(req, "google=error&reason=exchange");
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  }
}
