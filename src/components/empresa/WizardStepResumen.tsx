"use client";

import { useEffect, useState } from "react";

import { SectionHint } from "@/components/ui/SectionHint";
import { resolveLogoSrc } from "@/lib/logo-oferta";
import { formatSalarioForSave } from "@/lib/salario";
import { useOfertaFormStore } from "@/stores/ofertaFormStore";
import { ESTADOS_OFERTA, MODALIDAD_LABEL, type EstadoOferta } from "@/types/bolsa";

type Props = { isEdit?: boolean; embedded?: boolean; includeEstado?: boolean };

export function WizardStepResumen({
  isEdit = false,
  embedded = false,
  includeEstado = false,
}: Props) {
  const state = useOfertaFormStore();
  const conv = state.cronogramas[0];
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const img = state.logoFiles.find((f) => f.type.startsWith("image/"));
    if (!img) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(img);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [state.logoFiles]);

  const filas: { label: string; value: string }[] = [
    {
      label: "Cronograma",
      value: conv?.fin
        ? `${conv.inicio} → ${conv.fin}`
        : `Desde ${conv?.inicio ?? "—"}`,
    },
    {
      label: "Bases",
      value: state.basesFile?.name ?? state.existingBases?.name ?? "Sin documento",
    },
    ...(isEdit && !includeEstado ? [{ label: "Estado", value: state.estado }] : []),
    { label: "Convocatoria", value: state.nombrePuesto },
    { label: "Perfil", value: state.perfil },
    { label: "Contrato", value: state.tipoContrato },
    { label: "Jornada", value: state.tipoPuesto.join(", ") || "—" },
    { label: "Vacantes", value: state.cantidadVacantes },
    { label: "Modalidad", value: MODALIDAD_LABEL[state.modalidad] },
    {
      label: "Discapacidad",
      value: state.aptoDiscapacidad ? "Puesto inclusivo" : "No indicado",
    },
    {
      label: "Salario",
      value: formatSalarioForSave(state.salarioAConvenir, state.salarioMonto),
    },
    { label: "Dirección", value: state.direccionLiteral },
    {
      label: "Contacto RRHH",
      value: `${state.contactoPrincipal.nombres} ${state.contactoPrincipal.apellidoPaterno} · ${state.contactoPrincipal.correo}`,
    },
    {
      label: "Gerente",
      value: `${state.contactoGerente.nombres} ${state.contactoGerente.apellidoPaterno}`,
    },
  ];

  const logoSrc = logoPreview ?? state.existingLogos.filter((l) => l.path).at(-1)?.path ?? null;

  return (
    <div className="space-y-6">
      {!embedded && (
        <header>
          <h2 className="text-xl font-bold text-slate-900">Revisión final</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isEdit
              ? "Verifica los datos antes de guardar."
              : "Verifica los datos antes de publicar."}
          </p>
        </header>
      )}

      <div className="h-56 w-full overflow-hidden rounded-2xl border-2 border-emerald-200 bg-emerald-50/40">
        {logoSrc ? (
          <img
            src={resolveLogoSrc(logoSrc)}
            alt="Portada de la oferta"
            className="h-full w-full object-contain object-center p-4"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin portada
          </div>
        )}
      </div>

      {includeEstado && isEdit && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Estado de la oferta</legend>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_OFERTA.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => state.setField("estado", e as EstadoOferta)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border ${
                  state.estado === e
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-emerald-200"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Activa se muestra en el portal. Pausada y Finalizada quedan ocultas para los
            postulantes.
          </p>
        </fieldset>
      )}

      <dl className="divide-y divide-emerald-50 rounded-xl border border-emerald-100">
        {filas.map((f) => (
          <div key={f.label} className="grid sm:grid-cols-3 gap-1 px-4 py-3 text-sm">
            <dt className="font-medium text-slate-500">{f.label}</dt>
            <dd className="sm:col-span-2 text-slate-900 break-words">{f.value}</dd>
          </div>
        ))}
      </dl>

      <SectionHint title="Funciones">
        <p className="whitespace-pre-wrap break-words">{state.funciones || "—"}</p>
      </SectionHint>

      <SectionHint title="Beneficios">
        <p className="whitespace-pre-wrap break-words">{state.beneficios || "—"}</p>
      </SectionHint>

      {(state.carreraIds.length > 0 || state.conocimientoIds.length > 0) && (
        <SectionHint title="Requisitos catalogados">
          <p className="text-sm text-slate-600">
            {state.carreraIds.length} carrera(s) · {state.conocimientoIds.length}{" "}
            conocimiento(s) seleccionados
          </p>
        </SectionHint>
      )}
    </div>
  );
}
