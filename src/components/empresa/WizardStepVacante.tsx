"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { CareerMultiSelect } from "@/components/ui/CareerMultiSelect";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { KnowledgeMultiSelect } from "@/components/ui/KnowledgeMultiSelect";
import { PuestoInclusivoCheckbox } from "@/components/ui/PuestoInclusivoCheckbox";
import { SectionHint } from "@/components/ui/SectionHint";
import { Textarea } from "@/components/ui/Textarea";
import { useOfertaFormStore } from "@/stores/ofertaFormStore";
import {
  ESTADOS_OFERTA,
  MODALIDADES,
  MODALIDAD_LABEL,
  TIPOS_PUESTO,
  type EstadoOferta,
  type Modalidad,
  type TipoPuesto,
} from "@/types/bolsa";
import { TIPOS_CONTRATO } from "@/types/catalogos";
import type { CatalogoCarreraDTO, CatalogoConocimientoDTO } from "@/types/catalogos";

const DireccionMapPicker = dynamic(
  () =>
    import("@/components/map/DireccionMapPicker").then((m) => m.DireccionMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-center text-sm text-slate-500">
        Cargando mapa…
      </div>
    ),
  }
);

export function WizardStepVacante() {
  const {
    nombrePuesto,
    perfil,
    tipoContrato,
    tipoPuesto,
    cantidadVacantes,
    funciones,
    beneficios,
    modalidad,
    salarioAConvenir,
    salarioMonto,
    direccionLiteral,
    latitud,
    longitud,
    carreraIds,
    conocimientoIds,
    estado,
    editingOfertaId,
    aptoDiscapacidad,
    setField,
    toggleTipoPuesto,
    toggleCarrera,
    toggleConocimiento,
    fieldErrors,
  } = useOfertaFormStore();

  const [carreras, setCarreras] = useState<CatalogoCarreraDTO[]>([]);
  const [conocimientos, setConocimientos] = useState<CatalogoConocimientoDTO[]>([]);

  useEffect(() => {
    fetch("/api/catalogos")
      .then((r) => r.json())
      .then((data) => {
        setCarreras(data.carreras ?? []);
        setConocimientos(data.conocimientos ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Vacante ofrecida</h2>
        <p className="text-sm text-slate-500 mt-1">
          Datos del puesto según OfertaLaboral del diagrama UML.
        </p>
      </header>

      <Input
        label="Nombre de la convocatoria"
        placeholder="Ej. Asistente administrativo"
        value={nombrePuesto}
        onChange={(e) => setField("nombrePuesto", e.target.value)}
        error={fieldErrors.nombrePuesto}
      />

      <Textarea
        label="Perfil requerido"
        placeholder="Describe el perfil ideal del candidato…"
        value={perfil}
        onChange={(e) => setField("perfil", e.target.value)}
        error={fieldErrors.perfil}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Tipo de contrato</legend>
        <div className="flex flex-wrap gap-2">
          {TIPOS_CONTRATO.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setField("tipoContrato", tipo)}
              className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                tipoContrato === tipo
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-emerald-200 hover:border-emerald-400"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
        <FieldError error={fieldErrors.tipoContrato} />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Jornada (tipo de puesto)</legend>
        <div className="flex flex-wrap gap-2">
          {TIPOS_PUESTO.map((tipo) => {
            const selected = tipoPuesto.includes(tipo);
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => toggleTipoPuesto(tipo as TipoPuesto)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                  selected
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-emerald-200 hover:border-emerald-400"
                }`}
              >
                {tipo}
              </button>
            );
          })}
        </div>
        <FieldError error={fieldErrors.tipoPuesto} />
      </fieldset>

      <Input
        label="N° vacantes"
        type="number"
        min={1}
        value={cantidadVacantes}
        onChange={(e) => setField("cantidadVacantes", e.target.value)}
        error={fieldErrors.cantidadVacantes}
      />

      <Textarea
        label="Funciones"
        value={funciones}
        onChange={(e) => setField("funciones", e.target.value)}
        error={fieldErrors.funciones}
      />

      <Textarea
        label="Beneficios"
        value={beneficios}
        onChange={(e) => setField("beneficios", e.target.value)}
        error={fieldErrors.beneficios}
      />

      <PuestoInclusivoCheckbox
        variant="empresa"
        checked={aptoDiscapacidad}
        onChange={(checked) => setField("aptoDiscapacidad", checked)}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Modalidad</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MODALIDADES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setField("modalidad", m as Modalidad)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                modalidad === m
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200"
                  : "border-emerald-100 bg-white text-slate-600"
              }`}
            >
              {MODALIDAD_LABEL[m]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Salario (opcional)</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setField("salarioAConvenir", true);
              setField("salarioMonto", "");
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
              salarioAConvenir
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-emerald-200 hover:border-emerald-400"
            }`}
          >
            A convenir
          </button>
          <button
            type="button"
            onClick={() => setField("salarioAConvenir", false)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
              !salarioAConvenir
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-emerald-200 hover:border-emerald-400"
            }`}
          >
            Monto en soles (S/)
          </button>
        </div>
        {!salarioAConvenir && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Monto mensual</span>
            <div className="flex rounded-xl border border-emerald-100 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-400">
              <span className="flex items-center px-4 text-sm font-semibold text-emerald-800 bg-emerald-50 border-r border-emerald-100">
                S/
              </span>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="5500"
                value={salarioMonto}
                onChange={(e) => setField("salarioMonto", e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">
              Se guardará como soles peruanos (ej. S/ 5,500).
            </span>
          </label>
        )}
      </fieldset>

      <SectionHint title="Dirección del puesto ">
        Lugar de trabajo para la vacante. Marca el punto en el mapa o busca por dirección.
      </SectionHint>

      <DireccionMapPicker
        direccionLiteral={direccionLiteral}
        latitud={latitud}
        longitud={longitud}
        onDireccionChange={(v) => setField("direccionLiteral", v)}
        onCoordsChange={(lat, lng) => {
          setField("latitud", lat);
          setField("longitud", lng);
        }}
        error={fieldErrors.direccionLiteral}
      />

      {carreras.length > 0 && (
        <CareerMultiSelect
          careers={carreras}
          selectedIds={carreraIds}
          onToggle={toggleCarrera}
        />
      )}

      {conocimientos.length > 0 && (
        <KnowledgeMultiSelect
          knowledge={conocimientos}
          selectedIds={conocimientoIds}
          onToggle={toggleConocimiento}
        />
      )}

      {editingOfertaId && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Estado de la oferta</legend>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_OFERTA.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setField("estado", e as EstadoOferta)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border ${
                  estado === e
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-emerald-200"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
