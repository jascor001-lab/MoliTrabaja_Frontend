"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { readApiError } from "@/lib/api-error";
import { MOTION_REDUCE } from "@/lib/motion";
import { buildOfertaFormData } from "@/lib/oferta-form-payload";
import {
  erroresPaso1,
  erroresPaso2,
  erroresPaso3,
  hasFieldErrors,
} from "@/lib/validacion-oferta";
import {
  useOfertaFormStore,
  type OfertaFormFields,
} from "@/stores/ofertaFormStore";
import type { ArchivoAdjuntoMeta, LogoArchivoMeta, OfertaLaboralDTO } from "@/types/bolsa";

import { WizardStepContacto } from "./WizardStepContacto";
import { WizardStepEmpresa } from "./WizardStepEmpresa";
import { WizardStepResumen } from "./WizardStepResumen";
import { WizardStepVacante } from "./WizardStepVacante";

type Props = {
  empresaId: string;
  ofertaId: string;
};

type BlockId = "convocatoria" | "vacante" | "contactos" | "revision";

type Snapshot = OfertaFormFields & {
  existingLogos: LogoArchivoMeta[];
  existingBases: ArchivoAdjuntoMeta | null;
};

const BLOCKS: {
  id: BlockId;
  title: string;
  hint: string;
  saveLabel: string;
}[] = [
  {
    id: "convocatoria",
    title: "Convocatoria",
    hint: "Logo, fechas y bases",
    saveLabel: "Guardar convocatoria",
  },
  {
    id: "vacante",
    title: "Vacante",
    hint: "Puesto, requisitos y ubicación",
    saveLabel: "Guardar vacante",
  },
  {
    id: "contactos",
    title: "Contactos",
    hint: "RRHH y gerente",
    saveLabel: "Guardar contactos",
  },
  {
    id: "revision",
    title: "Revisión",
    hint: "Portada y estado de publicación",
    saveLabel: "Guardar revisión",
  },
];

const BLOCK_KEYS: Record<BlockId, (keyof Snapshot)[]> = {
  convocatoria: [
    "logoFiles",
    "basesFile",
    "enviarLogoPorCorreo",
    "cronogramas",
    "existingLogos",
    "existingBases",
  ],
  vacante: [
    "nombrePuesto",
    "perfil",
    "tipoContrato",
    "tipoPuesto",
    "cantidadVacantes",
    "funciones",
    "beneficios",
    "modalidad",
    "salarioAConvenir",
    "salarioMonto",
    "direccionLiteral",
    "latitud",
    "longitud",
    "carreraIds",
    "conocimientoIds",
    "aptoDiscapacidad",
  ],
  contactos: ["contactoPrincipal", "contactoGerente"],
  revision: ["estado"],
};

function takeSnapshot(): Snapshot {
  const s = useOfertaFormStore.getState();
  return {
    logoFiles: s.logoFiles,
    basesFile: s.basesFile,
    enviarLogoPorCorreo: s.enviarLogoPorCorreo,
    cronogramas: s.cronogramas,
    nombrePuesto: s.nombrePuesto,
    perfil: s.perfil,
    tipoContrato: s.tipoContrato,
    tipoPuesto: s.tipoPuesto,
    cantidadVacantes: s.cantidadVacantes,
    funciones: s.funciones,
    beneficios: s.beneficios,
    modalidad: s.modalidad,
    salarioAConvenir: s.salarioAConvenir,
    salarioMonto: s.salarioMonto,
    direccionLiteral: s.direccionLiteral,
    latitud: s.latitud,
    longitud: s.longitud,
    carreraIds: s.carreraIds,
    conocimientoIds: s.conocimientoIds,
    aptoDiscapacidad: s.aptoDiscapacidad,
    contactoPrincipal: s.contactoPrincipal,
    contactoGerente: s.contactoGerente,
    estado: s.estado,
    existingLogos: s.existingLogos,
    existingBases: s.existingBases,
  };
}

