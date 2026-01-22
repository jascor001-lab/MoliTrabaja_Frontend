"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { steps } from "@/lib/steps";
import { encuestaValidationSchema } from "@/lib/validation";
import { usePersistForm, loadPersistedForm, clearPersistedForm } from "./usePersistForm";
import { useRouter } from "next/navigation";

export function useEncuesta() {
  const router = useRouter();
  const persisted = loadPersistedForm();

  const [step, setStep] = useState<number>(persisted?.__step ?? 0);

  const formik = useFormik({
    initialValues: {
      servicio: "",
      ventanilla: "",
      terminalista: "",
      fecha: "",

      amabilidad: 0,
      claridad: 0,
      conocimiento: 0,
      tiempoEspera: 0,
      tiempoTotal: 0,
      comodidad: 0,
      facilidad: 0,
      percepcion: 0,

      sugerencia1: "",
      sugerencia2: "",
      sugerencia3: "",
      sugerencia4: "",
      sugerencia5: "",
      ...(persisted ?? {}),
    },
    validationSchema: encuestaValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,


    onSubmit: async (values) => {
      try {
        const payload = {
          servicio_descripcion: values.servicio,
          ventanilla: Number(values.ventanilla),
          terminalista: values.terminalista,
          fecha: new Date(values.fecha).toISOString(),

          amabilidad: values.amabilidad,
          claridad: values.claridad,
          conocimiento: values.conocimiento,

          tiempoespera: Number(values.tiempoEspera),
          tiempototal: Number(values.tiempoTotal),

          comodidad: values.comodidad,
          facilidad: values.facilidad,
          percepcion: values.percepcion,

          // junta todas las sugerencias en una sola
          sugerencia: [
            values.sugerencia1,
            values.sugerencia2,
            values.sugerencia3,
            values.sugerencia4,
            values.sugerencia5,
          ]
            .filter(Boolean)
            .join(" | "),
        };

        console.log("PAYLOAD FINAL 👉", payload);

        const res = await fetch("http://localhost:3001/EncPlat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Error en API EncPlat");
        }

        clearPersistedForm();
        router.push("/gracias");
      } catch (e) {
        console.error("Error al enviar encuesta", e);
        alert("No se pudo enviar la encuesta");
      }
    },

  });

  // Guardado parcial automático
  usePersistForm({ ...formik.values, __step: step });

  const stepConfig = steps[step];
  const field = stepConfig.field;

  // Validación silenciosa por paso
  const validateCurrentStep = async () => {
    try {
      await encuestaValidationSchema.validateAt(field, formik.values);
      return true;
    } catch {
      return false;
    }
  };

  const next = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      formik.handleSubmit();
    }
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return {
    // estado
    step,
    total: steps.length,
    stepConfig,
    field,

    // formik
    formik,

    // navegación
    next,
    prev,
    isLast: step === steps.length - 1,
  };
}
