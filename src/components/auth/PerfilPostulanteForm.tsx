"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Input } from "@/components/ui/Input";
import { GENEROS, type Genero } from "@/types/postulacion";

export function PerfilPostulanteForm() {
  const [form, setForm] = useState({
    dni: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    genero: GENEROS[0] as Genero,
    correo: "",
    telefono: "",
    direccion: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/perfil/postulante")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setForm({
          dni: data.dni ?? "",
          nombres: data.nombres ?? "",
          apellidoPaterno: data.apellidoPaterno ?? "",
          apellidoMaterno: data.apellidoMaterno ?? "",
          fechaNacimiento: data.fechaNacimiento ?? "",
          genero: data.genero ?? GENEROS[0],
          correo: data.correo ?? "",
          telefono: data.telefono ?? "",
          direccion: data.direccion ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/perfil/postulante", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    <form onSubmit={save} className="space-y-4 max-w-lg">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="DNI" value={form.dni} disabled />
        <Input label="Correo" value={form.correo} disabled />
      </div>
      <Input label="Nombres" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Apellido paterno" value={form.apellidoPaterno} onChange={(e) => setForm({ ...form, apellidoPaterno: e.target.value })} required />
        <Input label="Apellido materno" value={form.apellidoMaterno} onChange={(e) => setForm({ ...form, apellidoMaterno: e.target.value })} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <DateInput
          label="Fecha nacimiento"
          value={form.fechaNacimiento}
          onChange={(fechaNacimiento) => setForm({ ...form, fechaNacimiento })}
          required
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Género</label>
          <select value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as Genero })} className="w-full rounded-xl border border-emerald-100 px-4 py-3">
            {GENEROS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required />
      <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
    </form>
  );
}
