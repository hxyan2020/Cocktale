import { NextResponse } from "next/server";
import {
  GOOGLE_STATE_COOKIE,
  appOrigin,
  buildGoogleAuthorizeUrl,
  createOauthState,
  createPkceChallenge,
  createPkceVerifier,
  googleConfigured,
  oauthCookieOptions,
} from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(`${appOrigin(req)}/login?google=error&reason=config`);
  }

  const verifier = createPkceVerifier();
  const challenge = createPkceChallenge(verifier);
  const { nonce, token } = createOauthState(verifier);
  const authorizeUrl = buildGoogleAuthorizeUrl(req, nonce, challenge);

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(GOOGLE_STATE_COOKIE, token, oauthCookieOptions(10 * 60));
  return res;
}
