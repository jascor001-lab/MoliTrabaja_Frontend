"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CvViewerModal } from "@/components/empresa/CvViewerModal";
import { Button } from "@/components/ui/Button";
import { MOTION_REDUCE, staggerDelay } from "@/lib/motion";
import type {
  AccionReclutador,
  CandidateActionable,
  CarpetaReclutador,
  DashboardDualResponse,
} from "@/types/postulacion";
import { CARPETAS_RECLUTADOR } from "@/types/postulacion";

type Props = {
  ofertaId: string;
};

/** Solo avance: Inscritos → En proceso → Finalistas. Sin retroceso. */
const ACCIONES_POR_CARPETA: Record<CarpetaReclutador, AccionReclutador[]> = {
  Inscritos: ["Mover a En proceso", "Descartar"],
  "En proceso": ["Mover a Finalistas", "Descartar"],
  Finalistas: ["Descartar"],
  Descartados: [],
};

const CARPETA_META: Record<
  CarpetaReclutador,
  { description: string; funnelKey: "inscritos" | "en_proceso" | "finalistas" | "descartados" }
> = {
  Inscritos: {
    description: "Candidatos recién postulados. Revisa su CV y porcentaje de encaje.",
    funnelKey: "inscritos",
  },
  "En proceso": {
    description: "Aspirantes en evaluación o entrevista.",
    funnelKey: "en_proceso",
  },
  Finalistas: {
    description: "Candidatos preseleccionados o aceptados.",
    funnelKey: "finalistas",
  },
  Descartados: {
    description: "Perfiles que no continúan en el proceso.",
    funnelKey: "descartados",
  },
};

