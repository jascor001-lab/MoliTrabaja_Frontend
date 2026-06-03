"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionInfo = {
  authenticated: boolean;
  tipo?: "empresa" | "postulante";
  nombre?: string;
};

type Props = {
  variant: "portal" | "empresa";
};

export function AppNav({ variant }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then((data) => setSession(data as SessionInfo))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession({ authenticated: false });
    router.push("/");
    router.refresh();
  };

  if (session === null) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />;
  }

  if (session.authenticated) {
    const isEmpresa = session.tipo === "empresa";
    return (
      <nav className="flex items-center gap-2 text-sm font-semibold">
        <span className="hidden md:inline text-slate-500 truncate max-w-[140px]">
          {session.nombre}
        </span>
        {variant === "portal" ? (
          <>
            {isEmpresa ? (
              <Link
                href="/empresa"
                className="rounded-lg px-3 py-2 text-emerald-700 hover:bg-emerald-50"
              >
                Panel empresa
              </Link>
            ) : (
              <>
                <Link
                  href="/personal"
                  className="rounded-lg px-3 py-2 text-slate-600 hover:bg-emerald-50"
                >
                  Mis postulaciones
                </Link>
                <Link
                  href="/personal/perfil"
                  className="rounded-lg px-3 py-2 text-slate-600 hover:bg-emerald-50"
                >
                  Mi perfil
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link href="/" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-emerald-50">
              Portal
            </Link>
            <Link
              href="/empresa/perfil"
              className="rounded-lg px-3 py-2 text-slate-600 hover:bg-emerald-50"
            >
              Perfil
            </Link>
            <Link
              href="/empresa/publicar"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
            >
              Publicar
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={logout}
          className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
        >
          Salir
        </button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm font-semibold">
      {variant === "portal" ? (
        <>
          <Link
            href="/ingreso?tipo=postulante"
            className="rounded-lg px-3 py-2 text-slate-600 hover:bg-emerald-50"
          >
            Ingresar
          </Link>
          <Link
            href="/registro/postulante"
            className="rounded-lg px-3 py-2 text-emerald-700 hover:bg-emerald-50"
          >
            Crear perfil
          </Link>
          <Link
            href="/ingreso?tipo=empresa"
            className="rounded-lg px-3 py-2 text-slate-600 hover:bg-emerald-50 hidden sm:inline"
          >
            Empresa
          </Link>
        </>
      ) : (
        <Link
          href="/ingreso?tipo=empresa"
          className="rounded-lg px-3 py-2 text-emerald-700 hover:bg-emerald-50"
        >
          Ingresar
        </Link>
      )}
    </nav>
  );
}
