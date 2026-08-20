import { PERMISOS_POR_ROL, ROL_ETIQUETA, ROLES } from "@/lib/rbac";
import { requireAdmin } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  await requireAdmin();

  return (
    <>
      <header className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Administración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Roles y permisos</h1>
        <p className="mt-2 text-slate-500">
          Cada tipo de usuario entra a menús distintos según su rol.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        {ROLES.map((rol) => (
          <section
            key={rol}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900">{ROL_ETIQUETA[rol]}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {rol}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {PERMISOS_POR_ROL[rol].map((p) => (
                <li key={p.codigo}>
                  <span className="font-medium text-slate-800">{p.codigo}</span>
                  <span className="block text-slate-500">{p.descripcion}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
