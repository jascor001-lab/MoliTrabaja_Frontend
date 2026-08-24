"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Input } from "@/components/ui/Input";
import { PuestoInclusivoCheckbox } from "@/components/ui/PuestoInclusivoCheckbox";
import { SectionHint } from "@/components/ui/SectionHint";
import { validarCuentaRegistro } from "@/lib/password-validacion";
import { validarPostulanteInput } from "@/lib/validacion-postulante";
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
  const [step, setStep] = useState<"datos" | "codigo">("datos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [codigo, setCodigo] = useState("");
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

  const solicitarCodigo = async () => {
    setError(null);
    setInfo(null);

    const cuentaErrors = validarCuentaRegistro(form.correo, form.password);
    const personal = validarPostulanteInput({
      tipoDocId: 1,
      tipoDocAbrev: form.tipoDocAbrev,
      numeroDocumento: form.numeroDocumento,
      nombres: form.nombres,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno,
      fechaNacimiento: form.fechaNacimiento,
      paisId: 1,
      genero: form.genero,
      estadoCivil: "Soltero",
      correo: form.correo,
      telefono: form.telefono,
      direccionLiteral: form.direccion,
      tieneDiscapacidad: form.tieneDiscapacidad,
    });
    const errors = {
      ...cuentaErrors,
      ...(personal.ok ? {} : personal.errors),
    };
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/registro/postulante/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          direccionLiteral: form.direccion,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        errors?: Record<string, string>;
        mensaje?: string;
        correo?: string;
      };
      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(mapApiErrors(data.errors));
          return;
        }
        throw new Error(data.error ?? "No se pudo enviar el código");
      }
      setInfo(
        data.mensaje ??
          `Te enviamos un código a ${data.correo ?? form.correo}. Revisa tu bandeja.`
      );
      setStep("codigo");
      setCodigo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar el código");
    } finally {
      setLoading(false);
    }
  };

  const confirmarCodigo = async () => {
    setError(null);
    if (!/^\d{6}$/.test(codigo.trim())) {
      setError("Ingresa el código de 6 dígitos que llegó a tu correo.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/registro/postulante/confirmar", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: form.correo.trim().toLowerCase(),
          codigo: codigo.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirect?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "No se pudo verificar el código");
      router.push(data.redirect ?? "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "datos") {
      await solicitarCodigo();
      return;
    }
    await confirmarCodigo();
  };

  const selectClass =
    "h-12 w-full min-w-0 rounded-xl border border-emerald-100 bg-white px-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <ol className="grid grid-cols-2 gap-2 text-sm">
        <li
          className={`rounded-xl border px-3 py-2 ${
            step === "datos"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <span className="block text-[11px] font-semibold uppercase tracking-wide">
            Paso 1
          </span>
          Datos de la ficha
        </li>
        <li
          className={`rounded-xl border px-3 py-2 ${
            step === "codigo"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <span className="block text-[11px] font-semibold uppercase tracking-wide">
            Paso 2
          </span>
          Verificar correo
        </li>
      </ol>

      {step === "datos" ? (
        <>
          <section className="min-w-0 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Cuenta de acceso</h2>
            <SectionHint>
              Usarás este correo y contraseña para ingresar. Te enviaremos un código para
              confirmar que el correo es tuyo.
            </SectionHint>
            <div className="grid min-w-0 gap-4">
              <div className="min-w-0">
                <Input
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={form.correo}
                  onChange={(e) => set("correo", e.target.value)}
                  error={fieldErrors.correo}
                  required
                />
              </div>
              <div className="min-w-0">
                <Input
                  label="Contraseña"
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
          </section>

          <section className="min-w-0 space-y-4 border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-slate-900">Datos personales</h2>
            <SectionHint>
              Identificación y contacto para tu perfil de postulante.
            </SectionHint>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-1.5">
                <label htmlFor="tipo-documento" className="text-sm font-medium text-slate-700">
                  Tipo de documento
                </label>
                <select
                  id="tipo-documento"
                  value={form.tipoDocAbrev}
                  onChange={(e) => {
                    setForm((current) => ({
                      ...current,
                      tipoDocAbrev: e.target.value,
                      numeroDocumento: "",
                    }));
                  }}
                  className={selectClass}
                >
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <option key={tipo.abrev} value={tipo.abrev}>
                      {tipo.abrev}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-relaxed text-slate-500">
                  {tipoDocumento.nombre}
                </p>
              </div>
              <div className="min-w-0">
                <Input
                  label={`Número de ${tipoDocumento.abrev}`}
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
            </div>

            <div className="min-w-0">
              <Input
                label="Nombres"
                value={form.nombres}
                onChange={(e) => set("nombres", e.target.value)}
                error={fieldErrors.nombres}
                required
              />
            </div>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <Input
                  label="Apellido paterno"
                  value={form.apellidoPaterno}
                  onChange={(e) => set("apellidoPaterno", e.target.value)}
                  error={fieldErrors.apellidoPaterno}
                  required
                />
              </div>
              <div className="min-w-0">
                <Input
                  label="Apellido materno"
                  value={form.apellidoMaterno}
                  onChange={(e) => set("apellidoMaterno", e.target.value)}
                  error={fieldErrors.apellidoMaterno}
                  required
                />
              </div>
            </div>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <DateInput
                  label="Fecha de nacimiento"
                  value={form.fechaNacimiento}
                  onChange={(fechaNacimiento) => set("fechaNacimiento", fechaNacimiento)}
                  error={fieldErrors.fechaNacimiento}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <label htmlFor="genero" className="text-sm font-medium text-slate-700">
                  Género
                </label>
                <select
                  id="genero"
                  value={form.genero}
                  onChange={(e) => set("genero", e.target.value)}
                  className={selectClass}
                >
                  {GENEROS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="min-w-0">
              <Input
                label="Teléfono"
                type="tel"
                value={form.telefono}
                onChange={(e) => set("telefono", e.target.value)}
                error={fieldErrors.telefono}
                required
              />
            </div>
            <div className="min-w-0">
              <Input
                label="Dirección"
                value={form.direccion}
                onChange={(e) => set("direccion", e.target.value)}
                error={fieldErrors.direccion}
                required
              />
            </div>
            <PuestoInclusivoCheckbox
              variant="postulante"
              checked={form.tieneDiscapacidad}
              onChange={(checked) => set("tieneDiscapacidad", checked)}
            />
          </section>
        </>
      ) : (
        <div className="space-y-4">
          <SectionHint title="Verifica tu correo">
            Enviamos un código de 6 dígitos a <strong>{form.correo}</strong>. Es válido
            por 15 minutos.
          </SectionHint>
          <Input
            label="Código de verificación"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-2xl font-semibold tracking-[0.4em]"
            required
          />
          <button
            type="button"
            className="text-sm font-semibold text-emerald-700 hover:underline"
            disabled={loading}
            onClick={() => {
              setStep("datos");
              setCodigo("");
              setError(null);
              setInfo(null);
            }}
          >
            ← Corregir datos o reenviar código
          </button>
        </div>
      )}

      {info ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{info}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <Button type="submit" className="h-12 w-full" disabled={loading}>
        {loading
          ? step === "datos"
            ? "Enviando código…"
            : "Creando cuenta…"
          : step === "datos"
            ? "Enviar código a mi correo"
            : "Verificar y crear cuenta"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/ingreso" className="font-semibold text-emerald-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
