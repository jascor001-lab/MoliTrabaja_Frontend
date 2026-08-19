"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Input } from "@/components/ui/Input";
import type { RolNombre } from "@/lib/rbac";
import { ROL_ETIQUETA } from "@/lib/rbac";

const ROLES: RolNombre[] = ["admin", "empresa", "postulante"];

export function CrearUsuarioForm() {
  const router = useRouter();
  const [rol, setRol] = useState<RolNombre>("empresa");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const correo = String(fd.get("correo") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const payload: Record<string, unknown> = { correo, password, rol };
    const next: Record<string, string> = {};

    if (!correo) next.correo = "Ingresa el correo.";
    if (password.length < 8) next.password = "La contraseña debe tener al menos 8 caracteres.";

    if (rol === "empresa") {
      const nombre = String(fd.get("empresaNombre") ?? "").trim();
      const ruc = String(fd.get("ruc") ?? "").trim();
      const rubro = String(fd.get("rubro") ?? "").trim();
      payload.nombres = nombre;
      payload.apellidoPaterno = "";
      payload.empresa = { nombre, ruc, rubro };
      if (nombre.length < 2) next.empresaNombre = "Ingresa el nombre de la empresa.";
      if (!/^\d{11}$/.test(ruc)) next.ruc = "El RUC debe tener 11 dígitos.";
    } else {
      payload.nombres = String(fd.get("nombres") ?? "").trim();
      payload.apellidoPaterno = String(fd.get("apellidoPaterno") ?? "").trim();
      if (String(payload.nombres).length < 2) next.nombres = "Ingresa los nombres.";
      if (rol === "postulante" && String(payload.apellidoPaterno).length < 2) {
        next.apellidoPaterno = "Ingresa el apellido paterno.";
      }
    }

    if (rol === "postulante") {
      const apellidoMaterno = String(fd.get("apellidoMaterno") ?? "").trim();
      const numeroDocumento = String(fd.get("numeroDocumento") ?? "").trim();
      const telefono = String(fd.get("telefono") ?? "").trim();
      payload.postulante = {
        numeroDocumento,
        apellidoMaterno,
        fechaNacimiento,
        telefono,
      };
      if (apellidoMaterno.length < 2) next.apellidoMaterno = "Ingresa el apellido materno.";
      if (numeroDocumento.length < 6) next.numeroDocumento = "Ingresa el documento.";
      if (!fechaNacimiento) next.fechaNacimiento = "Ingresa la fecha de nacimiento.";
    }

    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el usuario");
      router.push("/admin/usuarios");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Rol</legend>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRol(r);
                setFieldErrors({});
              }}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                rol === r
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {ROL_ETIQUETA[r]}
            </button>
          ))}
        </div>
      </fieldset>

      {rol === "empresa" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input name="empresaNombre" label="Nombre de la empresa" error={fieldErrors.empresaNombre} />
          <Input name="ruc" label="RUC" maxLength={11} error={fieldErrors.ruc} />
          <Input name="rubro" label="Rubro" defaultValue="General" />
        </div>
      )}

      {rol === "postulante" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input name="nombres" label="Nombres" error={fieldErrors.nombres} />
          <Input name="apellidoPaterno" label="Apellido paterno" error={fieldErrors.apellidoPaterno} />
          <Input name="apellidoMaterno" label="Apellido materno" error={fieldErrors.apellidoMaterno} />
        </div>
      )}

      {rol === "admin" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="nombres" label="Nombres" error={fieldErrors.nombres} />
          <Input name="apellidoPaterno" label="Apellido paterno" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="correo" label="Correo" type="email" error={fieldErrors.correo} />
        <Input name="password" label="Contraseña" type="password" error={fieldErrors.password} />
      </div>

      {rol === "postulante" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input name="numeroDocumento" label="DNI / documento" error={fieldErrors.numeroDocumento} />
          <DateInput
            label="Fecha de nacimiento"
            value={fechaNacimiento}
            onChange={setFechaNacimiento}
            error={fieldErrors.fechaNacimiento}
            max={new Date().toISOString().slice(0, 10)}
          />
          <Input name="telefono" label="Teléfono" />
        </div>
      )}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Creando…" : "Crear usuario"}
      </Button>
    </form>
  );
}
