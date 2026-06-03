import Link from "next/link";

import { PostulantesOfertaPanel } from "@/components/empresa/PostulantesOfertaPanel";
import { AppShell } from "@/components/layout/AppShell";
import { requireEmpresa } from "@/lib/require-auth";
import { prisma } from "@/lib/db";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export default async function PostulantesOfertaPage({ params }: Props) {
  const empresa = await requireEmpresa();

  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: params.id },
    select: { titulo: true, empresaId: true },
  });

  if (!oferta || oferta.empresaId !== empresa.id) {
    return (
      <AppShell variant="empresa">
        <p className="text-slate-600">Oferta no encontrada.</p>
        <Link href="/empresa" className="text-emerald-700 font-semibold mt-4 inline-block">
          ← Volver al panel
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell variant="empresa">
      <Link
        href="/empresa"
        className="text-sm font-semibold text-emerald-700 hover:underline mb-6 inline-block"
      >
        ← Panel empresa
      </Link>
      <PostulantesOfertaPanel ofertaId={params.id} />
    </AppShell>
  );
}
