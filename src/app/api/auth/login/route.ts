import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getSession, sessionCookieOptions } from "@/lib/auth";
import { BackendError, backendFetch } from "@/lib/backend";

function redirectPorTipo(tipo: "admin" | "empresa" | "postulante") {
  if (tipo === "admin") return "/admin";
  if (tipo === "empresa") return "/empresa";
  return "/personal";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const data = await backendFetch<{
      ok?: boolean;
      tipo: "admin" | "empresa" | "postulante";
      nombre?: string;
      token: string;
      redirect?: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: body.email?.trim().toLowerCase(),
        password: body.password ?? "",
      }),
    });

    cookies().set(sessionCookieOptions(data.token));
    return NextResponse.json({
      ok: true,
      tipo: data.tipo,
      nombre: data.nombre,
      redirect: redirectPorTipo(data.tipo),
    });
  } catch (e) {
    const status = e instanceof BackendError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al iniciar sesión" },
      { status: status === 401 ? 401 : status }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    tipo: session.tipo,
    nombre: session.nombre,
    email: session.email,
    usuarioId: session.usuarioId,
    empresaId: session.empresaId,
    postulanteId: session.postulanteId,
  });
}
