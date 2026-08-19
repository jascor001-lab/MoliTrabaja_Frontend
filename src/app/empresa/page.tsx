import { AppShell } from "@/components/layout/AppShell";
import { EmpresaDashboard } from "@/components/empresa/EmpresaDashboard";
import { backendFetch } from "@/lib/backend";
import { requireEmpresa } from "@/lib/require-auth";
import type { OfertaLaboralDTO } from "@/types/bolsa";

export const dynamic = "force-dynamic";

export default async function EmpresaInicioPage() {
  const empresa = await requireEmpresa();
  const ofertas = await backendFetch<OfertaLaboralDTO[]>(
    `/ofertas?empresaId=${empresa.id}&estado=all`
  );

  return (
    <AppShell variant="empresa">
      <EmpresaDashboard empresaNombre={empresa.nombre} ofertas={ofertas} />
    </AppShell>
  );
}
