import { AppShell } from "@/components/layout/AppShell";
import { PortalHome } from "@/components/portal/PortalHome";
import { prisma } from "@/lib/db";
import {
  OFERTA_INCLUDE,
  enrichOfertaDTOWithBases,
  toOfertaDTO,
} from "@/lib/ofertas";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ofertas = await prisma.ofertaLaboral.findMany({
    where: { estado: "Activa" },
    include: OFERTA_INCLUDE,
    orderBy: { fechaPublicacion: "desc" },
  });

  const data = await Promise.all(
    ofertas.map(async (o) =>
      enrichOfertaDTOWithBases(toOfertaDTO(o), prisma, o.id)
    )
  );

  return (
    <AppShell variant="portal">
      <PortalHome ofertas={data} />
    </AppShell>
  );
}
