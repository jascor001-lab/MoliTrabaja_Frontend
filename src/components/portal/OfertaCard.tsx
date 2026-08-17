"use client";

import { tiempoRelativo } from "@/lib/format-fecha";
import { MODALIDAD_LABEL, type OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  oferta: OfertaLaboralDTO;
  selected?: boolean;
  onSelect: (oferta: OfertaLaboralDTO) => void;
};

export function OfertaCard({ oferta, selected = false, onSelect }: Props) {
  const empresa = oferta.empresa?.razonSocial || oferta.empresa?.nombre || "Empresa";

  return (
    <article
      role="button"
      tabIndex={0}
      aria-selected={selected}
      onClick={() => onSelect(oferta)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(oferta);
        }
      }}
      className={`
        cursor-pointer rounded-lg border p-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-500 ease-fluid
        motion-reduce:transition-none
        ${
          selected
            ? "border-emerald-500 bg-emerald-50/60 shadow-md ring-1 ring-emerald-500/30 scale-[1.01]"
            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm hover:scale-[1.005] active:scale-[0.99]"
        }
      `}
    >
      <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2">
        {oferta.titulo}
      </h3>

      <p className="text-sm text-slate-600 mt-1 truncate">{empresa}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          {MODALIDAD_LABEL[oferta.modalidad]}
        </span>
        {oferta.tipoPuesto.slice(0, 1).map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
          >
            {t}
          </span>
        ))}
        {oferta.aptoDiscapacidad && (
          <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
            Inclusivo
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-sm font-semibold text-emerald-700 truncate">{oferta.salario}</p>
        <p className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
          {tiempoRelativo(oferta.fechaPublicacion)}
        </p>
      </div>
    </article>
  );
}
