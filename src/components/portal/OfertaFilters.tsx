"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Modalidad } from "@/types/bolsa";
import { MODALIDADES, MODALIDAD_LABEL, TIPOS_PUESTO } from "@/types/bolsa";
import { SALARIO_FILTRO_OPCIONES } from "@/lib/salario";
import { MOTION_REDUCE } from "@/lib/motion";

export type OfertaFilterValue = {
  empresa: string;
  modalidad: string;
  carrera: string;
  salario: string;
  ordenar: string;
  fecha: string;
  jornada: string;
  contrato: string;
  conocimiento: string;
  discapacidad: string;
  vistos: string;
};

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: OfertaFilterValue;
  empresas: Option[];
  contratos: string[];
  carreras: Option[];
  conocimientos: Option[];
  onChange: (next: OfertaFilterValue) => void;
};

export const EMPTY_FILTERS: OfertaFilterValue = {
  empresa: "",
  modalidad: "",
  carrera: "",
  salario: "",
  ordenar: "",
  fecha: "",
  jornada: "",
  contrato: "",
  conocimiento: "",
  discapacidad: "",
  vistos: "",
};

const EXTRA_KEYS: (keyof OfertaFilterValue)[] = [
  "ordenar",
  "fecha",
  "jornada",
  "contrato",
  "conocimiento",
  "discapacidad",
  "vistos",
];

export function filtersAreActive(value: OfertaFilterValue): boolean {
  return (Object.keys(value) as (keyof OfertaFilterValue)[]).some((key) =>
    Boolean(value[key])
  );
}

function FilterSelect({
  label,
  emptyLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  emptyLabel?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const active = value !== "";

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className={`max-w-[240px] cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm outline-none transition-colors ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
      }`}
    >
      <option value="">{emptyLabel ?? label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SalarioRadioFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 240 });
  const active = value !== "";

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 240),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const onViewport = () => setOpen(false);
    window.addEventListener("resize", onViewport);
    window.addEventListener("scroll", onViewport, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onViewport);
      window.removeEventListener("scroll", onViewport, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex max-w-[240px] items-center gap-2 cursor-pointer rounded-xl border py-2 pl-3 pr-2 text-sm font-semibold shadow-sm outline-none transition-colors ${
          active || open
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
        }`}
      >
        <span>Salario</span>
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5 shrink-0 opacity-70"
          aria-hidden="true"
        >
          <path d="M4.2 6.2a.7.7 0 0 1 .99 0L8 9.01l2.81-2.81a.7.7 0 1 1 .99.99l-3.3 3.3a.7.7 0 0 1-.99 0l-3.3-3.3a.7.7 0 0 1 0-.99Z" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
            className="fixed z-[80] rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg"
          >
            {SALARIO_FILTRO_OPCIONES.map((option) => {
              const checked = value === option.value;
              return (
                <label
                  key={option.value || "todos"}
                  className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="filtro-salario"
                    className="h-4 w-4 border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                    checked={checked}
                    onChange={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  );
}

export function OfertaFilters({
  value,
  empresas,
  contratos,
  carreras,
  conocimientos,
  onChange,
}: Props) {
  const extraActiveCount = EXTRA_KEYS.filter((key) => Boolean(value[key])).length;
  const [moreOpen, setMoreOpen] = useState(extraActiveCount > 0);
  const set = (key: keyof OfertaFilterValue, next: string) => {
    onChange({ ...value, [key]: next });
  };

  const hasFilters = filtersAreActive(value);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterSelect
          label="Empresa"
          value={value.empresa}
          onChange={(next) => set("empresa", next)}
          options={empresas}
        />
        <FilterSelect
          label="Modalidad"
          value={value.modalidad}
          onChange={(next) => set("modalidad", next)}
          options={MODALIDADES.map((item) => ({
            value: item,
            label: MODALIDAD_LABEL[item as Modalidad],
          }))}
        />
        <FilterSelect
          label="Carrera"
          value={value.carrera}
          onChange={(next) => set("carrera", next)}
          options={carreras}
        />
        <SalarioRadioFilter
          value={value.salario}
          onChange={(next) => set("salario", next)}
        />

        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
          aria-controls="filtros-adicionales"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
        >
          <FilterIcon />
          Filtros
          {extraActiveCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-emerald-800">
              {extraActiveCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div
        id="filtros-adicionales"
        className={`motion-filters-panel ${moreOpen ? "is-open" : ""} ${MOTION_REDUCE}`}
        aria-hidden={!moreOpen}
      >
        <div className="motion-filters-panel-inner">
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-2">
            <span className="motion-filter-chip motion-gpu">
              <FilterSelect
                label="Ordenar"
                value={value.ordenar}
                onChange={(next) => set("ordenar", next)}
                options={[
                  { value: "salario-asc", label: "Salario (menor a mayor)" },
                  { value: "recientes", label: "Más recientes" },
                  { value: "antiguas", label: "Más antiguas" },
                  { value: "titulo", label: "Título A–Z" },
                ]}
              />
            </span>
            <span className="motion-filter-chip motion-gpu">
              <FilterSelect
                label="Fecha"
                value={value.fecha}
                onChange={(next) => set("fecha", next)}
                options={[
                  { value: "1", label: "Últimas 24 horas" },
                  { value: "7", label: "Últimos 7 días" },
                  { value: "30", label: "Últimos 30 días" },
                ]}
              />
            </span>
            <span className="motion-filter-chip motion-gpu">
              <FilterSelect
                label="Jornada"
                value={value.jornada}
                onChange={(next) => set("jornada", next)}
                options={TIPOS_PUESTO.map((item) => ({ value: item, label: item }))}
              />
            </span>
            <span className="motion-filter-chip motion-gpu">
              <FilterSelect
                label="Contrato"
                value={value.contrato}
                onChange={(next) => set("contrato", next)}
                options={contratos.map((item) => ({ value: item, label: item }))}
              />
            </span>
            <span className="motion-filter-chip motion-gpu">
              <FilterSelect
                label="Conocimiento"
                value={value.conocimiento}
                onChange={(next) => set("conocimiento", next)}
                options={conocimientos}
              />
            </span>
            <span className="motion-filter-chip motion-gpu">
              <FilterSelect
                label="Discapacidad"
                value={value.discapacidad}
                onChange={(next) => set("discapacidad", next)}
                options={[{ value: "si", label: "Puestos inclusivos" }]}
              />
            </span>
            <span className="motion-filter-chip motion-gpu">
              <FilterSelect
                label="Vistos"
                emptyLabel="Todos"
                value={value.vistos}
                onChange={(next) => set("vistos", next)}
                options={[
                  { value: "vistos", label: "Vistos" },
                  { value: "no-vistos", label: "No vistos" },
                  { value: "postulados", label: "Postulados" },
                ]}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
