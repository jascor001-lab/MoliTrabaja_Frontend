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

  return <EmpresaDashboard empresaNombre={empresa.nombre} ofertas={ofertas} />;
}
