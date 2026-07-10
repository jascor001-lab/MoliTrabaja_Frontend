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
};

export function PostulacionForm({ oferta, onSuccess, onCancel }: Props) {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [perfil, setPerfil] = useState<PerfilResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cv, setCv] = useState<File | null>(null);

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
          Inicia sesión o crea tu perfil una sola vez; luego solo adjuntas tu CV para
          postular.
        </p>
        <Link href="/ingreso?tipo=postulante">
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
    if (!cv) {
      setError("Adjunta tu CV en PDF, Word o TXT.");
      return;
    }
    if (!perfil?.dni) {
      setError("Completa tu perfil antes de postular.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("job_id", oferta.id);
      form.append("cv", cv);

      const res = await fetch("/api/postulaciones", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        if (data.redirect) {
          throw new Error(
            `${data.error ?? "Perfil incompleto"}. Actualízalo en Mi perfil.`
          );
        }
        throw new Error(data.error ?? "No se pudo enviar la postulación");
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="font-semibold text-slate-800">{nombreCompleto}</p>
          <p className="text-slate-500 mt-0.5">
            DNI {perfil.dni} · {perfil.correo}
          </p>
          <Link
            href="/personal/perfil"
            className="inline-block mt-2 text-emerald-700 font-medium hover:underline"
          >
            Editar datos en mi perfil
          </Link>
        </div>
      ) : (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <Link href="/personal/perfil" className="font-semibold underline">
            Completa tu perfil
          </Link>{" "}
          antes de postular.
        </p>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">CV (PDF / Word / TXT) *</span>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setCv(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
        <p className="text-xs text-slate-500">
          Usamos tu CV para calcular el match con la vacante. Tus datos personales ya están en
          tu cuenta.
        </p>
      </label>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !perfil?.dni} className="flex-1">
          {loading ? "Enviando…" : "Enviar postulación"}
        </Button>
      </div>
    </div>
  );
}
