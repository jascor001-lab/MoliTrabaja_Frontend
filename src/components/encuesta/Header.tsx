"use client";

import Image from "next/image";
import ProgressBar from "./ProgressBar";
import LogoMunimolina from "@/sources/images/LogoMunimolina.png";

type Props = {
  step: number;
  total: number;
};

export default function Header({ step, total }: Props) {
  return (
    <header className="bg-white px-6 pt-6 pb-5 shadow-sm">
      {/* LOGO CENTRADO */}
      <div className="flex justify-center items-center mb-4">
        <div className="h-16 md:h-20">
          <Image
            src={LogoMunimolina}
            alt="Municipalidad de La Molina"
            priority
            className="h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* TEXTO INSTITUCIONAL */}
      <p className="text-center text-xs text-green-700 opacity-80">
        Municipalidad de La Molina
      </p>

      <h1 className="text-center text-lg font-bold text-green-800 mt-1">
        Encuesta de Satisfacción
      </h1>

      {/* PROGRESS */}
      <div className="mt-4">
        <ProgressBar step={step} total={total} />
      </div>
    </header>
  );
}
