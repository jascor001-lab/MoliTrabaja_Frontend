"use client";

import { clearPersistedForm } from "@/hooks/usePersistForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GraciasPage() {
  const router = useRouter();

  // Limpieza final (extra seguridad)
  useEffect(() => {
    clearPersistedForm();
  }, []);

  return (
    <div className="min-h-screen bg-[#06AB68] flex flex-col items-center justify-center text-white px-6 text-center">
      {/* EMOJI / ILUSTRACIÓN */}
      <div className="text-7xl mb-6">🥳</div>

      <h1 className="text-xl font-bold mb-4">
        ¡GRACIAS POR TU TIEMPO!
      </h1>

      <p className="text-sm leading-relaxed opacity-90 max-w-xs">
        Tu opinión nos ayuda a mejorar la atención que brindamos a nuestros vecinos.
      </p>

      <button
        onClick={() => router.push("/encuesta")}
        className="mt-10 w-48 py-4 rounded-full bg-green-500 text-white font-semibold text-lg active:scale-95 transition"
      >
        SALIR
      </button>
    </div>
  );
}
