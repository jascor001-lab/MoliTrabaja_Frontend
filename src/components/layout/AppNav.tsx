"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionInfo = {
  authenticated: boolean;
  tipo?: "admin" | "empresa" | "postulante";
  nombre?: string;
};

type Props = {
  variant: "portal" | "empresa" | "postulante" | "admin";
};

const ADMIN_MENUS = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/ofertas", label: "Ofertas" },
  { href: "/admin/postulantes", label: "Postulantes" },
  { href: "/admin/roles", label: "Roles y permisos" },
];

function navClass(activo: boolean, primary = false) {
  if (primary) {
    return "rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700";
  }
  return activo
    ? "rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800"
    : "rounded-lg px-3 py-2 text-slate-600 hover:bg-emerald-50";
}

export function AppNav({ variant }: Props) {
  const router = useRouter();
  const pathname = usePathname();
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
    const isAdmin = session.tipo === "admin";
    const isPostulante = session.tipo === "postulante";

    return (
      <nav className="flex flex-wrap items-center justify-end gap-1 text-sm font-semibold sm:gap-2">
        {variant === "admin" || isAdmin ? (
          <>
            {variant !== "admin" && (
              <Link href="/admin" className={navClass(false)}>
                Panel admin
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
            >
              Salir
            </button>
          </>
        ) : isEmpresa ? (
          <>
            <Link
              href="/empresa"
              className={navClass(
                pathname === "/empresa" || pathname === "/empresa/ofertas"
              )}
            >
              Inicio
            </Link>
            {variant !== "portal" && (
              <>
                <Link
                  href="/empresa/perfil"
                  className={navClass(pathname.startsWith("/empresa/perfil"))}
                >
                  Perfil
                </Link>
                <Link
                  href="/empresa/publicar"
                  className={navClass(pathname.startsWith("/empresa/publicar"), true)}
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
          </>
        ) : isPostulante ? (
          <>
            <Link href="/" className={navClass(pathname === "/")}>
              Inicio
            </Link>
            <Link
              href="/personal/postulaciones"
              className={navClass(pathname.startsWith("/personal/postulaciones"))}
            >
              <span className="hidden sm:inline">Mis postulaciones</span>
              <span className="sm:hidden">Postulaciones</span>
            </Link>
            <Link
              href="/personal/perfil"
              className={navClass(pathname.startsWith("/personal/perfil"))}
            >
              Mi perfil
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
            >
              Salir
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
          >
            Salir
          </button>
        )}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm font-semibold">
      <Link
        href="/ingreso"
        className="rounded-lg px-3 py-2 text-emerald-700 hover:bg-emerald-50"
      >
        {variant === "portal" ? "Acceder" : "Ingresar"}
      </Link>
    </nav>
  );
}

export function AdminSideNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {ADMIN_MENUS.map((item) => {
        const activo =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${
              activo
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
