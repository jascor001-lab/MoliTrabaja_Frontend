import Link from "next/link";
import { notFound } from "next/navigation";

import { OfertaEditClient } from "@/components/empresa/OfertaEditClient";
import { backendFetch } from "@/lib/backend";
import { requireEmpresa } from "@/lib/require-auth";
import type { OfertaLaboralDTO } from "@/types/bolsa";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function EditarOfertaPage({ params }: Props) {
  const empresa = await requireEmpresa();
  let oferta: OfertaLaboralDTO | null = null;
  try {
    oferta = await backendFetch<OfertaLaboralDTO>(`/ofertas/${params.id}`);
  } catch {
    notFound();
  }

  if (!oferta || oferta.empresaId !== empresa.id) {
    notFound();
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/empresa"
          className="text-sm text-emerald-700 hover:underline font-medium"
        >
          ← Volver al inicio
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
          Editar oferta
        </h1>
        <p className="mt-1 text-slate-500">{oferta.titulo}</p>
      </div>
      <OfertaEditClient oferta={oferta} empresaId={empresa.id} />
    </>
  );
}
