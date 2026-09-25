import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathParts = resolvedParams.path || [];
    // Reconstruct the original path preserving did:key and query string
    const subPath = pathParts.join("/");
    const search = request.nextUrl.search;

    const targetUrl = `https://technocore.chat/${subPath}${search}`;

    const upstreamRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    const bodyText = await upstreamRes.text();

    return new NextResponse(bodyText, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy Gateway Error: ${err.message}`, {
      status: 502,
      headers: { "Content-Type": "text/plain" },
    });
  }
}