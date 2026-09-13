import { NextResponse } from "next/server";
import { FLOP_CONFIG } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { did, x_account, role } = await req.json();

    if (!did || !x_account) {
      return NextResponse.json({ ok: false, error: "DID and X account are required" }, { status: 400 });
    }

    const payload = {
      type: "sonnet.register.v1",
      contest_id: FLOP_CONFIG.CONTEST_ID,
      request_id: `user-${Date.now()}`,
      role: role || "writer",
      did,
      x_account,
      timestamp: Date.now(),
    };

    // فوروارد به اتاق ثبت‌نام Technocore
    await fetch(`${FLOP_CONFIG.TECHNOCORE_UPSTREAM}/r/mb-sonnet-2-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: did,
        did,
        content: JSON.stringify(payload),
      }),
    }).catch(() => {});

    return NextResponse.json({ ok: true, request_id: payload.request_id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}