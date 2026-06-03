"use client";

import { useEffect } from "react";

import { useModalMotion } from "@/hooks/useModalMotion";
import { Button } from "@/components/ui/Button";

type Props = {
  titulo: string;
  empresa: string;
  viewUrl: string;
  fileName?: string;
  onClose: () => void;
};

function formatoDesdeNombre(name?: string): "pdf" | "txt" | "otro" {
  if (!name) return "pdf";
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "txt") return "txt";
  return "otro";
}

export function BasesConvocatoriaModal({
  titulo,
  empresa,
  viewUrl,
  fileName,
  onClose,
}: Props) {
  const formato = formatoDesdeNombre(fileName ?? viewUrl);
  const { show, requestClose, backdropClass, panelClass } = useModalMotion(true, onClose);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, requestClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm ${backdropClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Bases de la convocatoria — ${titulo}`}
      onClick={requestClose}
    >
      <div
        className={`flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white shadow-xl overflow-hidden ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 sm:px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-emerald-600">
              Bases de la convocatoria
            </p>
            <h2 className="text-lg font-bold text-slate-900 truncate">{titulo}</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate">{empresa}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={viewUrl} target="_blank" rel="noopener noreferrer" download={fileName}>
              <Button variant="secondary" className="text-xs py-2 px-3">
                Descargar
              </Button>
            </a>
            <button
              type="button"
              onClick={requestClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[60vh] bg-slate-100">
          {formato === "pdf" ? (
            <iframe
              src={viewUrl}
              title={`Bases — ${titulo}`}
              className="w-full h-full min-h-[60vh] border-0"
            />
          ) : formato === "txt" ? (
            <iframe
              src={viewUrl}
              title={`Bases — ${titulo}`}
              className="w-full h-full min-h-[60vh] border-0 bg-white"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[40vh] text-center">
              <p className="text-slate-600">
                Este formato no se puede previsualizar en el navegador.
              </p>
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" download={fileName}>
                <Button>Abrir documento</Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
