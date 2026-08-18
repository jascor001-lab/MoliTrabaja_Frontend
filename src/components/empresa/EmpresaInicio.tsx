import Link from "next/link";

import { InicioAccionCard, InicioStatCard } from "@/components/inicio/InicioCards";
import { APP_NAME } from "@/lib/brand";
import { MOTION_REDUCE } from "@/lib/motion";
import { MODALIDAD_LABEL, type OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  empresaNombre: string;
  ofertas: OfertaLaboralDTO[];
};

export function EmpresaInicio({
  empresaNombre,
  ofertas,
}: Props) {
  const activas = ofertas.filter((o) => o.estado === "Activa").length;
  const pausadas = ofertas.filter((o) => o.estado !== "Activa").length;
  const vacantes = ofertas.reduce((acc, o) => acc + (o.cantidadVacantes || 0), 0);
  const recientes = [...ofertas]
    .sort(
      (a, b) =>
        new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
    )
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <header className={`motion-enter-fade motion-gpu ${MOTION_REDUCE}`}>
        <p className="text-sm font-medium text-emerald-600">
          {APP_NAME} · Panel empresa
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          Hola, {empresaNombre}
        </h1>
        <p className="mt-2 max-w-xl text-slate-500">
          Este es tu inicio. Publica vacantes, revisa postulantes y actualiza el
          perfil de tu organización.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InicioStatCard
          index={0}
          label="Ofertas publicadas"
          value={ofertas.length}
        />
        <InicioStatCard index={1} label="Activas" value={activas} />
        <InicioStatCard index={2} label="Pausadas" value={pausadas} />
        <InicioStatCard index={3} label="Vacantes" value={vacantes} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InicioAccionCard
          index={0}
          primary
          href="/empresa/publicar"
          title="Publicar empleo"
          description="Crea una vacante y publícala en el portal."
          cta="Nueva oferta"
        />
        <InicioAccionCard
          index={1}
          href="/empresa/ofertas"
          title="Mis ofertas"
          description="Edita convocatorias y gestiona postulantes."
          cta="Ver ofertas"
        />
        <InicioAccionCard
          index={2}
          href="/empresa/perfil"
          title="Perfil de la empresa"
          description="Logo, datos de contacto y descripción."
          cta="Editar perfil"
        />
        <InicioAccionCard
          index={3}
          href="/"
          title="Portal público"
          description="Así ven tus ofertas las personas que postulan."
          cta="Ver portal"
        />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Ofertas recientes</h2>
          {ofertas.length > 0 ? (
            <Link
              href="/empresa/ofertas"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Ver todas
            </Link>
          ) : null}
        </div>

        {recientes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-10 text-center">
            <p className="text-slate-600">Aún no tienes ofertas publicadas.</p>
            <Link
              href="/empresa/publicar"
              className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline"
            >
              Crear primera oferta →
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3">
            {recientes.map((oferta) => (
              <li key={oferta.id}>
                <Link
                  href={`/empresa/ofertas/${oferta.id}/postulantes`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm hover:border-emerald-300"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{oferta.titulo}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {MODALIDAD_LABEL[oferta.modalidad]} · {oferta.salario}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      oferta.estado === "Activa"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {oferta.estado}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