function EncajeBar({
  label,
  score,
  weight,
  hint,
}: {
  label: string;
  score: number;
  weight: number;
  hint?: string;
}) {
  if (weight <= 0) return null;
  const pct = Math.round((score / weight) * 100);
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="tabular-nums text-slate-500">
          {score}/{weight}
          {hint ? ` · ${hint}` : ""}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RequisitoChips({
  requeridos,
  cumplidos,
  vacio,
}: {
  requeridos: string[];
  cumplidos: string[];
  vacio: string;
}) {
  if (requeridos.length === 0) {
    return <p className="text-xs text-slate-400 italic">{vacio}</p>;
  }

  const cumplidosSet = new Set(cumplidos.map((c) => c.trim().toLowerCase()));

  return (
    <div className="flex flex-wrap gap-1.5">
      {requeridos.map((item) => {
        const ok = cumplidosSet.has(item.trim().toLowerCase());
        return (
          <span
            key={item}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              ok
                ? "bg-emerald-50 text-emerald-800 border border-emerald-400"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                ok ? "bg-emerald-600" : "bg-slate-400"
              }`}
            />
            {item}
          </span>
        );
      })}
    </div>
  );
}

function accionClase(accion: AccionReclutador): string {
  if (accion === "Descartar") {
    return "border-slate-200 text-slate-600 hover:bg-slate-50";
  }
  if (accion === "Mover a Finalistas") {
    return "border-emerald-300 text-emerald-800 hover:bg-emerald-50";
  }
  return "border-emerald-200 text-emerald-800 hover:bg-emerald-50";
}

export function PostulantesOfertaPanel({ ofertaId }: Props) {
  const [data, setData] = useState<DashboardDualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [carpetaActiva, setCarpetaActiva] = useState<CarpetaReclutador>("Inscritos");
  const [cvAbierto, setCvAbierto] = useState<CandidateActionable | null>(null);
  const [moviendo, setMoviendo] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ofertas/${ofertaId}/postulaciones`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al cargar");
      setData(json as DashboardDualResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [ofertaId]);

  useEffect(() => {
    load();
  }, [load]);

  const funnel = data?.pestaña_empresa_view.analytics.funnel_summary;
  const pool = data?.pestaña_empresa_view.candidate_pool_actionable ?? [];

  const ejecutarAccion = async (dni: string, action: AccionReclutador) => {
    const candidato = pool.find((p) => p.dni === dni);
    if (!candidato || !ACCIONES_POR_CARPETA[candidato.carpeta].includes(action)) {
      return;
    }
    setMoviendo(dni);
    try {
      await fetch("/api/postulaciones/accion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, job_id: ofertaId, action }),
      });
      await load();
    } finally {
      setMoviendo(null);
    }
  };

  const filtrados = useMemo(
    () =>
      pool
        .filter((p) => p.carpeta === carpetaActiva)
        .sort((a, b) => b.match_score_percentage - a.match_score_percentage),
    [pool, carpetaActiva]
  );

  if (loading) return <p className="text-sm text-slate-500">Cargando postulantes…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data || !funnel) return null;

  const { analytics } = data.pestaña_empresa_view;

  return (
    <div className="space-y-6">
      {cvAbierto?.cv_view_url && (
        <CvViewerModal
          candidateName={cvAbierto.nombre}
          viewUrl={cvAbierto.cv_view_url}
          fileName={cvAbierto.cv_filename}
          formato={cvAbierto.cv_formato}
          onClose={() => setCvAbierto(null)}
        />
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-600">
            Gestión de postulantes
          </p>
          <h3 className="text-lg font-bold text-slate-900">{data.job_metadata.title}</h3>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {analytics.total_postulantes}{" "}
            <span className="text-sm font-medium text-slate-500">postulantes</span>
          </p>
        </div>
        <Button variant="secondary" onClick={load}>
          Actualizar
        </Button>
      </div>

      {/* Carpetas estilo Computrabajo */}
      <div
        className="flex flex-wrap gap-1 rounded-xl border border-emerald-100 bg-emerald-50/40 p-1"
        role="tablist"
        aria-label="Carpetas de candidatos"
      >
        {CARPETAS_RECLUTADOR.map((carpeta) => {
          const count = funnel[CARPETA_META[carpeta].funnelKey];
          const active = carpetaActiva === carpeta;
          return (
            <button
              key={carpeta}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCarpetaActiva(carpeta)}
              className={`flex-1 min-w-[7.5rem] rounded-lg px-3 py-2.5 text-center transition ${
                active
                  ? "bg-white shadow-sm text-emerald-900 font-bold"
                  : "text-slate-600 hover:bg-white/60 font-semibold"
              }`}
            >
              <span className="block text-sm">{carpeta}</span>
              <span
                className={`block text-lg tabular-nums ${
                  active ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-500">{CARPETA_META[carpetaActiva].description}</p>

      {filtrados.length === 0 ? (
        <p className="text-sm text-slate-500 rounded-xl border border-dashed border-slate-200 p-8 text-center">
          No hay candidatos en <strong>{carpetaActiva}</strong>.
          {analytics.total_postulantes === 0
            ? " Aún no hay postulaciones para esta vacante."
            : carpetaActiva === "Inscritos"
              ? " Espera nuevas postulaciones."
              : " Avanza candidatos desde la etapa anterior del embudo."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((p, i) => {
            const tieneReq =
              p.requisitos.carreras_requeridas.length > 0 ||
              p.requisitos.conocimientos_requeridos.length > 0;

            return (
              <li
                key={p.dni}
                className={`rounded-xl border border-emerald-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-500 ease-fluid motion-stagger-in motion-gpu ${MOTION_REDUCE}`}
                style={{ animationDelay: `${staggerDelay(i, 40)}ms` }}
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-bold text-slate-900 text-base">{p.nombre}</p>
                    <p className="text-sm text-slate-500">
                      Doc. {p.dni} · {p.edad} años
                    </p>
                    {p.tiene_discapacidad && (
                      <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                        Puestos inclusivos
                      </span>
                    )}
                    <p className="text-sm text-slate-600">
                      <span className="text-slate-400">Correo:</span> {p.correo}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="text-slate-400">Celular:</span> {p.telefono}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                      {p.match_score_percentage}%
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Encaje
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coincidencia con el puesto
                    </p>
                  </div>
                </div>

                {p.match_detalle && (
                  <div className="mt-3 rounded-xl border border-emerald-50 bg-slate-50/80 px-3 py-3 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Cómo se calcula este encaje
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <EncajeBar
                        label="Carreras"
                        score={p.match_detalle.carreras.score}
                        weight={p.match_detalle.carreras.weight}
                      />
                      <EncajeBar
                        label="Conocimientos"
                        score={p.match_detalle.conocimientos.score}
                        weight={p.match_detalle.conocimientos.weight}
                      />
                      <EncajeBar
                        label="CV (PDF)"
                        score={p.match_detalle.cv.score}
                        weight={p.match_detalle.cv.weight}
                      />
                      <EncajeBar
                        label="Experiencia"
                        score={p.match_detalle.experiencia.score}
                        weight={p.match_detalle.experiencia.weight}
                        hint={
                          p.match_detalle.experiencia.years > 0
                            ? `${p.match_detalle.experiencia.years} año(s) en CV`
                            : undefined
                        }
                      />
                    </div>
                    {p.match_detalle.cv.hits.length > 0 && (
                      <p className="text-[11px] text-slate-500">
                        Coincidencias en CV:{" "}
                        <span className="font-medium text-slate-700">
                          {p.match_detalle.cv.hits.slice(0, 6).join(", ")}
                          {p.match_detalle.cv.hits.length > 6 ? "…" : ""}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {tieneReq && (
                  <div className="mt-3 space-y-2 border-t border-emerald-50 pt-3">
                    {p.requisitos.carreras_requeridas.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          Carreras requeridas
                        </p>
                        <RequisitoChips
                          requeridos={p.requisitos.carreras_requeridas}
                          cumplidos={p.requisitos.carreras_cumplidas}
                          vacio="Sin carreras requeridas"
                        />
                      </div>
                    )}
                    {p.requisitos.conocimientos_requeridos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          Conocimientos requeridos
                        </p>
                        <RequisitoChips
                          requeridos={p.requisitos.conocimientos_requeridos}
                          cumplidos={p.requisitos.conocimientos_cumplidos}
                          vacio="Sin conocimientos requeridos"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {p.cv_available && p.cv_view_url ? (
                    <Button
                      className="!py-2 !px-4 !text-sm"
                      onClick={() => setCvAbierto(p)}
                    >
                      Ver CV
                      {p.cv_formato === "pdf"
                        ? " (PDF)"
                        : p.cv_formato === "word"
                          ? " (Word)"
                          : ""}
                    </Button>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      CV no disponible — pide al candidato que vuelva a postular
                    </span>
                  )}

                  {ACCIONES_POR_CARPETA[p.carpeta].map((action) => (
                    <button
                      key={action}
                      type="button"
                      disabled={moviendo === p.dni}
                      onClick={() => void ejecutarAccion(p.dni, action)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition disabled:opacity-50 ${accionClase(action)}`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
