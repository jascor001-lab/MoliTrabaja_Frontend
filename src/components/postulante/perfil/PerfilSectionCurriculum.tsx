"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { SectionHint } from "@/components/ui/SectionHint";
import { perfilCvViewUrl } from "@/lib/cv-urls";
import { usePerfilPostulanteStore } from "@/stores/perfilPostulanteStore";

export function PerfilSectionCurriculum() {
  const cvDisponible = usePerfilPostulanteStore((s) => s.cvDisponible);
  const cvFilename = usePerfilPostulanteStore((s) => s.cvFilename);
  const cvAnalisis = usePerfilPostulanteStore((s) => s.cvAnalisis);
  const saving = usePerfilPostulanteStore((s) => s.saving);
  const uploadCv = usePerfilPostulanteStore((s) => s.uploadCv);

  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setLocalError("Selecciona un archivo PDF.");
      return;
    }
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && file.type !== "application/pdf") {
      setLocalError("El CV debe ser un documento PDF.");
      return;
    }
    setLocalError(null);
    const ok = await uploadCv(file);
    if (ok) setFile(null);
  };

  return (
    <div className="space-y-5">
      <SectionHint title="Curriculum vitae">
        Sube tu CV en PDF. Lo analizamos automáticamente (skills, experiencia y
        educación) para calcular el porcentaje de encaje con cada oferta.
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
          Aún no tienes un CV en tu perfil. Súbelo en PDF para mejorar tu encaje y
          poder postular.
        </p>
      )}

      {cvAnalisis && (
        <div className="rounded-xl border border-emerald-100 bg-white p-4 space-y-3">
          <p className="text-sm font-bold text-slate-900">Análisis del PDF</p>
          {cvAnalisis.aviso ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {cvAnalisis.aviso}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Estos datos alimentan el % de encaje junto con tus carreras y
              conocimientos del perfil.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Experiencia detectada
              </p>
              <p className="text-sm font-semibold text-emerald-800 mt-1">
                {cvAnalisis.experience_years > 0
                  ? `${cvAnalisis.experience_years} año${cvAnalisis.experience_years !== 1 ? "s" : ""}`
                  : "No detectada en el texto"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Educación
              </p>
              <p className="text-sm text-slate-700 mt-1">
                {cvAnalisis.education.length > 0
                  ? cvAnalisis.education.join(" · ")
                  : "No detectada"}
              </p>
            </div>
          </div>
          {cvAnalisis.skills.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Skills detectadas ({cvAnalisis.skills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cvAnalisis.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
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
            Archivo PDF (obligatorio)
          </span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              setFile(next);
              if (
                next &&
                !next.name.toLowerCase().endsWith(".pdf") &&
                next.type !== "application/pdf"
              ) {
                setLocalError("El CV debe ser un documento PDF.");
                setFile(null);
                e.target.value = "";
                return;
              }
              setLocalError(null);
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
          />
          {file && (
            <p className="text-xs text-emerald-700">Seleccionado: {file.name}</p>
          )}
          <p className="text-xs text-slate-500">
            Solo PDF. Máximo 10 MB. Al guardar se analiza el texto para el porcentaje
            de encaje.
          </p>
          {localError && <p className="text-xs text-red-600">{localError}</p>}
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Analizando PDF…" : cvDisponible ? "Actualizar CV" : "Guardar CV"}
        </Button>
      </form>
    </div>
  );
}
