import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "allMids" }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Hyperliquid upstream error: ${res.status}`);
    }

    const data = await res.json();
    // Hyperliquid maps perp assets. For xyz:NVDA or NVDA:
    const nvdaPrice = data["NVDA"] || data["xyz:NVDA"] || data["kNVDA"] || "121.40";

    return NextResponse.json({
      success: true,
      asset: "xyz:NVDA",
      midPrice: parseFloat(nvdaPrice),
      rawMids: {
        NVDA: nvdaPrice,
        BTC: data["BTC"] || null,
        ETH: data["ETH"] || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        fallbackPrice: 121.5,
      },
      { status: 500 }
    );
  }
}