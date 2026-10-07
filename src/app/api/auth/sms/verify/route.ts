import { NextResponse } from "next/server";
import { isE164 } from "@/lib/phone";
import { checkSmsCode, twilioConfigured } from "@/lib/twilio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!twilioConfigured()) {
    return NextResponse.json({ error: "SMS login is not configured." }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { phone?: string; code?: string };
  const phone = String(body.phone || "").trim();
  const code = String(body.code || "").replace(/\D/g, "");
  if (!isE164(phone) || code.length < 4) {
    return NextResponse.json({ error: "Enter the phone number and SMS code." }, { status: 400 });
  }

  const checked = await checkSmsCode(phone, code);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 401 });
  }

  return NextResponse.json({ ok: true, identity: { phone } });
}
