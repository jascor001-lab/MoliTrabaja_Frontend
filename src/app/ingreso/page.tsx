import { Suspense } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function IngresoPage() {
  return (
    <AppShell variant="portal">
      <div className="mx-auto max-w-md py-10 px-4">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Ingresar a MoliTrabaja</h1>
          <p className="text-sm text-slate-500 mt-2">
            Ingresa con tu correo y contraseña.
          </p>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense fallback={<p className="text-sm text-slate-400">Cargando…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
