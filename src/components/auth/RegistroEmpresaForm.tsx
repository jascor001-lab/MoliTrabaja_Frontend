"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function RegistroEmpresaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nombre: "",
    ruc: "",
    rubro: "",
    email: "",
    password: "",
    descripcion: "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: Record<string, string> = {};
    if (form.nombre.trim().length < 2) next.nombre = "Ingresa la razón social.";
    if (!/^\d{11}$/.test(form.ruc.trim())) next.ruc = "El RUC debe tener 11 dígitos.";
    if (form.rubro.trim().length < 2) next.rubro = "Ingresa el rubro o sector.";
    if (!form.email.trim()) next.email = "Ingresa el correo de acceso.";
    if (form.password.length < 8) next.password = "La contraseña debe tener al menos 8 caracteres.";
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/registro/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo registrar");
      router.push(data.redirect ?? "/empresa");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Razón social"
        value={form.nombre}
        onChange={(e) => set("nombre", e.target.value)}
        error={fieldErrors.nombre}
      />
      <Input
        label="RUC"
        value={form.ruc}
        maxLength={11}
        inputMode="numeric"
        onChange={(e) => set("ruc", e.target.value.replace(/\D/g, ""))}
        error={fieldErrors.ruc}
      />
      <Input
        label="Rubro / sector"
        value={form.rubro}
        onChange={(e) => set("rubro", e.target.value)}
        placeholder="Ej. Tecnología, Retail, Construcción"
        error={fieldErrors.rubro}
      />
      <Input
        label="Correo de acceso"
        type="email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={fieldErrors.email}
      />
      <Input
        label="Contraseña"
        type="password"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        hint="Mínimo 8 caracteres"
        error={fieldErrors.password}
      />
      <Textarea
        label="Descripción (opcional)"
        value={form.descripcion}
        onChange={(e) => set("descripcion", e.target.value)}
        placeholder="Breve descripción de la empresa…"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta…" : "Registrar empresa"}
      </Button>
      <p className="text-sm text-center text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/ingreso" className="text-emerald-700 font-semibold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
