import { AppShell } from "@/components/layout/AppShell";
import { CrearUsuarioForm } from "@/components/admin/CrearUsuarioForm";
import { requireAdmin } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export default async function NuevoUsuarioPage() {
  await requireAdmin();
  return (
    <AppShell variant="admin">
      <header className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Usuarios</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Crear usuario</h1>
        <p className="mt-2 text-slate-500">
          Elige el rol. Si es empresa o postulante, también se crea su perfil.
        </p>
      </header>
      <CrearUsuarioForm />
    </AppShell>
  );
}
