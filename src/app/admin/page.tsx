import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { backendFetch } from "@/lib/backend";
import { requireAdmin } from "@/lib/require-auth";
import type { EmpresaDTO, OfertaLaboralDTO } from "@/types/bolsa";

export const dynamic = "force-dynamic";

type UsuarioApi = { id: string };

export default async function AdminInicioPage() {
  await requireAdmin();

  const [usuarios, empresas, ofertas] = await Promise.all([
    backendFetch<UsuarioApi[]>("/usuarios"),
    backendFetch<EmpresaDTO[]>("/empresas"),
    backendFetch<OfertaLaboralDTO[]>("/ofertas?estado=all"),
  ]);

  let postulantes = 0;
  try {
    const lista = await backendFetch<{ id: string }[]>("/postulantes");
    postulantes = lista.length;
  } catch {
    postulantes = usuarios.length;
  }

  const tarjetas = [
    { href: "/admin/usuarios", label: "Usuarios", valor: usuarios.length },
    { href: "/admin/empresas", label: "Empresas", valor: empresas.length },
    { href: "/admin/ofertas", label: "Ofertas", valor: ofertas.length },
    { href: "/admin/postulantes", label: "Postulantes", valor: postulantes },
  ];

  return (
    <AppShell variant="admin">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-600">Panel administrador</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Resumen</h1>
        <p className="mt-2 text-slate-500">Desde aquí creas usuarios y les asignas un rol.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:border-emerald-300"
          >
            <p className="text-sm text-slate-500">{t.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{t.valor}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
