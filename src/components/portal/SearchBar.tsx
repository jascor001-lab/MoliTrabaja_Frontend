"use client";

import { MODALIDADES, MODALIDAD_LABEL, type Modalidad } from "@/types/bolsa";

type Props = {
  query: string;
  modalidad: string;
  onQueryChange: (value: string) => void;
  onModalidadChange: (value: string) => void;
};

export function SearchBar({
  query,
  modalidad,
  onQueryChange,
  onModalidadChange,
}: Props) {
  return (
    <form
      className="w-full max-w-4xl mx-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col sm:flex-row rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-300 transition-all duration-300 ease-fluid focus-within:shadow-md motion-reduce:transition-none">
        <div className="flex flex-1 min-w-0">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Puesto o palabra clave"
            className="flex-1 min-w-0 border-0 border-b sm:border-b-0 sm:border-r border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            aria-label="Puesto o palabra clave"
          />
          <select
            value={modalidad}
            onChange={(e) => onModalidadChange(e.target.value)}
            className="w-full sm:w-44 shrink-0 border-0 border-b sm:border-b-0 sm:border-r border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 focus:outline-none focus:ring-0 cursor-pointer"
            aria-label="Modalidad de trabajo"
          >
            <option value="">Todas las modalidades</option>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {MODALIDAD_LABEL[m as Modalidad]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="shrink-0 bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
