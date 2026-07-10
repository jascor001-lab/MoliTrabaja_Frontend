import { AppShell } from "@/components/layout/AppShell";
import { SeguimientoPersonal } from "@/components/postulante/SeguimientoPersonal";
import { requirePostulante } from "@/lib/require-auth";

export default async function PersonalPage() {
  const postulante = await requirePostulante();

  return (
    <AppShell variant="portal">
      <header className="mb-8 px-4 md:px-6 pt-6 motion-enter-fade motion-gpu motion-reduce:animate-none">
        <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
          Hola, {postulante.nombres}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
          Mis postulaciones
        </h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Revisa las empresas donde postulaste, el estado de cada vacante y el historial
          de actividad desde la espera de evaluación hasta el resultado.
        </p>
      </header>
      <div className="px-4 md:px-6 pb-16">
        <SeguimientoPersonal dniInicial={postulante.numeroDocumento} autoload />
      </div>
    </AppShell>
  );
}
