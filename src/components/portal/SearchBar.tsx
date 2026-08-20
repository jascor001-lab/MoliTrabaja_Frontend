"use client";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function SearchBar({
  query,
  onQueryChange,
}: Props) {
  return (
    <form
      className="w-full"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col sm:flex-row rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-300 transition-all duration-300 ease-fluid focus-within:shadow-md motion-reduce:transition-none">
        <div className="flex flex-1 min-w-0">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Puesto, empresa, carrera o conocimiento"
            className="flex-1 min-w-0 border-0 border-b sm:border-b-0 sm:border-r border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            aria-label="Puesto o palabra clave"
          />
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
