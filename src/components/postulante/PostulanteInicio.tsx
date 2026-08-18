import Link from "next/link";

import { InicioAccionCard, InicioStatCard } from "@/components/inicio/InicioCards";
import { APP_NAME } from "@/lib/brand";
import { esOfertaNueva, formatFechaCorta } from "@/lib/format-fecha";
import { MOTION_REDUCE } from "@/lib/motion";
import { MODALIDAD_LABEL, type OfertaLaboralDTO } from "@/types/bolsa";
import type { MisPostulacionItem } from "@/types/postulacion";

type Props = {
  nombres: string;
  postulaciones: MisPostulacionItem[];
  ofertas: OfertaLaboralDTO[];
  cvDisponible: boolean;
};

const BADGE: Record<string, string> = {
  IN_REVIEW: "bg-amber-100 text-amber-900",
  INTERVIEW: "bg-blue-100 text-blue-900",
  ACCEPTED: "bg-emerald-100 text-emerald-900",
  REJECTED: "bg-slate-100 text-slate-700",
};

export function PostulanteInicio({
  nombres,
  postulaciones,
  ofertas,
  cvDisponible,
}: Props) {
  const enRevision = postulaciones.filter(
    (p) => p.status_code === "IN_REVIEW" || p.status_code === "INTERVIEW"
  ).length;
  const aceptadas = postulaciones.filter((p) => p.status_code === "ACCEPTED").length;
  const idsPostulados = new Set(postulaciones.map((p) => p.job_id).filter(Boolean));
  const recientes = [...postulaciones]
    .sort(
      (a, b) =>
        new Date(b.fecha_postulacion).getTime() -
        new Date(a.fecha_postulacion).getTime()
    )
    .slice(0, 3);
  const sugeridas = [...ofertas]
    .filter((o) => !idsPostulados.has(o.id))
    .sort((a, b) => {
      const na = esOfertaNueva(a.fechaPublicacion) ? 1 : 0;
      const nb = esOfertaNueva(b.fechaPublicacion) ? 1 : 0;
      if (nb !== na) return nb - na;
      return (
        new Date(b.fechaPublicacion).getTime() -
        new Date(a.fechaPublicacion).getTime()
      );
    })
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <header className={`motion-enter-fade motion-gpu ${MOTION_REDUCE}`}>
        <p className="text-sm font-medium text-emerald-600">
          {APP_NAME} · Mi espacio
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          Hola, {nombres}
        </h1>
        <p className="mt-2 max-w-xl text-slate-500">
          Este es tu inicio. Explora ofertas, sigue tus postulaciones y completa tu
          perfil para postular más rápido.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InicioStatCard
          index={0}
          label="Postulaciones"
          value={postulaciones.length}
        />
        <InicioStatCard index={1} label="En proceso" value={enRevision} />
        <InicioStatCard index={2} label="Aceptadas" value={aceptadas} />
        <InicioStatCard
          index={3}
          label="Curriculum"
          value={cvDisponible ? "Listo" : "Pendiente"}
          hint={cvDisponible ? "CV en tu perfil" : "Súbelo para postular"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InicioAccionCard
          index={0}
          primary
          href="/"
          title="Ver ofertas"
          description="Explora vacantes activas en el portal."
          cta="Ir al portal"
        />
        <InicioAccionCard
          index={1}
          href="/personal/postulaciones"
          title="Mis postulaciones"
          description="Revisa el estado y el historial de cada proceso."
          cta="Ver seguimiento"
        />
        <InicioAccionCard
          index={2}
          href="/personal/perfil"
          title="Mi perfil"
          description="Datos personales, formación y conocimientos."
          cta="Completar perfil"
        />
        <InicioAccionCard
          index={3}
          href="/personal/perfil?seccion=curriculum"
          title="Curriculum"
          description={
            cvDisponible
              ? "Ya tienes un CV. Puedes reemplazarlo cuando quieras."
              : "Sube tu CV: es el documento que revisa la empresa."
          }
          cta={cvDisponible ? "Ver curriculum" : "Subir CV"}
        />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Tus postulaciones</h2>
          {postulaciones.length > 0 ? (
            <Link
              href="/personal/postulaciones"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Ver todas
            </Link>
          ) : null}
        </div>

        {recientes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-10 text-center">
            <p className="text-slate-600">Aún no has postulado a ninguna oferta.</p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline"
            >
              Buscar empleos →
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3">
            {recientes.map((item) => (
              <li key={item.application_id}>
                <Link
                  href="/personal/postulaciones"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm hover:border-emerald-300"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{item.job_title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {item.empresa} · {formatFechaCorta(item.fecha_postulacion)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      BADGE[item.status_code] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.estado}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sugeridas.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Ofertas para ti</h2>
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Ver portal
            </Link>
          </div>
          <ul className="grid gap-3">
            {sugeridas.map((oferta) => (
              <li key={oferta.id}>
                <Link
                  href="/"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm hover:border-emerald-300"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{oferta.titulo}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {oferta.empresa?.razonSocial ||
                        oferta.empresa?.nombre ||
                        "Empresa"}{" "}
                      · {MODALIDAD_LABEL[oferta.modalidad]}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">
                    Ver →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
