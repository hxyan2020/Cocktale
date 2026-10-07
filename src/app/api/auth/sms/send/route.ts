import { NextResponse } from "next/server";
import { toE164 } from "@/lib/phone";
import { sendSmsCode, twilioConfigured } from "@/lib/twilio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WINDOW_MS = 45_000;
const HOUR_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 8;
const lastByPhone = new Map<string, number>();
const hourByIp = new Map<string, { start: number; count: number }>();

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for") || "";
  return xf.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  if (!twilioConfigured()) {
    return NextResponse.json({ error: "SMS login is not configured." }, { status: 503 });
  }

  let body: { iso?: string; national?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const e164 =
    body.phone && body.phone.startsWith("+")
      ? toE164("US", body.phone)
      : toE164(body.iso || "", body.national || "");
  if (!e164) {
    return NextResponse.json(
      { error: "Enter a valid mobile number with the correct country code." },
      { status: 400 },
    );
  }

  const now = Date.now();
  const last = lastByPhone.get(e164) || 0;
  if (now - last < WINDOW_MS) {
    return NextResponse.json(
      { error: "Please wait a moment before requesting another code." },
      { status: 429 },
    );
  }

  const ip = clientIp(req);
  const bucket = hourByIp.get(ip);
  if (!bucket || now - bucket.start > HOUR_MS) {
    hourByIp.set(ip, { start: now, count: 1 });
  } else if (bucket.count >= MAX_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many SMS requests from this network. Try again later." },
      { status: 429 },
    );
  } else {
    bucket.count += 1;
  }

  const result = await sendSmsCode(e164);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  lastByPhone.set(e164, now);
  return NextResponse.json({ ok: true, phone: e164 });
}