function restoreBlock(id: BlockId, snap: Snapshot) {
  const patch: Partial<Snapshot> = {};
  for (const key of BLOCK_KEYS[id]) {
    (patch as Record<string, unknown>)[key] = snap[key];
  }
  useOfertaFormStore.setState({
    ...patch,
    fieldErrors: {},
    submitError: null,
  });
}

function validateBlock(id: BlockId): boolean {
  const s = useOfertaFormStore.getState();
  let errors = {};
  if (id === "convocatoria") {
    errors = erroresPaso1({
      cronogramas: s.cronogramas,
      tieneLogo: s.logoFiles.length > 0 || s.existingLogos.length > 0,
      tieneBases: Boolean(s.basesFile || s.existingBases),
    });
  } else if (id === "vacante") {
    errors = erroresPaso2({
      nombrePuesto: s.nombrePuesto,
      perfil: s.perfil,
      tipoContrato: s.tipoContrato,
      tipoPuesto: s.tipoPuesto,
      cantidadVacantes: Number(s.cantidadVacantes),
      funciones: s.funciones,
      beneficios: s.beneficios,
      direccionLiteral: s.direccionLiteral,
    });
  } else if (id === "contactos") {
    errors = erroresPaso3({
      contactoPrincipal: s.contactoPrincipal,
      contactoGerente: s.contactoGerente,
    });
  }
  s.setFieldErrors(errors);
  return !hasFieldErrors(errors);
}

