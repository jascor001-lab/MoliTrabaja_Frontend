"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SlideView } from "@/components/ui/SlideView";
import { MOTION_REDUCE, staggerDelay } from "@/lib/motion";
import {
  listarPostulacionesLocales,
  sincronizarDni,
  type PostulacionGuardada,
} from "@/lib/mis-postulaciones-storage";
import type { DashboardDualResponse, MisPostulacionItem } from "@/types/postulacion";

const STATUS_UI: Record<string, { color: string }> = {
  IN_REVIEW: { color: "bg-amber-100 text-amber-900 border-amber-200" },
  INTERVIEW: { color: "bg-blue-100 text-blue-900 border-blue-200" },
  ACCEPTED: { color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  REJECTED: { color: "bg-slate-100 text-slate-700 border-slate-200" },
};

type Props = {
  dniInicial?: string;
  autoload?: boolean;
};

type ModoBusqueda = "dni" | "codigo";

export function SeguimientoPersonal({ dniInicial, autoload = false }: Props) {
  const [modo, setModo] = useState<ModoBusqueda>("dni");
  const [dni, setDni] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [lista, setLista] = useState<MisPostulacionItem[]>([]);
  const [data, setData] = useState<DashboardDualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(false);

  useEffect(() => {
    if (dniInicial) {
      setDni(dniInicial);
      sincronizarDni(dniInicial);
      return;
    }
    const savedDni = localStorage.getItem("molitrabaja_dni");
    if (savedDni) setDni(savedDni);
  }, [dniInicial]);

  const cargarPorDni = useCallback(async (dniValor: string) => {
    if (!/^\d{8}$/.test(dniValor)) return;
    setLoadingLista(true);
    setError(null);
    try {
      const res = await fetch(`/api/postulaciones/mis?dni=${dniValor}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al cargar");
      setLista(json.postulaciones ?? []);
      sincronizarDni(dniValor);
    } catch (e) {
      setLista([]);
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoadingLista(false);
    }
  }, []);

  useEffect(() => {
    if (autoload && dniInicial && /^\d{8}$/.test(dniInicial)) {
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
      if (json.applicant_profile?.dni) {
        sincronizarDni(json.applicant_profile.dni);
        setDni(json.applicant_profile.dni);
      }
      if (json.application_id) setApplicationId(json.application_id);
    } catch (e) {
      setData(null);
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
    cargarDetalle({ application_id: item.application_id });
  };

  useEffect(() => {
    const locales = listarPostulacionesLocales();
    if (locales.length > 0 && !dni) {
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
        }))
      );
    }
  }, [dni]);

  const tracking = data?.pestaña_personal_view?.tracking;
  const profile = data?.applicant_profile;
  const statusUi = tracking ? STATUS_UI[tracking.status_code] : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900">Mis postulaciones</h2>
        <p className="text-sm text-slate-500">
          Busca con tu <strong>DNI</strong> para ver todas tus postulaciones o con el{" "}
          <strong>código</strong> que recibiste al enviar (ej. APP-2026-1234).
        </p>

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
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {modo === "dni" && lista.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3">
            Tus postulaciones ({lista.length})
          </h3>
          <ul className="space-y-2">
            {lista.map((item, i) => (
              <li
                key={item.application_id}
                className={`animate-reveal-up ${MOTION_REDUCE}`}
                style={{ animationDelay: `${staggerDelay(i, 30)}ms` }}
              >
                <button
                  type="button"
                  onClick={() => abrirDesdeLista(item)}
                  className="w-full text-left rounded-xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50 px-4 py-3 transition-all duration-300 hover:translate-x-0.5 motion-reduce:transform-none"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{item.job_title}</p>
                      <p className="text-xs text-slate-500">{item.empresa}</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-700 shrink-0">
                      {item.application_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.estado}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tracking && profile && data && (
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
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {profile.nombre_completo}
              </h3>
              <p className="text-sm text-slate-500">{data.job_metadata.title}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
              <p className="text-[10px] uppercase text-emerald-600 font-semibold">Tu ID</p>
              <p className="font-mono font-bold text-emerald-900 text-sm">
                {data.application_id}
              </p>
            </div>
          </div>

          <div className={`rounded-xl border px-4 py-4 ${statusUi?.color ?? "bg-emerald-50"}`}>
            <p className="font-bold text-lg">{tracking.status}</p>
            <p className="text-sm mt-2 leading-relaxed">{tracking.context_message}</p>
            <p className="text-sm font-medium mt-4 text-slate-700">
              Estás compitiendo con{" "}
              <strong>{tracking.competencia_info.total_rivales_postulando}</strong>{" "}
              postulante
              {tracking.competencia_info.total_rivales_postulando !== 1 ? "s" : ""}.
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Última actualización:{" "}
            {new Date(tracking.last_activity_timestamp).toLocaleString("es-PE")}
          </p>
        </SlideView>
      )}
    </div>
  );
}
