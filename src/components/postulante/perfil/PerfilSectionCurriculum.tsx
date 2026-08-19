"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { SectionHint } from "@/components/ui/SectionHint";
import { perfilCvViewUrl } from "@/lib/cv-urls";
import { usePerfilPostulanteStore } from "@/stores/perfilPostulanteStore";

export function PerfilSectionCurriculum() {
  const cvDisponible = usePerfilPostulanteStore((s) => s.cvDisponible);
  const cvFilename = usePerfilPostulanteStore((s) => s.cvFilename);
  const saving = usePerfilPostulanteStore((s) => s.saving);
  const uploadCv = usePerfilPostulanteStore((s) => s.uploadCv);

  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setLocalError("Selecciona un archivo PDF, Word o TXT.");
      return;
    }
    setLocalError(null);
    const ok = await uploadCv(file);
    if (ok) setFile(null);
  };

  return (
    <div className="space-y-5">
      <SectionHint title="Curriculum vitae">
        Aquí puedes subir y actualizar tu CV cuantas veces quieras. Al postular a una
        vacante se envía automáticamente el CV de tu perfil (una sola vez por oferta);
        la empresa verá esa versión enviada.
      </SectionHint>

      {cvDisponible ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900">CV en tu perfil</p>
            <p className="text-sm text-slate-600 mt-0.5 truncate max-w-md">
              {cvFilename ?? "curriculum.pdf"}
            </p>
          </div>
          <a
            href={perfilCvViewUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            Ver / descargar
          </a>
        </div>
      ) : (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          Aún no tienes un CV en tu perfil. Súbelo para poder postular más rápido y
          que las empresas lo revisen.
        </p>
      )}

      <form
        onSubmit={submit}
        className="space-y-4 rounded-xl border border-emerald-200 bg-white p-4"
      >
        <h3 className="font-bold text-slate-900">
          {cvDisponible ? "Reemplazar CV" : "Subir CV"}
        </h3>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            Archivo (PDF / Word / TXT)
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setLocalError(null);
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
          />
          {file && (
            <p className="text-xs text-emerald-700">Seleccionado: {file.name}</p>
          )}
          <p className="text-xs text-slate-500">
            Máximo 10 MB. Al postular, la empresa abrirá este archivo en un visor.
          </p>
          {localError && <p className="text-xs text-red-600">{localError}</p>}
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : cvDisponible ? "Actualizar CV" : "Guardar CV"}
        </Button>
      </form>
    </div>
  );
}
