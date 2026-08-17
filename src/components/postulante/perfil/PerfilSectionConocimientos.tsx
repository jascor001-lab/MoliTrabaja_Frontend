"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { InstitutionCombobox } from "@/components/ui/InstitutionCombobox";
import { KnowledgeCombobox } from "@/components/ui/KnowledgeCombobox";
import { SectionHint } from "@/components/ui/SectionHint";
import { usePerfilPostulanteStore } from "@/stores/perfilPostulanteStore";

export function PerfilSectionConocimientos() {
  const conocimientos = usePerfilPostulanteStore((s) => s.conocimientos);
  const catalogos = usePerfilPostulanteStore((s) => s.catalogos);
  const saving = usePerfilPostulanteStore((s) => s.saving);
  const addConocimiento = usePerfilPostulanteStore((s) => s.addConocimiento);
  const removeConocimiento = usePerfilPostulanteStore((s) => s.removeConocimiento);

  const [conocimientoId, setConocimientoId] = useState("");
  const [conocimientoNombre, setConocimientoNombre] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conocimientoId && conocimientoNombre.trim().length < 2) {
      setKnowledgeError("Selecciona un conocimiento o escribe uno nuevo.");
      return;
    }
    setKnowledgeError(null);
    const ok = await addConocimiento(
      {
        conocimientoId: conocimientoId ? Number(conocimientoId) : undefined,
        conocimientoNombre: conocimientoNombre.trim(),
        institucion,
      },
      null
    );
    if (ok) {
      setConocimientoId("");
      setConocimientoNombre("");
      setInstitucion("");
      setShowForm(false);
    }
  };

  if (!catalogos) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <SectionHint title="Conocimientos">
          Indica habilidades que mejoran tu porcentaje de encaje con las ofertas. La
          empresa revisa el detalle en tu CV al postular.
        </SectionHint>
        {!showForm && (
          <Button type="button" onClick={() => setShowForm(true)}>
            + Añadir conocimiento
          </Button>
        )}
      </div>

      {conocimientos.length === 0 && !showForm && (
        <p className="text-sm text-slate-500 rounded-xl border border-dashed border-slate-200 p-6 text-center">
          Aún no has registrado conocimientos.
        </p>
      )}

      <ul className="flex flex-wrap gap-2">
        {conocimientos.map((c) => (
          <li
            key={c.id}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900 px-3 py-1.5 text-sm font-medium"
          >
            <span>
              {c.conocimientoNombre}
              <span className="text-emerald-700/80 text-xs ml-1">({c.grupo})</span>
            </span>
            <button
              type="button"
              onClick={() => removeConocimiento(c.id)}
              className="text-emerald-800 hover:text-red-600"
              aria-label="Quitar"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {showForm && (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-emerald-200 p-4">
          <h3 className="font-bold text-slate-900">Nuevo conocimiento</h3>
          <KnowledgeCombobox
            knowledge={catalogos.conocimientos}
            value={conocimientoId}
            customValue={conocimientoNombre}
            onChange={(id, nombre) => {
              setConocimientoId(id);
              setConocimientoNombre(nombre);
            }}
            error={knowledgeError ?? undefined}
          />
          <InstitutionCombobox
            institutions={catalogos.instituciones}
            value={institucion}
            onChange={setInstitucion}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              Guardar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
