import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "molitrabaja_session";
const SESSION_DAYS = 30;

export type TipoUsuario = "empresa" | "postulante";

export type SessionData = {
  token: string;
  tipo: TipoUsuario;
  empresaId?: string;
  postulanteId?: string;
  nombre: string;
  email: string;
};

function newToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(input: {
  tipo: TipoUsuario;
  empresaId?: string;
  postulanteId?: string;
}): Promise<SessionData> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  const token = newToken();

  if (input.tipo === "empresa" && input.empresaId) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: input.empresaId },
    });
    if (!empresa) throw new Error("Empresa no encontrada");

    await prisma.sesion.create({
      data: {
        token,
        tipoUsuario: "empresa",
        empresaId: empresa.id,
        expiresAt,
      },
    });

    return {
      token,
      tipo: "empresa",
      empresaId: empresa.id,
      nombre: empresa.nombre,
      email: empresa.email,
    };
  }

  if (input.tipo === "postulante" && input.postulanteId) {
    const postulante = await prisma.postulante.findUnique({
      where: { id: input.postulanteId },
    });
    if (!postulante) throw new Error("Postulante no encontrado");

    await prisma.sesion.create({
      data: {
        token,
        tipoUsuario: "postulante",
        postulanteId: postulante.id,
        expiresAt,
      },
    });

    return {
      token,
      tipo: "postulante",
      postulanteId: postulante.id,
      nombre: `${postulante.nombres} ${postulante.apellidoPaterno}`,
      email: postulante.correo,
    };
  }

  throw new Error("Sesión inválida");
}

export async function getSession(): Promise<SessionData | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sesion = await prisma.sesion.findUnique({
    where: { token },
    include: { empresa: true, postulante: true },
  });

  if (!sesion || sesion.expiresAt < new Date()) {
    if (sesion) {
      await prisma.sesion.delete({ where: { id: sesion.id } }).catch(() => {});
    }
    return null;
  }

  if (sesion.tipoUsuario === "empresa" && sesion.empresa) {
    return {
      token: sesion.token,
      tipo: "empresa",
      empresaId: sesion.empresa.id,
      nombre: sesion.empresa.nombre,
      email: sesion.empresa.email,
    };
  }

  if (sesion.tipoUsuario === "postulante" && sesion.postulante) {
    const p = sesion.postulante;
    return {
      token: sesion.token,
      tipo: "postulante",
      postulanteId: p.id,
      nombre: `${p.nombres} ${p.apellidoPaterno}`,
      email: p.correo,
    };
  }

  return null;
}

export async function destroySession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.sesion.deleteMany({ where: { token } });
  }
}

export function sessionCookieOptions(token: string) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
