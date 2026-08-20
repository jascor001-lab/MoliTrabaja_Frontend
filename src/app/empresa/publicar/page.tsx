import { OfertaWizard } from "@/components/empresa/OfertaWizard";
import { requireEmpresa } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export default async function PublicarPage() {
  const empresa = await requireEmpresa();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Publicar empleo</h1>
        <p className="text-slate-500 mt-1">
          Completa los pasos para publicar en {empresa.nombre}.
        </p>
      </div>
      <OfertaWizard empresaId={empresa.id} />
    </>
  );
}
