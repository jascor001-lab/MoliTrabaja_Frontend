import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { sessionCookieOptions } from "@/lib/auth";
import { BackendError, backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await backendFetch<{
      ok?: boolean;
      tipo?: "admin" | "empresa" | "postulante";
      nombre?: string;
      token: string;
      redirect?: string;
    }>("/auth/registro/postulante/confirmar", {
      method: "POST",
      token: null,
      body: JSON.stringify(body),
    });

    cookies().set(sessionCookieOptions(data.token));
    return NextResponse.json({
      ok: true,
      tipo: data.tipo,
      nombre: data.nombre,
      redirect: data.redirect ?? "/",
    });
  } catch (e) {
    const status = e instanceof BackendError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo verificar el código" },
      { status }
    );
  }
}
