"use client";

import { useEffect, useState } from "react";

import { EmpresaLogo } from "@/components/ui/EmpresaLogo";
import { SectionHint } from "@/components/ui/SectionHint";
import { useOfertaFormStore } from "@/stores/ofertaFormStore";
import { formatSalarioForSave } from "@/lib/salario";
import { MODALIDAD_LABEL } from "@/types/bolsa";

type Props = { isEdit?: boolean };

export function WizardStepResumen({ isEdit = false }: Props) {
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
    ...(isEdit ? [{ label: "Estado", value: state.estado }] : []),
    { label: "Convocatoria", value: state.nombrePuesto },
    { label: "Perfil", value: state.perfil },
    { label: "Contrato", value: state.tipoContrato },
    { label: "Jornada", value: state.tipoPuesto.join(", ") || "—" },
    { label: "Vacantes", value: state.cantidadVacantes },
    { label: "Modalidad", value: MODALIDAD_LABEL[state.modalidad] },
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

  const logoSrc = logoPreview ?? state.existingLogos[0]?.path ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Revisión final</h2>
        <p className="text-sm text-slate-500 mt-1">
          {isEdit
            ? "Verifica los datos antes de guardar."
            : "Verifica los datos antes de publicar."}
        </p>
      </header>

      {logoSrc && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <EmpresaLogo src={logoSrc} alt="Logo" size="lg" />
        </div>
      )}

      <dl className="divide-y divide-emerald-50 rounded-xl border border-emerald-100">
        {filas.map((f) => (
          <div key={f.label} className="grid sm:grid-cols-3 gap-1 px-4 py-3 text-sm">
            <dt className="font-medium text-slate-500">{f.label}</dt>
            <dd className="sm:col-span-2 text-slate-900">{f.value}</dd>
          </div>
        ))}
      </dl>

      <SectionHint title="Funciones">
        <p className="whitespace-pre-wrap">{state.funciones || "—"}</p>
      </SectionHint>

      <SectionHint title="Beneficios">
        <p className="whitespace-pre-wrap">{state.beneficios || "—"}</p>
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
