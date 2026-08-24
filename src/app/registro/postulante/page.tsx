import { AppShell } from "@/components/layout/AppShell";
import { RegistroPostulanteForm } from "@/components/auth/RegistroPostulanteForm";
import { APP_NAME } from "@/lib/brand";

export default function RegistroPostulantePage() {
  return (
    <AppShell variant="portal">
      <div className="scroll-panel h-full min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-16 md:px-6 md:py-10">
          <header className="mb-6 md:mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Ficha de postulante
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Crear cuenta
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Completa tus datos para registrarte en {APP_NAME}. Te enviaremos un código al
              correo para confirmar la cuenta. Las empresas las crea un administrador.
            </p>
          </header>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
            <RegistroPostulanteForm />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
