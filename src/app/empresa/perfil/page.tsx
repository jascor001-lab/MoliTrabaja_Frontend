import { PerfilEmpresaForm } from "@/components/auth/PerfilEmpresaForm";
import { requireEmpresa } from "@/lib/require-auth";

export default async function PerfilEmpresaPage() {
  await requireEmpresa();

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Perfil de la empresa</h1>
        <p className="text-slate-500 mt-1">Actualiza la información de tu organización.</p>
      </header>
      <PerfilEmpresaForm />
    </>
  );
}
