import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  clearSessionCookieOptions,
  sessionCookieOptions,
} from "@/lib/auth-cookie";
import { backendFetch } from "@/lib/backend";
import type { RolNombre } from "@/lib/rbac";

export { SESSION_COOKIE, clearSessionCookieOptions, sessionCookieOptions };

export type TipoUsuario = "admin" | "empresa" | "postulante";

export type SessionData = {
  token: string;
  tipo: TipoUsuario;
  usuarioId?: string;
  empresaId?: string;
  postulanteId?: string;
  nombre: string;
  email: string;
  rol?: RolNombre;
  roles?: string[];
};

type NestSesion = {
  authenticated?: boolean;
  usuarioId?: string;
  tipo?: TipoUsuario;
  roles?: string[];
  nombre?: string;
  email?: string;
  empresaId?: string;
  postulanteId?: string;
  token?: string;
};

export async function getSession(): Promise<SessionData | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const data = await backendFetch<NestSesion>("/auth/login", { token });
    if (!data?.authenticated || !data.tipo) return null;
    return {
      token,
      tipo: data.tipo,
      usuarioId: data.usuarioId,
      empresaId: data.empresaId,
      postulanteId: data.postulanteId,
      nombre: data.nombre ?? "",
      email: data.email ?? "",
      rol: data.tipo,
      roles: data.roles,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return;
  try {
    await backendFetch("/auth/logout", { method: "POST", token });
  } catch {
    /* la cookie se borra igual */
  }
}
