"use client";

import { tiempoRelativo } from "@/lib/format-fecha";
import { MODALIDAD_LABEL, type OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  oferta: OfertaLaboralDTO;
  selected?: boolean;
  yaPostulado?: boolean;
  vista?: boolean;
  onSelect: (oferta: OfertaLaboralDTO) => void;
};

export function OfertaCard({
  oferta,
  selected = false,
  yaPostulado = false,
  vista = false,
  onSelect,
}: Props) {
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
        box-border w-full cursor-pointer rounded-xl border p-4 text-left
        transition-[box-shadow,border-color,background-color] duration-300 ease-fluid
        motion-reduce:transition-none
        ${
          selected
            ? "border-emerald-500 bg-emerald-50/60 shadow-sm ring-1 ring-inset ring-emerald-500/25"
            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2">
          {oferta.titulo}
        </h3>
      </div>

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
        <div className="shrink-0 text-right">
          {yaPostulado ? (
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Postulado
            </p>
          ) : vista ? (
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Visto
            </p>
          ) : null}
          <p className="text-[11px] text-slate-400 whitespace-nowrap">
            Publicado {tiempoRelativo(oferta.fechaPublicacion)}
          </p>
        </div>
      </div>
    </article>
  );
}
