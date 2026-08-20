import { backendFetch } from "@/lib/backend";
import { requireAdmin } from "@/lib/require-auth";
import type { OfertaLaboralDTO } from "@/types/bolsa";

export const dynamic = "force-dynamic";

export default async function AdminOfertasPage() {
  await requireAdmin();
  const ofertas = await backendFetch<OfertaLaboralDTO[]>("/ofertas?estado=all");

  return (
    <>
      <header className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Administración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Ofertas</h1>
      </header>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Empresa</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Modalidad</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No hay ofertas en la base de datos.
                </td>
              </tr>
            ) : (
              ofertas.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{o.titulo}</td>
                  <td className="px-4 py-3">{o.empresa?.nombre ?? "—"}</td>
                  <td className="px-4 py-3">{o.estado}</td>
                  <td className="px-4 py-3">{o.modalidad}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
