"use client";

import { steps } from "@/lib/steps";
import StepText from "./StepText";
import StepSelect from "./StepSelect";
import StepInput from "./StepInput";
import StepDate from "./StepDate";
import StepRating from "./StepRating";
import StepTextarea from "./StepTextarea";

export default function EncuestaSheet({ encuesta }: any) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8 pb-24">
      {steps.map((step, index) => (
        <div
          key={step.field}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <StepText text={`${index + 1}. ${step.pregunta}`} />

          {step.type === "select" && (
            <StepSelect {...encuesta} field={step.field} />
          )}

          {step.type === "input" && (
            <StepInput {...encuesta} field={step.field} />
          )}

          {step.type === "date" && (
            <StepDate {...encuesta} field={step.field} />
          )}

          {step.type === "rating" && (
            <StepRating {...encuesta} field={step.field} />
          )}

          {step.type === "textarea" && (
            <StepTextarea {...encuesta} field={step.field} />
          )}
        </div>
      ))}
    </div>
  );
}
