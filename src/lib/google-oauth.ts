import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { SITE_URL } from "@/lib/seo";

export const GOOGLE_STATE_COOKIE = "cocktale_google_state";
export const GOOGLE_PENDING_COOKIE = "cocktale_google_pending";

const STATE_TTL_MS = 10 * 60 * 1000;
const PENDING_TTL_MS = 5 * 60 * 1000;

export type GoogleIdentity = {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
};

type SignedState = {
  nonce: string;
  verifier: string;
  exp: number;
};

function oauthSecret() {
  return (
    process.env.GOOGLE_OAUTH_STATE_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "dev-insecure-google-oauth-secret"
  );
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function signPayload(payload: object) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", oauthSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyPayload<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", oauthSecret()).update(body).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function appOrigin(req: Request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host?.includes("localhost") || host?.startsWith("127.0.0.1")) {
    return `http://${host}`;
  }
  if (host) return `${proto}://${host}`;
  return SITE_URL;
}

export function googleRedirectUri(req: Request) {
  return `${appOrigin(req)}/api/auth/google/callback`;
}

export function oauthCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function createPkceVerifier() {
  return randomBytes(32).toString("base64url");
}

export function createPkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function createOauthState(verifier: string) {
  const nonce = randomBytes(16).toString("base64url");
  const token = signPayload({
    nonce,
    verifier,
    exp: Date.now() + STATE_TTL_MS,
  } satisfies SignedState);
  return { nonce, token };
}

export function readOauthState(token: string | undefined | null): SignedState | null {
  const payload = verifyPayload<SignedState>(token);
  if (!payload?.nonce || !payload.verifier || payload.exp < Date.now()) return null;
  return payload;
}

export function createPendingIdentity(identity: GoogleIdentity) {
  return signPayload({
    ...identity,
    exp: Date.now() + PENDING_TTL_MS,
  });
}

export function readPendingIdentity(token: string | undefined | null): GoogleIdentity | null {
  const payload = verifyPayload<GoogleIdentity & { exp?: number }>(token);
  if (!payload?.email || !payload.googleId || !payload.exp || payload.exp < Date.now()) {
    return null;
  }
  return {
    email: payload.email,
    name: payload.name || "",
    picture: payload.picture,
    googleId: payload.googleId,
  };
}

export function buildGoogleAuthorizeUrl(req: Request, nonce: string, challenge: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: googleRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state: nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
    access_type: "online",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(req: Request, code: string, verifier: string) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    code,
    grant_type: "authorization_code",
    redirect_uri: googleRedirectUri(req),
    code_verifier: verifier,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "TOKEN_EXCHANGE_FAILED");
  }

  return (await res.json()) as { id_token?: string; access_token?: string };
}

export async function identityFromIdToken(idToken: string): Promise<GoogleIdentity> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("ID_TOKEN_INVALID");
  const payload = (await res.json()) as {
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    sub?: string;
  };
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error("ID_TOKEN_AUD");
  if (!payload.email || !payload.sub) throw new Error("ID_TOKEN_PROFILE");
  if (payload.email_verified !== true && payload.email_verified !== "true") {
    throw new Error("EMAIL_UNVERIFIED");
  }
  return {
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    picture: payload.picture,
    googleId: payload.sub,
  };
}
