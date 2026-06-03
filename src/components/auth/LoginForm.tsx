"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TipoUsuario } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get("tipo") === "postulante" ? "postulante" : "empresa";

  const [tipo, setTipo] = useState<TipoUsuario>(tipoInicial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirect?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Error al ingresar");
      router.push(data.redirect ?? (tipo === "empresa" ? "/empresa" : "/personal"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ingresar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTipo("postulante")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition ${
            tipo === "postulante"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-slate-200 text-slate-600 hover:border-emerald-300"
          }`}
        >
          Postulante
        </button>
        <button
          type="button"
          onClick={() => setTipo("empresa")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition ${
            tipo === "empresa"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-slate-200 text-slate-600 hover:border-emerald-300"
          }`}
        >
          Empresa
        </button>
      </div>

      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={tipo === "empresa" ? "rrhh@miempresa.pe" : "tu@correo.com"}
        required
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2 border border-red-100">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-sm text-center text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link
          href={tipo === "empresa" ? "/registro/empresa" : "/registro/postulante"}
          className="font-semibold text-emerald-700 hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}
