"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SlideView, type SlideDirection } from "@/components/ui/SlideView";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { readApiError } from "@/lib/api-error";
import { formatSalarioForSave } from "@/lib/salario";
import {
  validarPaso1,
  validarPaso2,
  validarPaso3,
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

function logoStepError(s: ReturnType<typeof useOfertaFormStore.getState>): string | null {
  if (s.logoFiles.length > 0 || s.existingLogos.length > 0) return null;
  return "Adjunta el logo de la empresa (imagen PNG o JPG).";
}

function basesStepError(s: ReturnType<typeof useOfertaFormStore.getState>): string | null {
  if (s.basesFile || s.existingBases) return null;
  return "Adjunta el documento de bases del trabajo (PDF o Word).";
}

export function OfertaWizard({ empresaId, mode = "create", ofertaId }: Props) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("forward");
  const { step, nextStep, prevStep, isSubmitting, setSubmitting, reset } =
    useOfertaFormStore();

  const validateCurrentStep = (): string | null => {
    const s = useOfertaFormStore.getState();
    if (step === 1) {
      return (
        validarPaso1({ cronogramas: s.cronogramas }) ??
        logoStepError(s) ??
        basesStepError(s)
      );
    }
    if (step === 2) {
      return validarPaso2({
        nombrePuesto: s.nombrePuesto,
        perfil: s.perfil,
        tipoContrato: s.tipoContrato,
        tipoPuesto: s.tipoPuesto,
        cantidadVacantes: Number(s.cantidadVacantes),
        funciones: s.funciones,
        beneficios: s.beneficios,
        direccionLiteral: s.direccionLiteral,
      });
    }
    if (step === 3) {
      return validarPaso3({
        contactoPrincipal: s.contactoPrincipal,
        contactoGerente: s.contactoGerente,
      });
    }
    return null;
  };

  const handleNext = () => {
    setError(null);
    const msg = validateCurrentStep();
    if (msg) {
      setError(msg);
      return;
    }
    setSlideDirection("forward");
    nextStep();
  };

  const validateAll = (): string | null => {
    const s = useOfertaFormStore.getState();
    return (
      validarPaso1({ cronogramas: s.cronogramas }) ??
      logoStepError(s) ??
      basesStepError(s) ??
      validarPaso2({
        nombrePuesto: s.nombrePuesto,
        perfil: s.perfil,
        tipoContrato: s.tipoContrato,
        tipoPuesto: s.tipoPuesto,
        cantidadVacantes: Number(s.cantidadVacantes),
        funciones: s.funciones,
        beneficios: s.beneficios,
        direccionLiteral: s.direccionLiteral,
      }) ??
      validarPaso3({
        contactoPrincipal: s.contactoPrincipal,
        contactoGerente: s.contactoGerente,
      })
    );
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
    contactoPrincipal: state.contactoPrincipal,
    contactoGerente: state.contactoGerente,
    ...(isEdit ? { estado: state.estado } : {}),
  });

  const handleSubmit = async () => {
    setError(null);
    const msg = validateAll();
    if (msg) {
      setError(msg);
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
      setError(
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
    <div className="mx-auto max-w-2xl space-y-8">
      <StepIndicator
        current={step}
        labels={
          isEdit
            ? ["Convocatoria", "Vacante", "Contactos", lastStepLabel]
            : STEP_LABELS
        }
      />

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 md:p-8 shadow-sm overflow-hidden">
        <SlideView viewKey={step} direction={slideDirection}>
          {step === 1 && <WizardStepEmpresa />}
          {step === 2 && <WizardStepVacante />}
          {step === 3 && <WizardStepContacto />}
          {step === 4 && <WizardStepResumen isEdit={isEdit} />}
        </SlideView>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-100">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3 justify-between">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => {
                setSlideDirection("back");
                prevStep();
              }}
              disabled={isSubmitting}
            >
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
