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
