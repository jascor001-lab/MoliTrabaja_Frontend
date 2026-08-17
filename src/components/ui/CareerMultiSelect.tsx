"use client";

import { useMemo, useRef, useState } from "react";

type Career = {
  id: number;
  nombre: string;
};

type Props = {
  careers: Career[];
  selectedIds: number[];
  onToggle: (careerId: number) => void;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function CareerMultiSelect({
  careers,
  selectedIds,
  onToggle,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = useMemo(
    () => careers.filter((career) => selectedIds.includes(career.id)),
    [careers, selectedIds]
  );

  const results = useMemo(() => {
    const search = normalize(query);
    if (!search) return [];
    return careers
      .filter(
        (career) =>
          !selectedIds.includes(career.id) &&
          normalize(career.nombre).includes(search)
      )
      .slice(0, 40);
  }, [careers, query, selectedIds]);

  const choose = (career: Career) => {
    onToggle(career.id);
    setQuery("");
    setOpen(false);
    setHighlighted(0);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">
        Carreras requeridas
      </legend>

      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="carreras-requeridas-resultados"
          autoComplete="off"
          value={query}
          placeholder="Escribe para buscar una carrera…"
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setOpen(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
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
            id="carreras-requeridas-resultados"
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-white py-1 shadow-lg"
          >
            {results.map((career, index) => (
              <li
                key={career.id}
                role="option"
                aria-selected={index === highlighted}
              >
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
                No hay carreras disponibles con ese nombre.
              </li>
            )}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Escribe y selecciona una o más carreras requeridas.
      </p>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selected.map((career) => (
            <span
              key={career.id}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
            >
              {career.nombre}
              <button
                type="button"
                onClick={() => onToggle(career.id)}
                className="text-emerald-600 hover:text-red-600"
                aria-label={`Quitar ${career.nombre}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </fieldset>
  );
}
