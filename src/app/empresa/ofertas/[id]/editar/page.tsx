import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { OfertaEditClient } from "@/components/empresa/OfertaEditClient";
import { requireEmpresa } from "@/lib/require-auth";
import { prisma } from "@/lib/db";
import {
  OFERTA_INCLUDE,
  enrichOfertaDTOWithBases,
  toOfertaDTO,
} from "@/lib/ofertas";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function EditarOfertaPage({ params }: Props) {
  const empresa = await requireEmpresa();

  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: params.id },
    include: OFERTA_INCLUDE,
  });

  if (!oferta || oferta.empresaId !== empresa.id) {
    notFound();
  }

  const dto = await enrichOfertaDTOWithBases(toOfertaDTO(oferta), prisma, oferta.id);

  return (
    <AppShell variant="empresa">
      <div className="mb-8 animate-fade-in motion-reduce:animate-none">
        <Link
          href="/empresa"
          className="text-sm text-emerald-700 hover:underline font-medium"
        >
          ← Volver al panel
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">Editar oferta</h1>
        <p className="text-slate-500 mt-1">
          Actualiza los datos de <strong className="text-slate-700">{dto.titulo}</strong>.
          Los cambios se reflejan de inmediato en el portal.
        </p>
      </div>
      <OfertaEditClient
        oferta={dto}
        empresaId={empresa.id}
      />
    </AppShell>
  );
}
