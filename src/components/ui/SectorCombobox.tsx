"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  sectors: readonly string[];
  value: string;
  onChange: (sector: string) => void;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function SectorCombobox({ sectors, value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const search = normalize(query);
    if (!search) return [];
    return sectors
      .filter((sector) => normalize(sector).includes(search))
      .slice(0, 30);
  }, [query, sectors]);

  const choose = (sector: string) => {
    setQuery(sector);
    onChange(sector);
    setOpen(false);
    setHighlighted(0);
  };

  return (
    <div className="relative space-y-1.5">
      <label htmlFor="sector-buscador" className="text-sm font-medium text-slate-700">
        Sector *
      </label>
      <input
        id="sector-buscador"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="sector-resultados"
        autoComplete="off"
        required
        value={query}
        placeholder="Escribe para buscar el sector…"
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

      {open && query.trim() && (
        <ul
          id="sector-resultados"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-white py-1 shadow-lg"
        >
          {results.map((sector, index) => (
            <li key={sector} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => choose(sector)}
                className={`w-full px-4 py-2.5 text-left text-sm ${
                  index === highlighted
                    ? "bg-emerald-50 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                {sector}
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">
              No se encontró un sector con ese nombre.
            </li>
          )}
        </ul>
      )}

      <p className="text-xs text-slate-500">
        Escribe una palabra y selecciona una opción de la lista.
      </p>
    </div>
  );
}
