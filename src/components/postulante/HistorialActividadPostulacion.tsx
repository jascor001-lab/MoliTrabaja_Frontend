import type { ActividadPostulacion } from "@/types/postulacion";

import { MOTION_REDUCE } from "@/lib/motion";

const DOT: Record<ActividadPostulacion["estado"], string> = {
  completado: "bg-emerald-500 border-emerald-500",
  actual: "bg-emerald-600 border-emerald-600 ring-4 ring-emerald-100",
  pendiente: "bg-white border-slate-300",
};

const LABEL: Record<ActividadPostulacion["estado"], string> = {
  completado: "text-slate-700",
  actual: "text-emerald-900 font-semibold",
  pendiente: "text-slate-400",
};

type Props = {
  historial: ActividadPostulacion[];
  compact?: boolean;
};

export function HistorialActividadPostulacion({ historial, compact = false }: Props) {
  return (
    <ol className={`relative ${compact ? "space-y-3" : "space-y-4"}`}>
      {historial.map((item, i) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`h-3 w-3 rounded-full border-2 shrink-0 ${DOT[item.estado]} ${MOTION_REDUCE}`}
              aria-hidden
            />
            {i < historial.length - 1 && (
              <span
                className={`w-0.5 flex-1 min-h-[2rem] mt-1 ${
                  item.estado === "completado" ? "bg-emerald-200" : "bg-slate-200"
                }`}
              />
            )}
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <p className={`text-sm ${LABEL[item.estado]}`}>{item.etiqueta}</p>
            {!compact && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.descripcion}</p>
            )}
            {item.fecha && (
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date(item.fecha).toLocaleString(
                  "es-PE",
                  compact
                    ? { dateStyle: "medium" }
                    : { dateStyle: "medium", timeStyle: "short" }
                )}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
