import { SeguimientoPersonal } from "@/components/postulante/SeguimientoPersonal";
import { requirePostulante } from "@/lib/require-auth";

export default async function PersonalPostulacionesPage() {
  const postulante = await requirePostulante();

  return (
    <>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Hola, {postulante.nombres}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          Mis postulaciones
        </h1>
        <p className="mt-2 max-w-xl text-slate-500">
          Revisa las empresas donde postulaste, el estado de cada vacante y el
          historial de actividad desde la espera de evaluación hasta el resultado.
        </p>
      </header>
      <SeguimientoPersonal dniInicial={postulante.numeroDocumento} autoload />
    </>
  );
}
