import { NextRequest, NextResponse } from "next/server";

import { backendOrigin, backendUrl } from "@/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, path: string[]) {
  const rel = path.map((segment) => encodeURIComponent(segment)).join("/");
  if (!rel || rel.includes("..")) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  const candidates = [
    `${backendOrigin()}/uploads/${rel}`,
    `${backendUrl()}/uploads/${rel}`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: req.method,
        cache: "no-store",
        headers: { Accept: req.headers.get("accept") ?? "*/*" },
      });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "application/octet-stream";
      if (contentType.includes("application/json") || contentType.includes("text/html")) {
        continue;
      }
      const out = new Headers();
      out.set("content-type", contentType);
      out.set("cache-control", "no-store");
      return new NextResponse(res.body, { status: 200, headers: out });
    } catch {
      /* probar siguiente origen */
    }
  }

  return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(req, params.path ?? []);
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(req, params.path ?? []);
}
