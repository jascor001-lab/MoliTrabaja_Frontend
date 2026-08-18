import { AppShell } from "@/components/layout/AppShell";
import { PortalHome } from "@/components/portal/PortalHome";
import { backendFetch } from "@/lib/backend";
import type { EmpresaDTO, OfertaLaboralDTO } from "@/types/bolsa";

export const dynamic = "force-dynamic";

type Catalogos = {
  carreras: { id: number; nombre: string }[];
  conocimientos: { id: number; nombre: string }[];
};

export default async function HomePage() {
  let ofertas: OfertaLaboralDTO[] = [];
  let empresas: EmpresaDTO[] = [];
  let carreras: Catalogos["carreras"] = [];
  let conocimientos: Catalogos["conocimientos"] = [];
  let error: string | null = null;

  try {
    const [ofertasRes, empresasRes, catalogosRes] = await Promise.all([
      backendFetch<OfertaLaboralDTO[]>("/ofertas?estado=Activa"),
      backendFetch<EmpresaDTO[]>("/empresas"),
      backendFetch<Catalogos>("/catalogos"),
    ]);
    ofertas = ofertasRes;
    empresas = empresasRes;
    carreras = catalogosRes.carreras ?? [];
    conocimientos = catalogosRes.conocimientos ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudieron cargar las ofertas";
  }

  return (
    <AppShell variant="portal">
      {error ? (
        <div className="mx-auto max-w-lg py-16 text-center">
          <p className="text-lg font-semibold text-slate-900">No hay conexión con el API</p>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <p className="mt-4 text-sm text-slate-500">
            El backend Nest debe estar en{" "}
            <span className="font-medium">
              {process.env.API_URL || "http://localhost:3001/api"}
            </span>
          </p>
        </div>
      ) : (
        <PortalHome
          ofertas={ofertas}
          empresasCatalogo={empresas.map((e) => ({
            value: e.id,
            label: e.razonSocial || e.nombre,
          }))}
          carrerasCatalogo={carreras.map((c) => ({
            value: String(c.id),
            label: c.nombre,
          }))}
          conocimientosCatalogo={conocimientos.map((c) => ({
            value: String(c.id),
            label: c.nombre,
          }))}
        />
      )}
    </AppShell>
  );
}
