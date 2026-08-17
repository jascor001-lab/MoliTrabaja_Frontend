import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  createSession,
  getSession,
  sessionCookieOptions,
  type TipoUsuario,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      tipo?: TipoUsuario;
      email?: string;
      password?: string;
    };

    const tipo = body.tipo;
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (tipo !== "empresa" && tipo !== "postulante") {
      return NextResponse.json({ error: "Tipo de usuario inválido" }, { status: 400 });
    }
    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (tipo === "empresa") {
      const empresa = await prisma.empresa.findUnique({ where: { email } });
      if (!empresa || !verifyPassword(password, empresa.passwordHash)) {
        return NextResponse.json(
          { error: "Correo o contraseña incorrectos" },
          { status: 401 }
        );
      }

      const session = await createSession({
        tipo: "empresa",
        empresaId: empresa.id,
      });
      cookies().set(sessionCookieOptions(session.token));
      return NextResponse.json({
        ok: true,
        tipo: "empresa",
        nombre: session.nombre,
        redirect: "/empresa",
      });
    }

    const postulante = await prisma.postulante.findUnique({ where: { correo: email } });
    if (!postulante || !verifyPassword(password, postulante.passwordHash)) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const session = await createSession({
      tipo: "postulante",
      postulanteId: postulante.id,
    });
    cookies().set(sessionCookieOptions(session.token));
    return NextResponse.json({
      ok: true,
      tipo: "postulante",
      nombre: session.nombre,
      redirect: "/",
    });
  } catch (e) {
    console.error("[POST /api/auth/login]", e);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
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
    empresaId: session.empresaId,
    postulanteId: session.postulanteId,
  });
}
