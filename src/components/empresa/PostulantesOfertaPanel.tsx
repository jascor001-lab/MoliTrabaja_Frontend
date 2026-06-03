"use client";

import { useCallback, useEffect, useState } from "react";

import { CvViewerModal } from "@/components/empresa/CvViewerModal";
import { Button } from "@/components/ui/Button";
import { MOTION_REDUCE, staggerDelay } from "@/lib/motion";
import type {
  AccionReclutador,
  CandidateActionable,
  DashboardDualResponse,
} from "@/types/postulacion";

type Props = {
  ofertaId: string;
};

export function PostulantesOfertaPanel({ ofertaId }: Props) {
  const [data, setData] = useState<DashboardDualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cvAbierto, setCvAbierto] = useState<CandidateActionable | null>(null);

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

  const ejecutarAccion = async (dni: string, action: AccionReclutador) => {
    await fetch("/api/postulaciones/accion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni, job_id: ofertaId, action }),
    });
    load();
  };

  if (loading) return <p className="text-sm text-slate-500">Cargando postulantes…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return null;

  const { analytics, candidate_pool_actionable } = data.pestaña_empresa_view;
  const funnel = analytics.funnel_summary;

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
          <p className="text-xs font-semibold uppercase text-emerald-600">Pestaña Empresa</p>
          <h3 className="text-lg font-bold text-slate-900">{data.job_metadata.title}</h3>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {analytics.total_postulantes}{" "}
            <span className="text-sm font-medium text-slate-500">postulantes únicos</span>
          </p>
        </div>
        <Button variant="secondary" onClick={load}>
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "En revisión", value: funnel.en_revision },
          { label: "Entrevistas", value: funnel.entrevistas },
          { label: "Aceptados", value: funnel.aceptados },
          { label: "No seleccionados", value: funnel.no_seleccionados },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center"
          >
            <p className="text-2xl font-bold text-emerald-800">{item.value}</p>
            <p className="text-xs text-slate-600 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {candidate_pool_actionable.length === 0 ? (
        <p className="text-sm text-slate-500 rounded-xl border border-dashed p-6 text-center">
          Aún no hay postulantes para esta vacante.
        </p>
      ) : (
        <ul className="space-y-3">
          {candidate_pool_actionable.map((p, i) => (
            <li
              key={p.dni}
              className={`rounded-xl border border-emerald-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 animate-reveal-up ${MOTION_REDUCE}`}
              style={{ animationDelay: `${staggerDelay(i, 40)}ms` }}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{p.nombre}</p>
                  <p className="text-sm text-slate-500">
                    DNI {p.dni} · {p.edad} años
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-700">
                    {p.match_score_percentage}%
                  </p>
                  <p className="text-xs text-slate-500">Match CV</p>
                </div>
              </div>
              <p className="text-xs font-medium text-emerald-800 mt-2">
                {p.current_status}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p.cv_available && p.cv_view_url ? (
                  <Button
                    variant="secondary"
                    className="!py-1.5 !px-3 !text-xs"
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
                  <span className="text-xs text-slate-400 italic">CV no disponible</span>
                )}
                {p.available_actions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => ejecutarAccion(p.dni, action)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-50 transition"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
