import { AppShell } from "@/components/layout/AppShell";
import { backendFetch } from "@/lib/backend";
import { requireAdmin } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

type PostulanteRow = {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  numeroDocumento?: string;
  correo: string;
};

export default async function AdminPostulantesPage() {
  await requireAdmin();
  let postulantes: PostulanteRow[] = [];
  try {
    postulantes = await backendFetch<PostulanteRow[]>("/postulantes");
  } catch {
    postulantes = [];
  }

  return (
    <AppShell variant="admin">
      <header className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Administración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Postulantes</h1>
      </header>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Documento</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
            </tr>
          </thead>
          <tbody>
            {postulantes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  No hay postulantes en la base de datos.
                </td>
              </tr>
            ) : (
              postulantes.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">
                    {p.nombres} {p.apellidoPaterno}
                  </td>
                  <td className="px-4 py-3">{p.numeroDocumento ?? "—"}</td>
                  <td className="px-4 py-3">{p.correo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
