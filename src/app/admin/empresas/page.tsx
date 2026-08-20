import { backendFetch } from "@/lib/backend";
import { requireAdmin } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

type EmpresaRow = {
  id: string;
  nombre: string;
  razonSocial?: string;
  ruc?: string;
  email?: string;
  telefono?: string;
  rubro?: string;
};

function celda(valor?: string | null) {
  const t = valor?.trim();
  return t ? t : "—";
}

export default async function AdminEmpresasPage() {
  await requireAdmin();
  const empresas = await backendFetch<EmpresaRow[]>("/admin/empresas");

  return (
    <>
      <header className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Administración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Empresas</h1>
      </header>
      <div className="overflow-x-auto overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Razón social</th>
              <th className="px-4 py-3 font-semibold">RUC</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Teléfono</th>
              <th className="px-4 py-3 font-semibold">Rubro</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay empresas en la base de datos.
                </td>
              </tr>
            ) : (
              empresas.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{celda(e.nombre)}</td>
                  <td className="px-4 py-3">{celda(e.razonSocial)}</td>
                  <td className="px-4 py-3">{celda(e.ruc)}</td>
                  <td className="px-4 py-3">{celda(e.email)}</td>
                  <td className="px-4 py-3">{celda(e.telefono)}</td>
                  <td className="px-4 py-3">{celda(e.rubro)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
