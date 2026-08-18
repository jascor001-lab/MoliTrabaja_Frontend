import { AppShell } from "@/components/layout/AppShell";
import { backendFetch } from "@/lib/backend";
import { requireAdmin } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

type EmpresaRow = {
  id: string;
  nombre: string;
  ruc: string;
  email?: string;
};

export default async function AdminEmpresasPage() {
  await requireAdmin();
  const empresas = await backendFetch<EmpresaRow[]>("/empresas");

  return (
    <AppShell variant="admin">
      <header className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Administración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Empresas</h1>
      </header>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">RUC</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{e.nombre}</td>
                <td className="px-4 py-3">{e.ruc}</td>
                <td className="px-4 py-3">{e.email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
