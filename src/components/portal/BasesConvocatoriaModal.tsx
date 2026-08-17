"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const { show, closing, requestClose, backdropClass, panelClass } = useModalMotion(
    true,
    onClose
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, requestClose]);

  // Al cerrar: vaciar el iframe de inmediato para que no quede sombra del PDF.
  useEffect(() => {
    if (!closing) return;
    const iframe = document.getElementById(
      "bases-convocatoria-iframe"
    ) as HTMLIFrameElement | null;
    if (iframe) {
      iframe.src = "about:blank";
    }
  }, [closing]);

  if (!show || !mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm ${backdropClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Bases de la convocatoria — ${titulo}`}
      onClick={requestClose}
    >
      <div
        className={`flex flex-col w-full sm:max-w-5xl h-[92dvh] max-h-[92dvh] sm:h-[min(88dvh,900px)] rounded-t-2xl sm:rounded-2xl bg-white shadow-xl overflow-hidden ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 sm:px-6 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase text-emerald-600">
              Bases de la convocatoria
            </p>
            <h2 className="text-lg font-bold text-slate-900 truncate">{titulo}</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate">{empresa}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!closing && (
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" download={fileName}>
                <Button variant="secondary" className="text-xs py-2 px-3">
                  Descargar
                </Button>
              </a>
            )}
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

        <div className="relative flex-1 min-h-0 overflow-hidden bg-slate-100">
          {closing ? (
            <div className="flex h-full items-center justify-center bg-white" aria-hidden />
          ) : formato === "pdf" || formato === "txt" ? (
            <iframe
              id="bases-convocatoria-iframe"
              key={viewUrl}
              src={viewUrl}
              title={`Bases — ${titulo}`}
              className="absolute inset-0 h-full w-full border-0 bg-white"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
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
    </div>,
    document.body
  );
}
