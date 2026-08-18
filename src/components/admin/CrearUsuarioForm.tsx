"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { RolNombre } from "@/lib/rbac";
import { ROL_ETIQUETA } from "@/lib/rbac";

const ROLES: RolNombre[] = ["admin", "empresa", "postulante"];

export function CrearUsuarioForm() {
  const router = useRouter();
  const [rol, setRol] = useState<RolNombre>("empresa");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const correo = String(fd.get("correo") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const payload: Record<string, unknown> = { correo, password, rol };

    if (rol === "empresa") {
      const nombre = String(fd.get("empresaNombre") ?? "").trim();
      payload.nombres = nombre;
      payload.apellidoPaterno = "";
      payload.empresa = {
        nombre,
        ruc: String(fd.get("ruc") ?? "").trim(),
        rubro: String(fd.get("rubro") ?? "").trim(),
      };
    } else {
      payload.nombres = String(fd.get("nombres") ?? "").trim();
      payload.apellidoPaterno = String(fd.get("apellidoPaterno") ?? "").trim();
    }

    if (rol === "postulante") {
      payload.postulante = {
        numeroDocumento: String(fd.get("numeroDocumento") ?? "").trim(),
        apellidoMaterno: String(fd.get("apellidoMaterno") ?? "").trim(),
        fechaNacimiento: String(fd.get("fechaNacimiento") ?? ""),
        telefono: String(fd.get("telefono") ?? "").trim(),
      };
    }

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
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Rol</legend>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRol(r)}
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
          <Input name="empresaNombre" label="Nombre de la empresa" required />
          <Input name="ruc" label="RUC" required maxLength={11} />
          <Input name="rubro" label="Rubro" defaultValue="General" />
        </div>
      )}

      {rol === "postulante" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input name="nombres" label="Nombres" required />
          <Input name="apellidoPaterno" label="Apellido paterno" required />
          <Input name="apellidoMaterno" label="Apellido materno" required />
        </div>
      )}

      {rol === "admin" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="nombres" label="Nombres" required />
          <Input name="apellidoPaterno" label="Apellido paterno" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="correo" label="Correo" type="email" required />
        <Input name="password" label="Contraseña" type="password" required minLength={8} />
      </div>

      {rol === "postulante" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input name="numeroDocumento" label="DNI / documento" required />
          <Input name="fechaNacimiento" label="Fecha de nacimiento" type="date" required />
          <Input name="telefono" label="Teléfono" />
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Creando…" : "Crear usuario"}
      </Button>
    </form>
  );
}
