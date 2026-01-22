"use client";

import dynamic from "next/dynamic";
import Header from "@/components/encuesta/Header";


const EncuestaFlow = dynamic(
  () => import("@/components/encuesta/EncuestaFlow"),
  {
    ssr: false,
    loading: () => <EncuestaLoader />,
  }
);

function EncuestaLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6" />
      <p className="text-sm opacity-80">Cargando encuesta…</p>
    </div>
  );
}

export default function EncuestaPage() {
  return (
    <>
      <Header step={0} total={1} />
      <main className="flex-1 flex">
        <EncuestaFlow />
      </main>
    </>
  );
}
