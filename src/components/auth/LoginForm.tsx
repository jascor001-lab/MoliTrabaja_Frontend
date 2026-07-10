"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SlideView } from "@/components/ui/SlideView";
import { useAuthUiStore } from "@/stores/authUiStore";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo");
  const tipoInicial =
    tipoParam === "postulante" ? "postulante" : tipoParam === "empresa" ? "empresa" : "postulante";

  const loginTipo = useAuthUiStore((s) => s.loginTipo);
  const loginTipoDirection = useAuthUiStore((s) => s.loginTipoDirection);
  const setLoginTipo = useAuthUiStore((s) => s.setLoginTipo);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoginTipo(tipoInicial);
  }, [tipoInicial, setLoginTipo]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const emailVal = (email || String(fd.get("email") ?? "")).trim();
    const passwordVal = password || String(fd.get("password") ?? "");

    if (!emailVal) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    if (!passwordVal) {
      setError("Ingresa tu contraseña");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: loginTipo, email: emailVal, password: passwordVal }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirect?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Error al ingresar");
      router.push(data.redirect ?? (loginTipo === "empresa" ? "/empresa" : "/personal"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ingresar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLoginTipo("postulante")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition ${
            loginTipo === "postulante"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-slate-200 text-slate-600 hover:border-emerald-300"
          }`}
        >
          Postulante
        </button>
        <button
          type="button"
          onClick={() => setLoginTipo("empresa")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition ${
            loginTipo === "empresa"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-slate-200 text-slate-600 hover:border-emerald-300"
          }`}
        >
          Empresa
        </button>
      </div>

      <SlideView viewKey={loginTipo} direction={loginTipoDirection} className="space-y-5">
        <Input
          id={`login-email-${loginTipo}`}
          name="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={loginTipo === "empresa" ? "rrhh@miempresa.pe" : "tu@correo.com"}
        />
        <Input
          id={`login-password-${loginTipo}`}
          name="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </SlideView>

      {error && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2 border border-red-100 motion-enter-fade motion-gpu motion-reduce:animate-none">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-sm text-center text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link
          href={loginTipo === "empresa" ? "/registro/empresa" : "/registro/postulante"}
          className="font-semibold text-emerald-700 hover:underline"
        >
          {loginTipo === "empresa" ? "Registrar empresa" : "Crear perfil de postulante"}
        </Link>
      </p>
    </form>
  );
}
