import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const targetPath = pathParts.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;

  const targetUrl = `https://technocore.chat/${targetPath}${search}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "User-Agent": "FlopCore-Agent-Gateway/1.0",
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