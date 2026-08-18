import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";

export default function RegistroEmpresaPage() {
  return (
    <AppShell variant="portal">
      <div className="mx-auto max-w-lg py-10 px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Registro de empresa</h1>
          <p className="text-sm text-slate-500 mt-2">
            El registro público está cerrado. Un administrador debe crear tu usuario.
          </p>
        </header>
        <Link
          href="/ingreso"
          className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Ir a ingresar
        </Link>
      </div>
    </AppShell>
  );
}
