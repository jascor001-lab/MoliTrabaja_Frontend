"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import ImagenAsistente from "../sources/images/asistente.png";
import LogoImagen from "../sources/images/LogoMolina.png";
import Fondo from "../sources/images/FondoInicio.png";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#1E7F3B] overflow-hidden">

      {/* IMAGEN DECORATIVA CON TRANSPARENCIA */}
      <Image
        src={Fondo}
        alt="Patrón institucional"
        fill
        priority
        className="object-cover opacity-90"
      />

      {/* CONTENIDO */}
      <div
        className="
          relative z-10
          min-h-screen
          flex flex-col md:flex-row
          items-center
          justify-start md:justify-center
          gap-10
          px-6 md:px-16
          py-16
        "
      >
        {/* BLOQUE IZQUIERDO */}
        <div className="w-full max-w-lg text-white text-center md:text-left">

          {/* LOGO */}
          <div className="mb-10 flex justify-center md:justify-start">
            <Image
              src={LogoImagen}
              alt="Municipalidad de La Molina"
              width={240}
              priority
            />
          </div>

          {/* TÍTULO */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Encuesta de satisfacción <br />
            de Plataforma
          </h1>

          {/* TEXTO */}
          <p className="mt-6 text-base md:text-lg text-white/90 leading-relaxed max-w-md ">
            <strong>¡Hola!</strong><br />
            Queremos conocer tu opinión para mejorar continuamente la atención
            que recibes. Tus respuestas son anónimas y solo nos ayudarán a mejorar.
          </p>

          {/* BOTÓN REDONDO */}
          <div className="mt-10 flex justify-center md:justify-start">
            <button
              onClick={() => router.push("/encuesta")}
              className="
                    w-28 h-28
                    rounded-full
                  bg-[#34C759]
                  hover:bg-green-600
                    active:scale-95
                  text-white
                    font-bold
                    text-sm
                    flex items-center justify-center
                    transition-all
                    shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                    hover:shadow-[0_15px_40px_rgba(0,0,0,0.45)]
                    "
                    >
              INICIAR
            </button>
          </div>


        </div>

        {/* BLOQUE DERECHO */}
        <div className="w-full flex justify-center md:justify-end -mt-10 md:mt-0">
          <Image
            src={ImagenAsistente}
            alt="Asistente digital"
            width={420}
            priority
            className="drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