function scrollBlockIntoView(id: BlockId) {
  const el = document.getElementById(`oferta-bloque-${id}`);
  if (!el) return;
  window.requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function OfertaEditBlocks({ empresaId, ofertaId }: Props) {
  const applySavedMedia = useOfertaFormStore((s) => s.applySavedMedia);
  const setSubmitting = useOfertaFormStore((s) => s.setSubmitting);
  const isSubmitting = useOfertaFormStore((s) => s.isSubmitting);

  const [open, setOpen] = useState<Record<BlockId, boolean>>({
    convocatoria: false,
    vacante: false,
    contactos: false,
    revision: false,
  });
  const [activeId, setActiveId] = useState<BlockId | null>(null);
  const [savingId, setSavingId] = useState<BlockId | null>(null);
  const [messages, setMessages] = useState<
    Partial<Record<BlockId, { type: "ok" | "error"; text: string }>>
  >({});
  const snapshots = useRef<Partial<Record<BlockId, Snapshot>>>({});
  const snapped = useRef<Record<BlockId, boolean>>({
    convocatoria: false,
    vacante: false,
    contactos: false,
    revision: false,
  });

  if (!snapped.current.convocatoria) {
    const snap = takeSnapshot();
    snapshots.current = {
      convocatoria: snap,
      vacante: snap,
      contactos: snap,
      revision: snap,
    };
    snapped.current = {
      convocatoria: true,
      vacante: true,
      contactos: true,
      revision: true,
    };
  }

  useEffect(() => {
    if (!activeId || !open[activeId]) return;
    const timer = window.setTimeout(() => scrollBlockIntoView(activeId), 80);
    return () => window.clearTimeout(timer);
  }, [activeId, open]);

  const selectBlock = (id: BlockId) => {
    setOpen((prev) => {
      const nextOpen = !prev[id];
      // Al elegir uno, se abre como principal y se cierran los demás.
      if (nextOpen) {
        return {
          convocatoria: id === "convocatoria",
          vacante: id === "vacante",
          contactos: id === "contactos",
          revision: id === "revision",
        };
      }
      return { ...prev, [id]: false };
    });
    setActiveId(id);
    setMessages((prev) => ({ ...prev, [id]: undefined }));
  };

  const cancel = (id: BlockId) => {
    const snap = snapshots.current[id];
    if (snap) restoreBlock(id, snap);
    setMessages((prev) => ({ ...prev, [id]: undefined }));
  };

  const save = async (id: BlockId) => {
    if (!validateBlock(id)) {
      setOpen({
        convocatoria: id === "convocatoria",
        vacante: id === "vacante",
        contactos: id === "contactos",
        revision: id === "revision",
      });
      setActiveId(id);
      setMessages((prev) => ({
        ...prev,
        [id]: { type: "error", text: "Revisa los campos marcados en este bloque." },
      }));
      return;
    }

    setSavingId(id);
    setSubmitting(true);
    setMessages((prev) => ({ ...prev, [id]: undefined }));

    try {
      const state = useOfertaFormStore.getState();
      const res = await fetch(`/api/ofertas/${ofertaId}`, {
        method: "PATCH",
        body: buildOfertaFormData(state, empresaId, true),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "No se pudo guardar la oferta"));
      }

      if (id === "convocatoria") {
        const refreshed = await fetch(`/api/ofertas/${ofertaId}`);
        if (refreshed.ok) {
          const updated = (await refreshed.json()) as OfertaLaboralDTO;
          if (updated?.logoArchivos) applySavedMedia(updated);
          else useOfertaFormStore.setState({ logoFiles: [], basesFile: null });
        } else {
          useOfertaFormStore.setState({ logoFiles: [], basesFile: null });
        }
      }

      snapshots.current[id] = takeSnapshot();
      snapped.current[id] = true;
      setMessages((prev) => ({
        ...prev,
        [id]: { type: "ok", text: "Cambios guardados." },
      }));
    } catch (e) {
      setMessages((prev) => ({
        ...prev,
        [id]: {
          type: "error",
          text: e instanceof Error ? e.message : "Error al guardar",
        },
      }));
    } finally {
      setSavingId(null);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 pb-16">
      {BLOCKS.map((block) => {
        const isOpen = open[block.id];
        const msg = messages[block.id];
        const busy = savingId === block.id;
        const isActive = activeId === block.id && isOpen;

        return (
          <article
            key={block.id}
            id={`oferta-bloque-${block.id}`}
            className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-sm transition-[border-color,box-shadow] duration-300 ${
              isActive
                ? "border-emerald-500 shadow-md ring-2 ring-emerald-200/70"
                : isOpen
                  ? "border-emerald-400 ring-1 ring-emerald-100"
                  : "border-emerald-100 hover:border-emerald-300"
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              disabled={isSubmitting}
              onClick={() => selectBlock(block.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left disabled:opacity-60"
            >
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900">{block.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{block.hint}</p>
                {msg && !isOpen ? (
                  <p
                    className={`mt-1 text-xs ${
                      msg.type === "ok" ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {msg.text}
                  </p>
                ) : null}
              </div>
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className={`h-4 w-4 shrink-0 text-emerald-700 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <path d="M4.2 6.2a.7.7 0 0 1 .99 0L8 9.01l2.81-2.81a.7.7 0 1 1 .99.99l-3.3 3.3a.7.7 0 0 1-.99 0l-3.3-3.3a.7.7 0 0 1 0-.99Z" />
              </svg>
            </button>

            <div className={`motion-accordion ${isOpen ? "is-open" : ""} ${MOTION_REDUCE}`}>
              <div className="motion-accordion-inner">
                <div className="border-t border-emerald-50">
                  <div className="scroll-panel max-h-[min(70dvh,640px)] overflow-y-auto overscroll-contain px-5 py-4">
                    {block.id === "convocatoria" && <WizardStepEmpresa embedded />}
                    {block.id === "vacante" && (
                      <WizardStepVacante embedded includeEstado={false} />
                    )}
                    {block.id === "contactos" && <WizardStepContacto embedded />}
                    {block.id === "revision" && (
                      <WizardStepResumen isEdit embedded includeEstado />
                    )}
                  </div>

                  <footer className="border-t border-emerald-50 px-5 py-3">
                    {msg ? (
                      <p
                        className={`mb-2 text-xs ${
                          msg.type === "ok" ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {msg.text}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => cancel(block.id)}
                        disabled={busy}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={() => save(block.id)} disabled={busy}>
                        {busy ? "Guardando…" : block.saveLabel}
                      </Button>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
