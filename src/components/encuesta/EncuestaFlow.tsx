/*
"use client";

import { useEffect, useState } from "react";
import { useEncuesta } from "@/hooks/useEncuesta";
import { useKioskMode } from "@/hooks/useKioskMode";

import StepContainer from "./StepContainer";
import StepText from "./StepText";
import StepSelect from "./StepSelect";
import StepInput from "./StepInput";
import StepDate from "./StepDate";
import StepRating from "./StepRating";
import StepTextarea from "./StepTextarea";
import Navigation from "./Navigation";

export default function EncuestaFlow() {
  const encuesta = useEncuesta();
  useKioskMode();

  const { stepConfig } = encuesta;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <StepContainer step={encuesta.step}>
          <StepText text={stepConfig.pregunta} />

          {stepConfig.type === "select" && <StepSelect {...encuesta} />}
          {stepConfig.type === "input" && <StepInput {...encuesta} />}
          {stepConfig.type === "date" && <StepDate {...encuesta} />}
          {stepConfig.type === "rating" && <StepRating {...encuesta} />}
          {stepConfig.type === "textarea" && <StepTextarea {...encuesta} />}
        </StepContainer>
      </div>

      <Navigation {...encuesta} />
    </div>
  );
}
*/


"use client";

import { useEncuesta } from "@/hooks/useEncuesta";
import { useKioskMode } from "@/hooks/useKioskMode";
import EncuestaSheet from "./EncuestaSheet";

export default function EncuestaFlow() {
  const encuesta = useEncuesta();
  useKioskMode();

  return (
    <main className="flex-1 bg-[#06AB68] px-4 py-10 overflow-y-auto">
      <EncuestaSheet encuesta={encuesta} />

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-2xl">
        <button
          onClick={() => encuesta.formik.handleSubmit()}
          className="w-full py-4 rounded-full bg-green-500 text-white font-semibold text-lg active:scale-95"
        >
          ENVIAR ENCUESTA
        </button>
      </div>
    </main>
  );
}

