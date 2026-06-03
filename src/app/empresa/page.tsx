import { AppShell } from "@/components/layout/AppShell";
import { EmpresaDashboard } from "@/components/empresa/EmpresaDashboard";
import { prisma } from "@/lib/db";
import { OFERTA_INCLUDE, toOfertaDTO } from "@/lib/ofertas";
import { requireEmpresa } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export default async function EmpresaPage() {
  const empresa = await requireEmpresa();

  const ofertas = await prisma.ofertaLaboral.findMany({
    where: { empresaId: empresa.id },
    include: OFERTA_INCLUDE,
    orderBy: { fechaPublicacion: "desc" },
  });

  return (
    <AppShell variant="empresa">
      <EmpresaDashboard
        empresaNombre={empresa.nombre}
        ofertas={ofertas.map((o) => toOfertaDTO(o))}
      />
    </AppShell>
  );
}
