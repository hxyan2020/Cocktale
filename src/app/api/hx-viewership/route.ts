import { NextResponse } from "next/server";

const COLLECT_URL = "http://188.166.214.47:3520/collect";

/** Server-side proxy so the browser never hits mixed-content HTTP from HTTPS. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON body required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(COLLECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    const text = await upstream.text();
    return new NextResponse(text || '{"ok":true}', {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Analytics downtime must not break the app
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
