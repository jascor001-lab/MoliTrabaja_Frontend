import { AppShell } from "@/components/layout/AppShell";
import { PerfilPostulantePanel } from "@/components/postulante/perfil/PerfilPostulantePanel";
import { requirePostulante } from "@/lib/require-auth";

export default async function PerfilPostulantePage() {
  await requirePostulante();

  return (
    <AppShell variant="postulante">
      <header className="mb-8 motion-enter-fade motion-gpu motion-reduce:animate-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Mi cuenta
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="mt-2 max-w-xl text-slate-500">
          Completa tus datos y sube tu CV en la pestaña Curriculum. Ese documento es
          el que revisa la empresa al postular; formación y conocimientos mejoran tu
          porcentaje de encaje.
        </p>
      </header>
      <PerfilPostulantePanel />
    </AppShell>
  );
}
