const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const VERIFY_API = "https://verify.twilio.com/v2";
const PRISM_VERIFY_SERVICE_SID = "VA3391992e9548d794852944a5cf5568f9";

type TwilioBody = {
  sid?: string;
  code?: number;
  message?: string;
  status?: string | number;
};

function authHeader(): string {
  return `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64")}`;
}

export function twilioConfigured(): boolean {
  return Boolean(ACCOUNT_SID && AUTH_TOKEN);
}

async function twilioForm(path: string, fields?: Record<string, string>) {
  const res = await fetch(`${VERIFY_API}/${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: fields ? new URLSearchParams(fields) : undefined,
    cache: "no-store",
  });
  const data = (await res.json()) as TwilioBody;
  return { ok: res.ok, status: res.status, data };
}

export function twilioUserMessage(code?: number, fallback?: string): string {
  switch (code) {
    case 21608:
    case 21211:
      return "This Twilio trial account can only text numbers you have verified in the Twilio console.";
    case 21408:
    case 21612:
    case 60605:
      return "SMS to this country is not enabled on the Twilio account yet. Enable it under Verify / Messaging geo permissions.";
    case 60200:
      return "That phone number does not look valid. Include the country code and try again.";
    case 60203:
    case 60212:
      return "Too many codes sent to this number. Wait a few minutes and try again.";
    case 60202:
      return "Too many incorrect codes. Request a new SMS and try again.";
    case 20404:
      return "That code has expired. Request a new SMS.";
    default:
      return fallback || "Could not send or verify the SMS code. Try again.";
  }
}

async function listVerifyServices(): Promise<string[]> {
  const res = await fetch(`${VERIFY_API}/Services?PageSize=50`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { services?: { sid?: string }[] };
  return (data.services ?? []).map((s) => s.sid || "").filter(Boolean);
}

async function createVerifyService(): Promise<string> {
  const { ok, data } = await twilioForm("Services", {
    FriendlyName: "Cocktale SMS login",
    CodeLength: "6",
  });
  if (!ok || !data.sid) {
    throw new Error(data.message || "Could not create Twilio Verify service.");
  }
  return data.sid;
}

export async function resolveVerifyServiceSid(): Promise<string> {
  const fromEnv = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (fromEnv) return fromEnv;
  const existing = await listVerifyServices();
  if (existing.includes(PRISM_VERIFY_SERVICE_SID)) {
    process.env.TWILIO_VERIFY_SERVICE_SID = PRISM_VERIFY_SERVICE_SID;
    return PRISM_VERIFY_SERVICE_SID;
  }
  if (existing[0]) {
    process.env.TWILIO_VERIFY_SERVICE_SID = existing[0];
    return existing[0];
  }
  const created = await createVerifyService();
  process.env.TWILIO_VERIFY_SERVICE_SID = created;
  return created;
}

export async function sendSmsCode(e164: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!twilioConfigured()) {
    return { ok: false, error: "SMS login is not configured." };
  }
  try {
    const service = await resolveVerifyServiceSid();
    const { ok, data } = await twilioForm(`Services/${service}/Verifications`, {
      To: e164,
      Channel: "sms",
    });
    if (ok) return { ok: true };
    return { ok: false, error: twilioUserMessage(data.code, data.message) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not send SMS.",
    };
  }
}

export async function checkSmsCode(
  e164: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!twilioConfigured()) {
    return { ok: false, error: "SMS login is not configured." };
  }
  try {
    const service = await resolveVerifyServiceSid();
    const { ok, data } = await twilioForm(`Services/${service}/VerificationCheck`, {
      To: e164,
      Code: code,
    });
    if (ok && String(data.status) === "approved") return { ok: true };
    if (data.status && String(data.status) !== "approved") {
      return { ok: false, error: "That code is incorrect or expired." };
    }
    return { ok: false, error: twilioUserMessage(data.code, data.message) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not verify SMS.",
    };
  }
}
