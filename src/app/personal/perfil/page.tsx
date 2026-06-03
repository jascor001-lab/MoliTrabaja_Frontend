import { AppShell } from "@/components/layout/AppShell";
import { PerfilPostulanteForm } from "@/components/auth/PerfilPostulanteForm";
import { requirePostulante } from "@/lib/require-auth";

export default async function PerfilPostulantePage() {
  await requirePostulante();

  return (
    <AppShell variant="portal">
      <header className="mb-8 px-4 md:px-6 pt-6">
        <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-slate-500 mt-1">Mantén tus datos de contacto actualizados.</p>
      </header>
      <div className="px-4 md:px-6 pb-10">
        <PerfilPostulanteForm />
      </div>
    </AppShell>
  );
}
