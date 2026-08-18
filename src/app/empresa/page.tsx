import { AppShell } from "@/components/layout/AppShell";
import { EmpresaInicio } from "@/components/empresa/EmpresaInicio";
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
      <EmpresaInicio empresaNombre={empresa.nombre} ofertas={ofertas} />
    </AppShell>
  );
}
