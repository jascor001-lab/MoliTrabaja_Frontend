import { AppShell } from "@/components/layout/AppShell";
import { RegistroPostulanteForm } from "@/components/auth/RegistroPostulanteForm";

export default function RegistroPostulantePage() {
  return (
    <AppShell variant="portal">
      <div className="mx-auto max-w-lg py-10 px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Crear perfil de postulante</h1>
          <p className="text-sm text-slate-500 mt-2">
            Crea tu cuenta con un correo y contraseña propios; luego completa tus datos
            para postular y dar seguimiento a tus convocatorias.
          </p>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <RegistroPostulanteForm />
        </div>
      </div>
    </AppShell>
  );
}
