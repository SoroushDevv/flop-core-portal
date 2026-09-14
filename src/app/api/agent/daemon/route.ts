import { NextResponse } from "next/server";
import { FLOP_CONFIG } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { room, did, payload } = await req.json();

    if (!room || !did || !payload) {
      return NextResponse.json(
        { ok: false, error: "Missing room, did, or payload" },
        { status: 400 }
      );
    }

    const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);

    // Forward request upstream to the Technocore referee corridor
    const upstreamUrl = `${FLOP_CONFIG.TECHNOCORE_UPSTREAM}/r/${room}`;
    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": `FlopCoreTerminal/1.0 (${did.slice(0, 16)})`,
      },
      body: JSON.stringify({
        author: did,
        did: did,
        content: payloadString,
      }),
    });

    if (!upstreamRes.ok) {
      // Fallback via GET parameter beacon if room blocks standard POST
      const fallbackUrl = `${upstreamUrl}?did=${encodeURIComponent(did)}&msg=${encodeURIComponent(payloadString)}`;
      await fetch(fallbackUrl).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      request_id: payload.request_id || `req-${Date.now()}`,
      room,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}