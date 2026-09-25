import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    // Extract subpath preserving raw characters like colons in did:key:
    const subPath = pathname.replace(/^\/api\/technocore\/?/, "");
    const search = request.nextUrl.search;

    const targetUrl = `https://technocore.chat/${subPath}${search}`;

    const upstreamRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "User-Agent": "FlopCore-Portal/1.0",
      },
      cache: "no-store",
    });

    const bodyText = await upstreamRes.text();
    return new NextResponse(bodyText, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy Gateway Error: ${err.message}`, {
      status: 502,
      headers: { "Content-Type": "text/plain" },
    });
  }
}