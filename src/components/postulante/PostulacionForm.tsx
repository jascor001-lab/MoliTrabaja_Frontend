"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { guardarPostulacionLocal, sincronizarDni } from "@/lib/mis-postulaciones-storage";
import { GENEROS, type DashboardDualResponse } from "@/types/postulacion";
import type { OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  oferta: OfertaLaboralDTO;
  onSuccess: (response: DashboardDualResponse) => void;
  onCancel: () => void;
};

export function PostulacionForm({ oferta, onSuccess, onCancel }: Props) {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState<string>(GENEROS[0]);
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
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
        const perfil = await fetch("/api/auth/perfil/postulante").then((r) => r.json());
        if (perfil.dni) {
          setDni(perfil.dni);
          setNombres(perfil.nombres ?? "");
          setApellidoPaterno(perfil.apellidoPaterno ?? "");
          setApellidoMaterno(perfil.apellidoMaterno ?? "");
          setFechaNacimiento(perfil.fechaNacimiento ?? "");
          setGenero(perfil.genero ?? GENEROS[0]);
          setCorreo(perfil.correo ?? "");
          setTelefono(perfil.telefono ?? "");
          setDireccion(perfil.direccion ?? "");
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
          Para postular necesitas un perfil de postulante registrado.
        </p>
        <Link href={`/ingreso?tipo=postulante&next=/`}>
          <Button className="w-full">Iniciar sesión</Button>
        </Link>
        <Link href="/registro/postulante">
          <Button variant="secondary" className="w-full">
            Crear perfil gratis
          </Button>
        </Link>
        <Button variant="ghost" className="w-full" onClick={onCancel}>
          Volver
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});
    if (!cv) {
      setError("Adjunta tu CV en PDF, Word o TXT.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("job_id", oferta.id);
      form.append("dni", dni);
      form.append("nombres", nombres);
      form.append("apellidoPaterno", apellidoPaterno);
      form.append("apellidoMaterno", apellidoMaterno);
      form.append("fechaNacimiento", fechaNacimiento);
      form.append("genero", genero);
      form.append("correo", correo);
      form.append("telefono", telefono);
      form.append("direccion", direccion);
      form.append("cv", cv);

      const res = await fetch("/api/postulaciones", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setFieldErrors(data.errors);
        throw new Error(data.error ?? "No se pudo enviar la postulación");
      }

      const resData = data as DashboardDualResponse;
      sincronizarDni(dni);
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

  return (
    <div className="space-y-4 border-t border-emerald-100 pt-4 mt-4">
      <h3 className="font-bold text-slate-900">Postular a esta vacante</h3>
      <p className="text-xs text-slate-500">
        Tus datos se validan según estándar peruano (DNI 8 dígitos). La edad se calcula
        automáticamente.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="DNI *"
          value={dni}
          maxLength={8}
          inputMode="numeric"
          readOnly
          onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
        />
        {fieldErrors.dni && <p className="text-xs text-red-600 sm:col-span-2">{fieldErrors.dni}</p>}

        <Input label="Nombres *" value={nombres} onChange={(e) => setNombres(e.target.value)} />
        <Input
          label="Apellido paterno *"
          value={apellidoPaterno}
          onChange={(e) => setApellidoPaterno(e.target.value)}
        />
        <Input
          label="Apellido materno *"
          value={apellidoMaterno}
          onChange={(e) => setApellidoMaterno(e.target.value)}
        />
        <Input
          label="Fecha de nacimiento *"
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
        />

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Género *</span>
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="w-full rounded-xl border border-emerald-100 px-4 py-3"
          >
            {GENEROS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Correo *"
          type="email"
          value={correo}
          readOnly
          onChange={(e) => setCorreo(e.target.value)}
        />
        <Input
          label="Teléfono *"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <Input
          label="Dirección *"
          className="sm:col-span-2"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">CV (PDF / Word / TXT) *</span>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setCv(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
      </label>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? "Enviando…" : "Enviar postulación"}
        </Button>
      </div>
    </div>
  );
}
