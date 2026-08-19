import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/auth-cookie";

export function backendUrl(): string {
  const raw = process.env.API_URL || "http://localhost:3001/api";
  return raw.replace(/\/$/, "");
}

/** Origen Nest sin `/api` (archivos estáticos en `/uploads`). */
export function backendOrigin(): string {
  return backendUrl().replace(/\/api$/i, "");
}

export class BackendError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function mensajeError(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const rec = data as { message?: unknown; error?: unknown };
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  if (Array.isArray(rec.message) && rec.message.length > 0) {
    return rec.message.map(String).join(" ");
  }
  if (typeof rec.error === "string" && rec.error.trim() && rec.error !== "Unprocessable Entity") {
    return rec.error;
  }
  return fallback;
}

export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token: tokenArg, ...rest } = init;
  const token =
    tokenArg !== undefined
      ? tokenArg ?? undefined
      : cookies().get(SESSION_COOKIE)?.value ?? undefined;
  const headers = new Headers(rest.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (rest.body && !(rest.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${backendUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers, cache: "no-store" });
  } catch {
    throw new BackendError(
      `No se pudo conectar con el API (${backendUrl()}). Arranca el backend Nest.`,
      503
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    throw new BackendError(
      mensajeError(data, `Error del API (${res.status})`),
      res.status
    );
  }

  return data as T;
}
