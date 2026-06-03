import { AppShell } from "@/components/layout/AppShell";
import { OfertaWizard } from "@/components/empresa/OfertaWizard";
import { requireEmpresa } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export default async function PublicarPage() {
  const empresa = await requireEmpresa();

  return (
    <AppShell variant="empresa">
      <div className="mb-8 animate-fade-in motion-reduce:animate-none">
        <h1 className="text-2xl font-bold text-slate-900">Publicar empleo</h1>
        <p className="text-slate-500 mt-1">
          Completa los pasos para publicar en {empresa.nombre}.
        </p>
      </div>
      <OfertaWizard empresaId={empresa.id} />
    </AppShell>
  );
}
