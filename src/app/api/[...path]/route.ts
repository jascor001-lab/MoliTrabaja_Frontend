import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth-cookie";
import { backendUrl } from "@/lib/backend";

function nestPath(pathname: string): string {
  const stripped = pathname.replace(/^\/api/, "") || "/";
  if (stripped === "/admin/usuarios" || stripped.startsWith("/admin/usuarios/")) {
    return stripped.replace("/admin/usuarios", "/usuarios");
  }
  return stripped;
}

async function proxy(req: NextRequest) {
  const path = nestPath(req.nextUrl.pathname);
  const url = `${backendUrl()}${path}${req.nextUrl.search}`;
  const token = cookies().get(SESSION_COOKIE)?.value;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const method = req.method.toUpperCase();
  let body: ArrayBuffer | string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const raw = Buffer.from(await req.arrayBuffer());
    if (
      path === "/usuarios" &&
      method === "POST" &&
      contentType?.includes("application/json")
    ) {
      try {
        const json = JSON.parse(raw.toString("utf8")) as {
          rol?: string;
          roles?: string[];
        };
        if (json.rol && !json.roles) json.roles = [json.rol];
        body = JSON.stringify(json);
        headers.set("content-type", "application/json");
      } catch {
        body = raw;
      }
    } else {
      body = raw;
    }
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body, cache: "no-store" });
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el API en http://localhost:3001" },
      { status: 503 }
    );
  }

  const out = new Headers();
  const resCt = res.headers.get("content-type");
  if (resCt) out.set("content-type", resCt);
  const disposition = res.headers.get("content-disposition");
  if (disposition) out.set("content-disposition", disposition);

  return new NextResponse(res.body, { status: res.status, headers: out });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
