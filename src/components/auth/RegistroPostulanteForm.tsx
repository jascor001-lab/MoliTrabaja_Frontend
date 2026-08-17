"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Input } from "@/components/ui/Input";
import { PuestoInclusivoCheckbox } from "@/components/ui/PuestoInclusivoCheckbox";
import { SectionHint } from "@/components/ui/SectionHint";
import { validarCuentaRegistro } from "@/lib/password";
import { GENEROS } from "@/types/postulacion";

const TIPOS_DOCUMENTO = [
  { abrev: "DNI", nombre: "Documento Nacional de Identidad", maxLength: 8, numeric: true },
  { abrev: "CE", nombre: "Carné de Extranjería", maxLength: 12, numeric: false },
  {
    abrev: "CPP",
    nombre: "Carné de Permiso Temporal de Permanencia",
    maxLength: 9,
    numeric: true,
  },
  { abrev: "RUC", nombre: "Registro Único de Contribuyentes", maxLength: 11, numeric: true },
  { abrev: "PAS", nombre: "Pasaporte", maxLength: 12, numeric: false },
] as const;

function mapApiErrors(errors: Record<string, string>): Record<string, string> {
  const mapped = { ...errors };
  if (mapped.direccionLiteral) mapped.direccion = mapped.direccionLiteral;
  return mapped;
}

export function RegistroPostulanteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    correo: "",
    password: "",
    tipoDocAbrev: "DNI",
    numeroDocumento: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    genero: GENEROS[0],
    telefono: "",
    direccion: "",
    tieneDiscapacidad: false,
  });

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const tipoDocumento =
    TIPOS_DOCUMENTO.find((tipo) => tipo.abrev === form.tipoDocAbrev) ??
    TIPOS_DOCUMENTO[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cuentaErrors = validarCuentaRegistro(form.correo, form.password);
    if (Object.keys(cuentaErrors).length > 0) {
      setFieldErrors(cuentaErrors);
      setError("Revisa tu correo y contraseña de acceso.");
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/registro/postulante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        error?: string;
        errors?: Record<string, string>;
        redirect?: string;
      };
      if (!res.ok) {
        if (data.errors) setFieldErrors(mapApiErrors(data.errors));
        throw new Error(data.error ?? "No se pudo registrar");
      }
      router.push(data.redirect ?? "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
        <SectionHint title="Cuenta de acceso">
          Este correo y contraseña son los que usarás en &quot;Acceder&quot;. No los volverás a
          pedir al iniciar sesión.
        </SectionHint>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Correo electrónico *"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={form.correo}
            onChange={(e) => set("correo", e.target.value)}
            error={fieldErrors.correo}
            required
          />
          <Input
            label="Contraseña *"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            hint="Mínimo 8 caracteres"
            error={fieldErrors.password}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <SectionHint title="Datos personales">
          Información de tu perfil para postular (documento, nombres y contacto).
        </SectionHint>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Tipo de documento *
            </label>
            <select
              value={form.tipoDocAbrev}
              onChange={(e) => {
                setForm((current) => ({
                  ...current,
                  tipoDocAbrev: e.target.value,
                  numeroDocumento: "",
                }));
              }}
              className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {TIPOS_DOCUMENTO.map((tipo) => (
                <option key={tipo.abrev} value={tipo.abrev}>
                  {tipo.abrev} — {tipo.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.tipoDocAbrev && (
              <p className="text-xs text-red-600">{fieldErrors.tipoDocAbrev}</p>
            )}
          </div>
          <Input
            label={`${tipoDocumento.abrev} *`}
            value={form.numeroDocumento}
            maxLength={tipoDocumento.maxLength}
            inputMode={tipoDocumento.numeric ? "numeric" : "text"}
            placeholder={`Ingresa tu ${tipoDocumento.abrev}`}
            onChange={(e) => {
              const raw = e.target.value.toUpperCase();
              set(
                "numeroDocumento",
                tipoDocumento.numeric
                  ? raw.replace(/\D/g, "")
                  : raw.replace(/[^A-Z0-9]/g, "")
              );
            }}
            error={fieldErrors.numeroDocumento}
            required
          />
        </div>
        <Input
          label="Nombres *"
          value={form.nombres}
          onChange={(e) => set("nombres", e.target.value)}
          error={fieldErrors.nombres}
          required
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Apellido paterno *"
            value={form.apellidoPaterno}
            onChange={(e) => set("apellidoPaterno", e.target.value)}
            error={fieldErrors.apellidoPaterno}
            required
          />
          <Input
            label="Apellido materno *"
            value={form.apellidoMaterno}
            onChange={(e) => set("apellidoMaterno", e.target.value)}
            error={fieldErrors.apellidoMaterno}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <DateInput
            label="Fecha de nacimiento *"
            value={form.fechaNacimiento}
            onChange={(fechaNacimiento) => set("fechaNacimiento", fechaNacimiento)}
            error={fieldErrors.fechaNacimiento}
            required
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Género *</label>
            <select
              value={form.genero}
              onChange={(e) => set("genero", e.target.value)}
              className="w-full rounded-xl border border-emerald-100 px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {GENEROS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input
          label="Teléfono *"
          type="tel"
          value={form.telefono}
          onChange={(e) => set("telefono", e.target.value)}
          error={fieldErrors.telefono}
          required
        />
        <Input
          label="Dirección *"
          value={form.direccion}
          onChange={(e) => set("direccion", e.target.value)}
          error={fieldErrors.direccion}
          required
        />
        <PuestoInclusivoCheckbox
          variant="postulante"
          checked={form.tieneDiscapacidad}
          onChange={(checked) => set("tieneDiscapacidad", checked)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando perfil…" : "Crear mi perfil"}
      </Button>
      <p className="text-sm text-center text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/ingreso?tipo=postulante"
          className="text-emerald-700 font-semibold hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
