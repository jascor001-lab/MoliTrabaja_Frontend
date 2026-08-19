"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { SlideView } from "@/components/ui/SlideView";
import { MOTION_REDUCE } from "@/lib/motion";
import {
  usePerfilPostulanteStore,
  type PerfilSection,
} from "@/stores/perfilPostulanteStore";

import { PerfilSectionConocimientos } from "./PerfilSectionConocimientos";
import { PerfilSectionCurriculum } from "./PerfilSectionCurriculum";
import { PerfilSectionEducacion } from "./PerfilSectionEducacion";
import { PerfilSectionExperiencia } from "./PerfilSectionExperiencia";
import { PerfilSectionPersonal } from "./PerfilSectionPersonal";

const TABS: { id: PerfilSection; label: string }[] = [
  { id: "personal", label: "Datos personales" },
  { id: "curriculum", label: "Curriculum" },
  { id: "educacion", label: "Formación académica" },
  { id: "experiencia", label: "Experiencia laboral" },
  { id: "conocimientos", label: "Conocimientos" },
];

const SECCIONES_VALIDAS = new Set<PerfilSection>(TABS.map((t) => t.id));

function PerfilPostulantePanelInner() {
  const searchParams = useSearchParams();
  const loading = usePerfilPostulanteStore((s) => s.loading);
  const error = usePerfilPostulanteStore((s) => s.error);
  const message = usePerfilPostulanteStore((s) => s.message);
  const section = usePerfilPostulanteStore((s) => s.section);
  const sectionDirection = usePerfilPostulanteStore((s) => s.sectionDirection);
  const setSection = usePerfilPostulanteStore((s) => s.setSection);
  const loadAll = usePerfilPostulanteStore((s) => s.loadAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const seccion = searchParams.get("seccion");
    if (seccion && SECCIONES_VALIDAS.has(seccion as PerfilSection)) {
      setSection(seccion as PerfilSection);
    }
  }, [searchParams, setSection]);

  if (loading) {
    return <p className="text-sm text-slate-400 px-1">Cargando tu perfil…</p>;
  }

  if (error && !usePerfilPostulanteStore.getState().personal) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <nav className="flex flex-wrap gap-2" aria-label="Secciones del perfil">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSection(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition-all duration-300 ease-fluid ${
              section === tab.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-slate-600 border-emerald-200 hover:border-emerald-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {message && (
        <p
          className={`text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 motion-enter-fade motion-gpu ${MOTION_REDUCE}`}
        >
          {message}
        </p>
      )}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <div className="rounded-2xl border border-emerald-100 bg-white p-5 md:p-6 shadow-sm overflow-hidden">
        <SlideView viewKey={section} direction={sectionDirection}>
          {section === "personal" && <PerfilSectionPersonal />}
          {section === "curriculum" && <PerfilSectionCurriculum />}
          {section === "educacion" && <PerfilSectionEducacion />}
          {section === "experiencia" && <PerfilSectionExperiencia />}
          {section === "conocimientos" && <PerfilSectionConocimientos />}
        </SlideView>
      </div>
    </div>
  );
}

export function PerfilPostulantePanel() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400 px-1">Cargando tu perfil…</p>}>
      <PerfilPostulantePanelInner />
    </Suspense>
  );
}
