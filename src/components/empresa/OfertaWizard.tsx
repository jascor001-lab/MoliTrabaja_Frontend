"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { SlideView } from "@/components/ui/SlideView";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { readApiError } from "@/lib/api-error";
import { formatSalarioForSave } from "@/lib/salario";
import {
  erroresPaso1,
  erroresPaso2,
  erroresPaso3,
  hasFieldErrors,
} from "@/lib/validacion-oferta";
import { useOfertaFormStore, WIZARD_STEPS } from "@/stores/ofertaFormStore";

import { WizardStepContacto } from "./WizardStepContacto";
import { WizardStepEmpresa } from "./WizardStepEmpresa";
import { WizardStepResumen } from "./WizardStepResumen";
import { WizardStepVacante } from "./WizardStepVacante";

type Props = {
  empresaId: string;
  mode?: "create" | "edit";
  ofertaId?: string;
};

const STEP_LABELS = ["Convocatoria", "Vacante", "Contactos", "Publicar"];

export function OfertaWizard({ empresaId, mode = "create", ofertaId }: Props) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const wizardRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef<number | null>(null);
  const {
    step,
    slideDirection,
    submitError,
    nextStep,
    prevStep,
    isSubmitting,
    setSubmitting,
    setSubmitError,
    setFieldErrors,
    reset,
  } = useOfertaFormStore();

  useEffect(() => {
    if (previousStepRef.current === null) {
      previousStepRef.current = step;
      return;
    }
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;

    const timer = window.setTimeout(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      wizardRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 40);

    return () => window.clearTimeout(timer);
  }, [step]);

  const validateCurrentStep = (): boolean => {
    const s = useOfertaFormStore.getState();
    if (step === 1) {
      const errors = erroresPaso1({
        cronogramas: s.cronogramas,
        tieneLogo: s.logoFiles.length > 0 || s.existingLogos.length > 0,
        tieneBases: Boolean(s.basesFile || s.existingBases),
      });
      setFieldErrors(errors);
      return !hasFieldErrors(errors);
    }
    if (step === 2) {
      const errors = erroresPaso2({
        nombrePuesto: s.nombrePuesto,
        perfil: s.perfil,
        tipoContrato: s.tipoContrato,
        tipoPuesto: s.tipoPuesto,
        cantidadVacantes: Number(s.cantidadVacantes),
        funciones: s.funciones,
        beneficios: s.beneficios,
        direccionLiteral: s.direccionLiteral,
      });
      setFieldErrors(errors);
      return !hasFieldErrors(errors);
    }
    if (step === 3) {
      const errors = erroresPaso3({
        contactoPrincipal: s.contactoPrincipal,
        contactoGerente: s.contactoGerente,
      });
      setFieldErrors(errors);
      return !hasFieldErrors(errors);
    }
    return true;
  };

  const handleNext = () => {
    setSubmitError(null);
    if (!validateCurrentStep()) return;
    nextStep();
  };

  const validateAll = (): boolean => {
    const s = useOfertaFormStore.getState();
    const errors = {
      ...erroresPaso1({
        cronogramas: s.cronogramas,
        tieneLogo: s.logoFiles.length > 0 || s.existingLogos.length > 0,
        tieneBases: Boolean(s.basesFile || s.existingBases),
      }),
      ...erroresPaso2({
        nombrePuesto: s.nombrePuesto,
        perfil: s.perfil,
        tipoContrato: s.tipoContrato,
        tipoPuesto: s.tipoPuesto,
        cantidadVacantes: Number(s.cantidadVacantes),
        funciones: s.funciones,
        beneficios: s.beneficios,
        direccionLiteral: s.direccionLiteral,
      }),
      ...erroresPaso3({
        contactoPrincipal: s.contactoPrincipal,
        contactoGerente: s.contactoGerente,
      }),
    };
    setFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  const buildPayload = (state: ReturnType<typeof useOfertaFormStore.getState>) => ({
    empresaId,
    enviarLogoPorCorreo: state.enviarLogoPorCorreo,
    cronogramas: state.cronogramas,
    nombrePuesto: state.nombrePuesto,
    perfil: state.perfil,
    tipoContrato: state.tipoContrato,
    tipoPuesto: state.tipoPuesto,
    cantidadVacantes: Number(state.cantidadVacantes),
    funciones: state.funciones,
    beneficios: state.beneficios,
    modalidad: state.modalidad,
    salario: formatSalarioForSave(state.salarioAConvenir, state.salarioMonto),
    direccionLiteral: state.direccionLiteral,
    latitud: state.latitud || undefined,
    longitud: state.longitud || undefined,
    carreraIds: state.carreraIds,
    conocimientoIds: state.conocimientoIds,
    aptoDiscapacidad: state.aptoDiscapacidad,
    contactoPrincipal: state.contactoPrincipal,
    contactoGerente: state.contactoGerente,
    ...(isEdit ? { estado: state.estado } : {}),
  });

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!validateAll()) {
      return;
    }

    const state = useOfertaFormStore.getState();
    const targetId = ofertaId ?? state.editingOfertaId;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(buildPayload(state)));
      state.logoFiles.forEach((file) => formData.append("logoFiles", file));
      if (state.basesFile) {
        formData.append("basesFile", state.basesFile);
      }

      const url = isEdit && targetId ? `/api/ofertas/${targetId}` : "/api/ofertas";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: formData });

      if (!res.ok) {
        throw new Error(
          await readApiError(
            res,
            isEdit ? "No se pudo guardar la oferta" : "No se pudo publicar la oferta"
          )
        );
      }

      reset();
      router.push("/empresa");
      router.refresh();
    } catch (e) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : isEdit
            ? "Error al guardar"
            : "Error al publicar"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const lastStepLabel = isEdit ? "Guardar" : "Publicar";

  return (
    <div ref={wizardRef} className="mx-auto max-w-2xl space-y-8 scroll-mt-24">
      <StepIndicator
        current={step}
        labels={
          isEdit
            ? ["Convocatoria", "Vacante", "Contactos", lastStepLabel]
            : STEP_LABELS
        }
      />

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 md:p-8 shadow-sm overflow-hidden">
        <SlideView
          viewKey={step}
          direction={slideDirection}
          className="motion-wizard min-h-[320px]"
        >
          {step === 1 && <WizardStepEmpresa />}
          {step === 2 && <WizardStepVacante />}
          {step === 3 && <WizardStepContacto />}
          {step === 4 && <WizardStepResumen isEdit={isEdit} />}
        </SlideView>

        {submitError ? (
          <p className="mt-4 text-xs text-red-600">{submitError}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3 justify-between">
          {step > 1 ? (
            <Button variant="secondary" onClick={prevStep} disabled={isSubmitting}>
              ← Anterior
            </Button>
          ) : (
            <span />
          )}

          {step < WIZARD_STEPS ? (
            <Button onClick={handleNext}>Siguiente →</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting
                ? isEdit
                  ? "Guardando…"
                  : "Publicando…"
                : isEdit
                  ? "Guardar cambios"
                  : "Publicar instantáneamente"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
