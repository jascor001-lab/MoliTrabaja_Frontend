"use client";

import { useEncuesta } from "@/hooks/useEncuesta";
import { useKioskMode } from "@/hooks/useKioskMode";
import EncuestaSheet from "./EncuestaSheet";

export default function EncuestaFlow() {
  const encuesta = useEncuesta();
  useKioskMode();

  return (
    <main className="flex-1 bg-green-700 px-4 py-10 overflow-y-auto">
      <EncuestaSheet encuesta={encuesta} />

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-2xl">
        <button
          onClick={() => encuesta.formik.handleSubmit()}
          className="w-full py-4 rounded-full bg-green-800 text-white font-semibold text-lg active:scale-95"
        >
          ENVIAR ENCUESTA
        </button>
      </div>
    </main>
  );
}

