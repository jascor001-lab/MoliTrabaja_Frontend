"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CatalogoConocimientoDTO } from "@/types/catalogos";

type Props = {
  knowledge: CatalogoConocimientoDTO[];
  value: string;
  customValue: string;
  onChange: (knowledgeId: string, knowledgeName: string) => void;
  error?: string;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function KnowledgeCombobox({
  knowledge,
  value,
  customValue,
  onChange,
  error,
}: Props) {
  const selected = knowledge.find((item) => String(item.id) === value);
  const [query, setQuery] = useState(selected?.nombre ?? customValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) setQuery(selected.nombre);
  }, [selected]);

  const results = useMemo(() => {
    const search = normalize(query);
    if (!search) return [];
    return knowledge
      .filter((item) => normalize(`${item.nombre} ${item.grupo}`).includes(search))
      .slice(0, 40);
  }, [knowledge, query]);

  const choose = (item: CatalogoConocimientoDTO) => {
    setQuery(item.nombre);
    onChange(String(item.id), item.nombre);
    setOpen(false);
    setHighlighted(0);
  };

  return (
    <div className="relative space-y-1.5">
      <label
        htmlFor="conocimiento-buscador"
        className="text-sm font-medium text-slate-700"
      >
        Conocimiento *
      </label>
      <input
        id="conocimiento-buscador"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="conocimiento-resultados"
        autoComplete="off"
        required
        value={query}
        placeholder="Escribe para buscar un conocimiento…"
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange("", event.target.value);
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
          id="conocimiento-resultados"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-white py-1 shadow-lg"
        >
          {results.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => choose(item)}
                className={`w-full px-4 py-2.5 text-left ${
                  index === highlighted
                    ? "bg-emerald-50 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <span className="block text-sm font-medium">{item.nombre}</span>
                <span className="block text-xs text-slate-500">{item.grupo}</span>
              </button>
            </li>
          ))}
          {!knowledge.some(
            (item) => normalize(item.nombre) === normalize(query)
          ) && (
            <li className="border-t border-slate-100 px-4 py-3 text-sm text-emerald-700">
              Si no aparece en la lista, se guardará “{query.trim()}” como nuevo
              conocimiento.
            </li>
          )}
        </ul>
      )}

      <p className="text-xs text-slate-500">
        Selecciona una sugerencia o escribe un conocimiento nuevo.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
