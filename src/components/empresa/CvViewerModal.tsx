"use client";

import { useEffect, useState } from "react";

import { useModalMotion } from "@/hooks/useModalMotion";
import { Button } from "@/components/ui/Button";
import type { CvFormato } from "@/types/postulacion";

type Props = {
  candidateName: string;
  viewUrl: string;
  fileName?: string;
  formato?: CvFormato;
  onClose: () => void;
};

export function CvViewerModal({
  candidateName,
  viewUrl,
  fileName,
  formato = "pdf",
  onClose,
}: Props) {
  const [txtContent, setTxtContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { show, requestClose, backdropClass, panelClass } = useModalMotion(true, onClose);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, requestClose]);

  useEffect(() => {
    setTxtContent(null);
    setLoadError(null);
    if (formato !== "txt") return;

    fetch(viewUrl)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el archivo");
        return res.text();
      })
      .then(setTxtContent)
      .catch(() => setLoadError("No se pudo mostrar el CV en texto."));
  }, [viewUrl, formato]);

  const canPreviewInline = formato === "pdf" || formato === "txt";

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm ${backdropClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={`CV de ${candidateName}`}
      onClick={requestClose}
    >
      <div
        className={`flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white shadow-xl overflow-hidden ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-100 px-4 sm:px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-emerald-600">Curriculum</p>
            <h2 className="text-lg font-bold text-slate-900 truncate">{candidateName}</h2>
            {fileName && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{fileName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={viewUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Descargar
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

        <div className="flex-1 min-h-0 bg-slate-100 overflow-hidden">
          {formato === "pdf" && (
            <iframe
              title={`CV de ${candidateName}`}
              src={viewUrl}
              className="w-full h-[min(75vh,720px)] bg-white animate-fade-in motion-reduce:animate-none"
            />
          )}

          {formato === "txt" && (
            <div className="h-[min(75vh,720px)] overflow-auto p-4 sm:p-6">
              {loadError && (
                <p className="text-sm text-red-600 text-center py-8">{loadError}</p>
              )}
              {!loadError && txtContent === null && (
                <p className="text-sm text-slate-500 text-center py-8">Cargando CV…</p>
              )}
              {txtContent !== null && (
                <pre className="text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl border border-slate-200 p-4">
                  {txtContent}
                </pre>
              )}
            </div>
          )}

          {!canPreviewInline && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[280px]">
              <p className="text-slate-700 max-w-md">
                Descarga el CV para revisarlo antes de aceptar o rechazar.
              </p>
              <a href={viewUrl} download={fileName}>
                <Button>Descargar CV</Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
