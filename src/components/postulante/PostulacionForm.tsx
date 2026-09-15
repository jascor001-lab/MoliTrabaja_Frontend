"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { guardarPostulacionLocal, sincronizarDni } from "@/lib/mis-postulaciones-storage";
import type { OfertaLaboralDTO } from "@/types/bolsa";
import type { ConocimientoPostulanteDTO } from "@/types/catalogos";
import type { DashboardDualResponse } from "@/types/postulacion";

type Props = {
  oferta: OfertaLaboralDTO;
  onSuccess: (response: DashboardDualResponse) => void;
  onCancel: () => void;
};

type PerfilResumen = {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  cvDisponible: boolean;
  cvFilename: string | null;
  conocimientos: ConocimientoPostulanteDTO[];
};

function nombreKey(nombre: string) {
  return nombre.trim().toLowerCase();
}

export function PostulacionForm({ oferta, onSuccess, onCancel }: Props) {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [perfil, setPerfil] = useState<PerfilResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [encaje, setEncaje] = useState<{
    percentage: number;
    tips: string[];
  } | null>(null);

  const cargarEncaje = () => {
    fetch(`/api/ofertas/${oferta.id}/encaje`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.percentage === "number") {
          setEncaje({
            percentage: data.percentage,
            tips: Array.isArray(data.tips) ? data.tips : [],
          });
        }
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then(async (session) => {
        if (!session.authenticated || session.tipo !== "postulante") {
          setLoggedIn(false);
          return;
        }
        setLoggedIn(true);
        const data = await fetch("/api/auth/perfil/postulante").then((r) => r.json());
        if (data.dni || data.numeroDocumento) {
          const dni = data.dni ?? data.numeroDocumento ?? "";
          setPerfil({
            dni,
            nombres: data.nombres ?? "",
            apellidoPaterno: data.apellidoPaterno ?? "",
            apellidoMaterno: data.apellidoMaterno ?? "",
            correo: data.correo ?? "",
            cvDisponible: Boolean(data.cvDisponible),
            cvFilename: data.cvFilename ?? null,
            conocimientos: Array.isArray(data.conocimientos) ? data.conocimientos : [],
          });
          sincronizarDni(dni);
          cargarEncaje();
        }
      })
      .finally(() => setAuthChecked(true));
  }, [oferta.id]);

  const conocimientosFaltantes = useMemo(() => {
    const requeridos = oferta.conocimientosRequeridos ?? [];
    if (!perfil || requeridos.length === 0) return [];
    const ids = new Set(perfil.conocimientos.map((c) => c.conocimientoId));
    const nombres = new Set(perfil.conocimientos.map((c) => nombreKey(c.conocimientoNombre)));
    return requeridos.filter(
      (req) => !ids.has(req.id) && !nombres.has(nombreKey(req.nombre))
    );
  }, [oferta.conocimientosRequeridos, perfil]);

  const añadirConocimiento = async (conocimientoId: number, nombre: string) => {
    setAddError(null);
    setAddingId(conocimientoId);
    try {
      const fd = new FormData();
      fd.append("conocimientoId", String(conocimientoId));
      fd.append("conocimientoNombre", nombre);
      const res = await fetch("/api/auth/perfil/postulante/conocimientos", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.errors?.conocimientoId ?? data.error ?? "No se pudo añadir el conocimiento"
        );
      }
      const agregado = data.conocimiento as ConocimientoPostulanteDTO | undefined;
      setPerfil((prev) => {
        if (!prev) return prev;
        const next = agregado ?? {
          id: `tmp-${conocimientoId}`,
          conocimientoId,
          conocimientoNombre: nombre,
          grupo: "",
          institucion: "",
          documentoDisponible: false,
        };
        if (prev.conocimientos.some((c) => c.conocimientoId === conocimientoId)) {
          return prev;
        }
        return { ...prev, conocimientos: [...prev.conocimientos, next] };
      });
      cargarEncaje();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "No se pudo añadir el conocimiento");
    } finally {
      setAddingId(null);
    }
  };

  if (!authChecked) {
    return <p className="text-sm text-slate-500">Verificando sesión…</p>;
  }

  if (!loggedIn) {
    return (
      <div className="space-y-4 text-center py-4">
        <p className="text-sm text-slate-600">
          Inicia sesión para postular. Tu CV debe estar guardado en Mi perfil.
        </p>
        <Link href="/ingreso">
          <Button className="w-full">Acceder</Button>
        </Link>
        <Button variant="ghost" className="w-full" onClick={onCancel}>
          Volver
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(null);
    if (!perfil?.dni) {
      setError("Completa tu perfil antes de postular.");
      return;
    }
    if (!perfil.cvDisponible) {
      setError("Sube tu CV en Mi perfil → Curriculum antes de postular.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: oferta.id }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string | string[];
        redirect?: string;
      };

      if (!res.ok) {
        const msg =
          (typeof data.message === "string" && data.message) ||
          (Array.isArray(data.message) && data.message.join(" ")) ||
          (data.error &&
          data.error !== "Unprocessable Entity" &&
          data.error !== "Internal server error"
            ? data.error
            : null) ||
          (res.status === 409
            ? "Ya postulaste a esta vacante."
            : res.status === 500
              ? "Error del servidor al registrar la postulación. Revisa que el backend esté actualizado."
              : "No se pudo registrar la postulación");
        if (data.redirect) {
          throw new Error(`${msg}. Actualízalo en Mi perfil.`);
        }
        throw new Error(msg);
      }

      const resData = data as DashboardDualResponse;
      sincronizarDni(perfil.dni);
      localStorage.setItem("molitrabaja_last_job", oferta.id);
      guardarPostulacionLocal({
        application_id: resData.application_id,
        job_id: oferta.id,
        job_title: resData.job_metadata.title,
        empresa: oferta.empresa?.razonSocial || oferta.empresa?.nombre || "Empresa",
        created_at: new Date().toISOString(),
      });
      onSuccess(resData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al postular");
    } finally {
      setLoading(false);
    }
  };

  const nombreCompleto = perfil
    ? `${perfil.nombres} ${perfil.apellidoPaterno} ${perfil.apellidoMaterno}`.trim()
    : "";

  return (
    <div className="space-y-4 border-t border-emerald-100 pt-4 mt-4">
      <h3 className="font-bold text-slate-900">Postular a esta vacante</h3>

      {perfil ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm space-y-2">
          <div>
            <p className="font-semibold text-slate-800">{nombreCompleto}</p>
            <p className="text-slate-500 mt-0.5">
              Doc. {perfil.dni} · {perfil.correo}
            </p>
          </div>
          {encaje && (
            <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    Tu encaje estimado
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perfil + CV PDF vs. esta oferta
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                  {encaje.percentage}%
                </p>
              </div>
              {encaje.tips.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {encaje.tips.slice(0, 3).map((tip) => (
                    <li key={tip} className="text-[11px] text-slate-500">
                      · {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!perfil.cvDisponible && (
            <p className="text-amber-800 text-xs">
              No tienes CV en el perfil.{" "}
              <Link
                href="/personal/perfil?seccion=curriculum"
                className="font-semibold underline"
              >
                Súbelo en Curriculum
              </Link>{" "}
              para poder postular.
            </p>
          )}
          <p className="text-xs text-slate-500">
            ¿Necesitas verificar o actualizar tu CV?{" "}
            <Link
              href="/personal/perfil?seccion=curriculum"
              className="font-medium text-emerald-700 hover:underline"
            >
              Ir a Curriculum
            </Link>
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <Link href="/personal/perfil" className="font-semibold underline">
            Completa tu perfil
          </Link>{" "}
          antes de postular.
        </p>
      )}

      {conocimientosFaltantes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Conocimientos que pide esta oferta
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Añádelos a tu perfil para mejorar el encaje. No es obligatorio para postular.
            </p>
          </div>
          <ul className="space-y-2">
            {conocimientosFaltantes.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-white px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-800">{item.nombre}</span>
                <Button
                  className="!px-3 !py-1.5 !text-xs shrink-0"
                  disabled={addingId === item.id}
                  onClick={() => void añadirConocimiento(item.id, item.nombre)}
                >
                  {addingId === item.id ? "Añadiendo…" : "Añadir"}
                </Button>
              </li>
            ))}
          </ul>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
        </div>
      )}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !perfil?.dni || !perfil?.cvDisponible}
          className="flex-1"
        >
          {loading ? "Postulando…" : "Postular a esta vacante"}
        </Button>
      </div>
    </div>
  );
}
