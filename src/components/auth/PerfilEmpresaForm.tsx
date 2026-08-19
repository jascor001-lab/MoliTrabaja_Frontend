"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function PerfilEmpresaForm() {
  const [form, setForm] = useState({
    nombre: "",
    ruc: "",
    email: "",
    rubro: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/auth/perfil/empresa")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setForm({
          nombre: data.nombre ?? "",
          ruc: data.ruc ?? "",
          email: data.email ?? "",
          rubro: data.rubro ?? "",
          descripcion: data.descripcion ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.nombre.trim().length < 2) next.nombre = "Ingresa la razón social.";
    if (form.rubro.trim().length < 2) next.rubro = "Ingresa el rubro.";
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/perfil/empresa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          rubro: form.rubro,
          descripcion: form.descripcion,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setMsg("Perfil actualizado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Cargando perfil…</p>;

  return (
    <form onSubmit={save} noValidate className="space-y-4 max-w-lg">
      <Input
        label="Razón social"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        error={fieldErrors.nombre}
      />
      <Input label="RUC" value={form.ruc} disabled />
      <Input label="Correo de acceso" value={form.email} disabled />
      <Input
        label="Rubro"
        value={form.rubro}
        onChange={(e) => setForm({ ...form, rubro: e.target.value })}
        error={fieldErrors.rubro}
      />
      <Textarea label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
    </form>
  );
}
