"use client";

import { useMemo, useRef, useState } from "react";

import type { CatalogoInstitucionDTO } from "@/types/catalogos";

type Props = {
  institutions: CatalogoInstitucionDTO[];
  value: string;
  onChange: (institution: string) => void;
  error?: string;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function InstitutionCombobox({
  institutions,
  value,
  onChange,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const search = normalize(value);
    if (!search) return [];
    return institutions
      .filter((institution) =>
        normalize(`${institution.nombre} ${institution.razonSocial}`).includes(search)
      )
      .slice(0, 30);
  }, [institutions, value]);

  const exactMatch = institutions.some((institution) => {
    const search = normalize(value);
    return (
      normalize(institution.nombre) === search ||
      normalize(institution.razonSocial) === search
    );
  });

  const choose = (institution: CatalogoInstitucionDTO) => {
    onChange(institution.razonSocial || institution.nombre);
    setOpen(false);
    setHighlighted(0);
  };

  return (
    <div className="relative space-y-1.5">
      <label
        htmlFor="institucion-buscador"
        className="text-sm font-medium text-slate-700"
      >
        Institución
      </label>
      <input
        id="institucion-buscador"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="institucion-resultados"
        autoComplete="off"
        value={value}
        placeholder="Escribe para buscar una institución…"
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onKeyDown={(event) => {
          if (!open || results.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted((current) => (current + 1) % results.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted((current) =>
              current <= 0 ? results.length - 1 : current - 1
            );
          } else if (event.key === "Enter") {
            event.preventDefault();
            choose(results[highlighted]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />

      {open && value.trim() && (
        <ul
          id="institucion-resultados"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-white py-1 shadow-lg"
        >
          {results.map((institution, index) => (
            <li
              key={institution.id}
              role="option"
              aria-selected={index === highlighted}
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => choose(institution)}
                className={`w-full px-4 py-2.5 text-left ${
                  index === highlighted
                    ? "bg-emerald-50 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <span className="block text-sm font-medium">
                  {institution.razonSocial}
                </span>
                {institution.nombre !== institution.razonSocial && (
                  <span className="block text-xs text-slate-500">
                    {institution.nombre}
                  </span>
                )}
              </button>
            </li>
          ))}
          {!exactMatch && (
            <li className="border-t border-slate-100 px-4 py-3 text-sm text-emerald-700">
              Si no aparece en la lista, se guardará “{value.trim()}” como nueva
              institución.
            </li>
          )}
        </ul>
      )}

      <p className="text-xs text-slate-500">
        Selecciona una sugerencia o escribe el nombre completo de una institución nueva.
      </p>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
