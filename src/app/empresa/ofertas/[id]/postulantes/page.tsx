import Link from "next/link";

import { PostulantesOfertaPanel } from "@/components/empresa/PostulantesOfertaPanel";
import { backendFetch } from "@/lib/backend";
import { requireEmpresa } from "@/lib/require-auth";
import type { OfertaLaboralDTO } from "@/types/bolsa";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export default async function PostulantesOfertaPage({ params }: Props) {
  const empresa = await requireEmpresa();

  let oferta: OfertaLaboralDTO | null = null;
  try {
    oferta = await backendFetch<OfertaLaboralDTO>(`/ofertas/${params.id}`);
  } catch {
    oferta = null;
  }

  if (!oferta || oferta.empresaId !== empresa.id) {
    return (
      <>
        <p className="text-slate-600">Oferta no encontrada.</p>
        <Link href="/empresa" className="text-emerald-700 font-semibold mt-4 inline-block">
          ← Volver al inicio
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/empresa"
        className="text-sm font-semibold text-emerald-700 hover:underline mb-6 inline-block"
      >
        ← Inicio
      </Link>
      <PostulantesOfertaPanel ofertaId={params.id} />
    </>
  );
}
