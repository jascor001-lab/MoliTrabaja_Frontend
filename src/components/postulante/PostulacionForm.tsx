"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { guardarPostulacionLocal, sincronizarDni } from "@/lib/mis-postulaciones-storage";
import type { DashboardDualResponse } from "@/types/postulacion";
import type { OfertaLaboralDTO } from "@/types/bolsa";

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
};

export function PostulacionForm({ oferta, onSuccess, onCancel }: Props) {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [perfil, setPerfil] = useState<PerfilResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (data.dni) {
          setPerfil({
            dni: data.dni,
            nombres: data.nombres ?? "",
            apellidoPaterno: data.apellidoPaterno ?? "",
            apellidoMaterno: data.apellidoMaterno ?? "",
            correo: data.correo ?? "",
            cvDisponible: Boolean(data.cvDisponible),
            cvFilename: data.cvFilename ?? null,
          });
          sincronizarDni(data.dni);
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

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

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

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
