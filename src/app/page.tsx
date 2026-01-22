"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroImg from "@/sources/images/LogoInicio.png";

export default function HomePage() {
  const router = useRouter();

  // 🔥 Prefetch real para eliminar delay
  useEffect(() => {
    router.prefetch("/encuesta");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1F4D2E] flex flex-col items-center">
      {/* ESPACIO SUPERIOR VERDE */}
      <div className="h-32 w-full" />

      {/* IMAGEN CIRCULAR */}
      <div className="relative z-10 -mt-20 mb-6">
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
          <Image
            src={HeroImg}
            alt="Encuesta de satisfacción"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* CONTENEDOR BLANCO CON ARCO */}
      <div
        className="
          w-full flex-1 bg-white
          rounded-t-[100%]
          pt-24 px-6
          text-center
        "
      >
        {/* TITULO */}
        <h1 className="text-xl font-bold text-gray-700 leading-tight">
          Encuesta de satisfacción
          <br />
          de Plataforma
        </h1>

        {/* TEXTO */}
        <p className="mt-4 text-sm leading-relaxed text-gray-600 max-w-xs mx-auto">
          ¡Hola! Queremos conocer tu opinión para mejorar continuamente la
          atención que recibes. Tus respuestas son anónimas y solo nos ayudarán
          a mejorar.
        </p>

        {/* BOTÓN INICIAR (OPTIMIZADO) */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/encuesta"
            prefetch
            className="
              w-32 h-32 rounded-full
              bg-[#234F2E]
              text-white font-bold text-lg
              shadow-[0_0_20px_rgba(35,79,46,0.45)]
              active:scale-95 transition
              flex items-center justify-center
            "
          >
            INICIAR
          </Link>
        </div>

        {/* FOOTER */}
        <div className="mt-10 flex justify-between text-xs text-gray-400">
          <button className="hover:underline">
            Políticas de privacidad
          </button>
          <button className="hover:underline">
            Políticas de cookies
          </button>
        </div>
      </div>
    </div>
  );
}
