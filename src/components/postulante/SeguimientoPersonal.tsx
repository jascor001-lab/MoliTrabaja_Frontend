"use client";

import { useCallback, useEffect, useState } from "react";

import { HistorialActividadPostulacion } from "@/components/postulante/HistorialActividadPostulacion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SlideView } from "@/components/ui/SlideView";
import { MOTION_REDUCE, staggerDelay } from "@/lib/motion";
import {
  listarPostulacionesLocales,
  sincronizarDni,
  type PostulacionGuardada,
} from "@/lib/mis-postulaciones-storage";
import type { ActividadPostulacion, DashboardDualResponse, MisPostulacionItem } from "@/types/postulacion";

const STATUS_BADGE: Record<string, string> = {
  IN_REVIEW: "bg-amber-100 text-amber-900 border-amber-200",
  INTERVIEW: "bg-blue-100 text-blue-900 border-blue-200",
  ACCEPTED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_UI: Record<string, { color: string }> = {
  IN_REVIEW: { color: "bg-amber-50 border-amber-200" },
  INTERVIEW: { color: "bg-blue-50 border-blue-200" },
  ACCEPTED: { color: "bg-emerald-50 border-emerald-200" },
  REJECTED: { color: "bg-slate-50 border-slate-200" },
};

type Props = {
  dniInicial?: string;
  autoload?: boolean;
};

type ModoBusqueda = "dni" | "codigo";

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SeguimientoPersonal({ dniInicial, autoload = false }: Props) {
  const [modo, setModo] = useState<ModoBusqueda>("dni");
  const [dni, setDni] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [lista, setLista] = useState<MisPostulacionItem[]>([]);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [data, setData] = useState<DashboardDualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(false);
  const [busquedaAbierta, setBusquedaAbierta] = useState(!autoload);

  useEffect(() => {
    if (dniInicial) {
      setDni(dniInicial);
      sincronizarDni(dniInicial);
      return;
    }
    const savedDni = localStorage.getItem("molitrabaja_dni");
    if (savedDni) setDni(savedDni);
  }, [dniInicial]);

  const cargarPorDni = useCallback(async (dniValor?: string) => {
    setLoadingLista(true);
    setError(null);
    try {
      const qs = dniValor && /^\d{8}$/.test(dniValor) ? `?dni=${dniValor}` : "";
      const res = await fetch(`/api/postulaciones/mis${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al cargar");
      const items: MisPostulacionItem[] = json.postulaciones ?? [];
      setLista(items);
      if (json.dni) {
        sincronizarDni(json.dni);
        setDni(json.dni);
      } else if (dniValor) {
        sincronizarDni(dniValor);
      }
      if (items.length === 0) {
        const locales = listarPostulacionesLocales();
        if (locales.length > 0) {
          setLista(
            locales.map((l) => ({
              application_id: l.application_id,
              job_id: l.job_id,
              job_title: l.job_title,
              empresa: l.empresa,
              estado: "En Revisión",
              status_code: "IN_REVIEW",
              match_score_percentage: 0,
              fecha_postulacion: l.created_at,
              last_update: l.created_at,
              activity_history: [],
            }))
          );
        }
      }
    } catch (e) {
      setLista([]);
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoadingLista(false);
    }
  }, []);

  useEffect(() => {
    if (autoload) {
      cargarPorDni(dniInicial);
    }
  }, [autoload, dniInicial, cargarPorDni]);

  const cargarDetalle = async (params: {
    application_id?: string;
    dni?: string;
    job_id?: string;
  }) => {
    setError(null);
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (params.application_id) qs.set("application_id", params.application_id);
      if (params.dni) qs.set("dni", params.dni);
      if (params.job_id) qs.set("job_id", params.job_id);

      const res = await fetch(`/api/postulaciones/seguimiento?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se encontró la postulación");
      setData(json as DashboardDualResponse);
      setSeleccionado(json.application_id);
      if (json.applicant_profile?.dni) {
        sincronizarDni(json.applicant_profile.dni);
        setDni(json.applicant_profile.dni);
      }
      if (json.application_id) setApplicationId(json.application_id);
    } catch (e) {
      setData(null);
      setSeleccionado(null);
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const buscar = () => {
    if (modo === "codigo") {
      const codigo = applicationId.trim().toUpperCase();
      if (!codigo) {
        setError("Ingresa tu código de postulación (ej. APP-2026-1234).");
        return;
      }
      cargarDetalle({ application_id: codigo });
      return;
    }

    if (!/^\d{8}$/.test(dni)) {
      setError("El DNI debe tener 8 dígitos.");
      return;
    }
    cargarPorDni(dni);
  };

  const abrirDesdeLista = (item: MisPostulacionItem | PostulacionGuardada) => {
    setApplicationId(item.application_id);
    setSeleccionado(item.application_id);
    const enLista = lista.find((l) => l.application_id === item.application_id);
    if (enLista?.activity_history.length) {
      setData({
        application_id: enLista.application_id,
        job_metadata: {
          job_id: enLista.job_id,
          title: enLista.job_title,
          empresa: enLista.empresa,
        },
        pestaña_empresa_view: {
          analytics: {
            total_postulantes: 0,
            funnel_summary: {
              inscritos: 0,
              en_proceso: 0,
              finalistas: 0,
              descartados: 0,
              en_revision: 0,
              entrevistas: 0,
              aceptados: 0,
              no_seleccionados: 0,
            },
          },
          candidate_pool_actionable: [],
        },
        pestaña_personal_view: {
          application_id: enLista.application_id,
          target_applicant_dni: dni,
          tracking: {
            status: enLista.estado,
            status_code: enLista.status_code,
            context_message: "",
            competencia_info: { total_rivales_postulando: 0 },
            last_activity_timestamp: enLista.last_update,
            activity_history: enLista.activity_history,
          },
        },
      });
    }
    cargarDetalle({ application_id: item.application_id });
  };

  const tracking = data?.pestaña_personal_view?.tracking;
  const historial: ActividadPostulacion[] =
    tracking?.activity_history ?? [];
  const statusUi = tracking ? STATUS_UI[tracking.status_code] : null;
  const itemLista = seleccionado
    ? lista.find((l) => l.application_id === seleccionado)
    : null;
  const empresaTitulo =
    data?.job_metadata.empresa || itemLista?.empresa || "Empresa";
  const puestoTitulo = data?.job_metadata.title || itemLista?.job_title;

  return (
    <div className="space-y-6">
      {autoload && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Empresas donde postulaste
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Estado de cada postulación e historial desde el envío hasta la
                evaluación y el resultado.
              </p>
            </div>
            {loadingLista && (
              <span className="text-sm text-emerald-600 font-medium">Cargando…</span>
            )}
          </div>

          {!loadingLista && lista.length === 0 && (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-8 text-center">
              <p className="font-medium text-slate-800">Aún no tienes postulaciones</p>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Cuando postules a una vacante, verás aquí la empresa, el estado y el
                historial de actividad (espera, evaluación y resultado).
              </p>
            </div>
          )}

          {lista.length > 0 && (
            <ul className="space-y-3">
              {lista.map((item, i) => {
                const activa = seleccionado === item.application_id;
                const badge = STATUS_BADGE[item.status_code] ?? STATUS_BADGE.IN_REVIEW;
                return (
                  <li
                    key={item.application_id}
                    className={`motion-stagger-in motion-gpu ${MOTION_REDUCE}`}
                    style={{ animationDelay: `${staggerDelay(i, 40)}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => abrirDesdeLista(item)}
                      className={`w-full text-left rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 motion-reduce:transform-none ${
                        activa
                          ? "border-emerald-400 ring-2 ring-emerald-100"
                          : "border-emerald-100 hover:border-emerald-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-wrap justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-slate-900 truncate">
                            {item.empresa}
                          </p>
                          <p className="text-sm text-slate-600 mt-0.5">{item.job_title}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Postulaste el {formatearFecha(item.fecha_postulacion)} ·{" "}
                            <span className="font-mono text-emerald-700">
                              {item.application_id}
                            </span>
                          </p>
                        </div>
                        <span
                          className={`shrink-0 self-start rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}
                        >
                          {item.estado}
                        </span>
                      </div>
                      {item.activity_history.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-emerald-50">
                          <HistorialActividadPostulacion
                            historial={item.activity_history}
                            compact
                          />
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        {autoload ? (
          <button
            type="button"
            onClick={() => setBusquedaAbierta((v) => !v)}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            {busquedaAbierta ? "Ocultar búsqueda" : "Buscar por DNI o código"}
          </button>
        ) : (
          <>
            <h2 className="font-bold text-slate-900">Mis postulaciones</h2>
            <p className="text-sm text-slate-500">
              Busca con tu <strong>DNI</strong> para ver todas tus postulaciones o con el{" "}
              <strong>código</strong> que recibiste al enviar (ej. APP-2026-1234).
            </p>
          </>
        )}

        {(busquedaAbierta || !autoload) && (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModo("dni")}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold border transition ${
                  modo === "dni"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-emerald-200 text-emerald-800"
                }`}
              >
                Por DNI
              </button>
              <button
                type="button"
                onClick={() => setModo("codigo")}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold border transition ${
                  modo === "codigo"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-emerald-200 text-emerald-800"
                }`}
              >
                Por código
              </button>
            </div>

            <SlideView viewKey={modo} direction="fade">
              {modo === "dni" ? (
                <Input
                  label="Tu DNI"
                  value={dni}
                  maxLength={8}
                  inputMode="numeric"
                  placeholder="12345678"
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                />
              ) : (
                <Input
                  label="Código de postulación"
                  value={applicationId}
                  placeholder="APP-2026-1234"
                  onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                />
              )}
            </SlideView>

            <Button onClick={buscar} disabled={loading || loadingLista}>
              {loading || loadingLista ? "Buscando…" : "Buscar"}
            </Button>
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {!autoload && modo === "dni" && lista.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3">
            Tus postulaciones ({lista.length})
          </h3>
          <ul className="space-y-3">
            {lista.map((item, i) => (
              <li
                key={item.application_id}
                className={`motion-stagger-in motion-gpu ${MOTION_REDUCE}`}
                style={{ animationDelay: `${staggerDelay(i, 30)}ms` }}
              >
                <button
                  type="button"
                  onClick={() => abrirDesdeLista(item)}
                  className="w-full text-left rounded-xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50 px-4 py-4 transition-all duration-300"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{item.empresa}</p>
                      <p className="text-sm text-slate-600">{item.job_title}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold rounded-full border px-2 py-1 shrink-0 ${
                        STATUS_BADGE[item.status_code] ?? STATUS_BADGE.IN_REVIEW
                      }`}
                    >
                      {item.estado}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tracking && data && (
        <SlideView
          viewKey={data.application_id}
          direction="forward"
          className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase">
                Detalle de postulación
              </p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{empresaTitulo}</h3>
              <p className="text-sm text-slate-600 mt-0.5">{puestoTitulo}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
              <p className="text-[10px] uppercase text-emerald-600 font-semibold">Código</p>
              <p className="font-mono font-bold text-emerald-900 text-sm">
                {data.application_id}
              </p>
            </div>
          </div>

          <div className={`rounded-xl border px-4 py-4 ${statusUi?.color ?? "bg-emerald-50"}`}>
            <p className="text-xs font-semibold uppercase text-slate-500">Estado actual</p>
            <p className="font-bold text-lg mt-1">{tracking.status}</p>
            {tracking.context_message && (
              <p className="text-sm mt-2 leading-relaxed text-slate-700">
                {tracking.context_message}
              </p>
            )}
            {tracking.competencia_info.total_rivales_postulando > 0 && (
              <p className="text-sm font-medium mt-4 text-slate-700">
                Estás compitiendo con{" "}
                <strong>{tracking.competencia_info.total_rivales_postulando}</strong>{" "}
                postulante
                {tracking.competencia_info.total_rivales_postulando !== 1 ? "s" : ""}{" "}
                más en esta vacante.
              </p>
            )}
          </div>

          {historial.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">
                Historial de actividad
              </h4>
              <HistorialActividadPostulacion historial={historial} />
            </div>
          )}

          <p className="text-xs text-slate-400">
            Última actualización:{" "}
            {new Date(tracking.last_activity_timestamp).toLocaleString("es-PE")}
          </p>
        </SlideView>
      )}
    </div>
  );
}
