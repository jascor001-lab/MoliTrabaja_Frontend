import { AppShell } from "@/components/layout/AppShell";
import { RegistroEmpresaForm } from "@/components/auth/RegistroEmpresaForm";

export default function RegistroEmpresaPage() {
  return (
    <AppShell variant="portal">
      <div className="mx-auto max-w-lg py-10 px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Registrar empresa</h1>
          <p className="text-sm text-slate-500 mt-2">
            Crea tu cuenta para publicar vacantes y gestionar postulantes.
          </p>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <RegistroEmpresaForm />
        </div>
      </div>
    </AppShell>
  );
}
