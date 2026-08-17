import { AppShell } from "@/components/layout/AppShell";
import { PerfilPostulantePanel } from "@/components/postulante/perfil/PerfilPostulantePanel";
import { requirePostulante } from "@/lib/require-auth";

export default async function PerfilPostulantePage() {
  await requirePostulante();

  return (
    <AppShell variant="portal">
      <header className="mb-8 px-4 md:px-6 pt-6 motion-enter-fade motion-gpu motion-reduce:animate-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Mi cuenta
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Mi perfil</h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Completa tus datos y sube tu CV en la pestaña Curriculum. Ese documento es
          el que revisa la empresa al postular; formación y conocimientos mejoran tu
          porcentaje de encaje.
        </p>
      </header>
      <div className="px-4 md:px-6 pb-10">
        <PerfilPostulantePanel />
      </div>
    </AppShell>
  );
}
