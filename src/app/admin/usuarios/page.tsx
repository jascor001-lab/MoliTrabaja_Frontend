import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { backendFetch } from "@/lib/backend";
import { ROL_ETIQUETA, type RolNombre } from "@/lib/rbac";
import { requireAdmin } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

type UsuarioApi = {
  id: string;
  correo: string;
  nombres: string;
  apellidoPaterno: string;
  activo: boolean;
  roles?: { nombre: string }[];
};

export default async function AdminUsuariosPage() {
  await requireAdmin();
  const usuarios = await backendFetch<UsuarioApi[]>("/usuarios");

  return (
    <AppShell variant="admin">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Administración</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="mt-2 text-slate-500">
            Solo el admin crea cuentas y les asigna un rol.
          </p>
        </div>
        <Link href="/admin/usuarios/nuevo">
          <Button>+ Nuevo usuario</Button>
        </Link>
      </header>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => {
                const rol = (u.roles?.[0]?.nombre ?? "postulante") as RolNombre;
                return (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {u.nombres} {u.apellidoPaterno}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.correo}</td>
                    <td className="px-4 py-3">{ROL_ETIQUETA[rol] ?? rol}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.activo
                            ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500"
                        }
                      >
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
