"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Career = {
  id: number;
  nombre: string;
};

type Props = {
  careers: Career[];
  value: string;
  onChange: (careerId: string) => void;
  error?: string;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function CareerCombobox({ careers, value, onChange, error }: Props) {
  const selected = careers.find((career) => String(career.id) === value);
  const [query, setQuery] = useState(selected?.nombre ?? "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) setQuery(selected.nombre);
  }, [selected]);

  const results = useMemo(() => {
    const search = normalize(query);
    const filtered = search
      ? careers.filter((career) => normalize(career.nombre).includes(search))
      : careers;
    return filtered.slice(0, 50);
  }, [careers, query]);

  const choose = (career: Career) => {
    onChange(String(career.id));
    setQuery(career.nombre);
    setOpen(false);
    setHighlighted(0);
  };

  return (
    <div className="relative space-y-1.5">
      <label htmlFor="carrera-buscador" className="text-sm font-medium text-slate-700">
        Carrera
      </label>
      <input
        id="carrera-buscador"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="carrera-resultados"
        autoComplete="off"
        value={query}
        placeholder="Escribe para buscar tu carrera…"
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange("");
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

      {open && (
        <ul
          id="carrera-resultados"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-white py-1 shadow-lg"
        >
          {results.map((career, index) => (
            <li key={career.id} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => choose(career)}
                className={`w-full px-4 py-2.5 text-left text-sm ${
                  index === highlighted
                    ? "bg-emerald-50 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                {career.nombre}
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">
              No se encontró una carrera con ese nombre.
            </li>
          )}
        </ul>
      )}

      <p className="text-xs text-slate-500">
        Escribe parte del nombre y selecciona una carrera de la lista.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
