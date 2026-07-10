"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PdfFileInput } from "@/components/ui/PdfFileInput";
import { SectionHint } from "@/components/ui/SectionHint";
import { usePerfilPostulanteStore } from "@/stores/perfilPostulanteStore";

export function PerfilSectionConocimientos() {
  const conocimientos = usePerfilPostulanteStore((s) => s.conocimientos);
  const catalogos = usePerfilPostulanteStore((s) => s.catalogos);
  const saving = usePerfilPostulanteStore((s) => s.saving);
  const addConocimiento = usePerfilPostulanteStore((s) => s.addConocimiento);
  const removeConocimiento = usePerfilPostulanteStore((s) => s.removeConocimiento);

  const [conocimientoId, setConocimientoId] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [documento, setDocumento] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento) {
      setDocError("Adjunta un PDF que certifique este conocimiento.");
      return;
    }
    setDocError(null);
    const ok = await addConocimiento(
      {
        conocimientoId: Number(conocimientoId),
        institucion,
      },
      documento
    );
    if (ok) {
      setConocimientoId("");
      setInstitucion("");
      setDocumento(null);
      setShowForm(false);
    }
  };

  if (!catalogos) return null;

  const porGrupo = catalogos.conocimientos.reduce<Record<string, typeof catalogos.conocimientos>>(
    (acc, k) => {
      if (!acc[k.grupo]) acc[k.grupo] = [];
      acc[k.grupo].push(k);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <SectionHint title="ConocimientoPostulante">
          Habilidades del catálogo. Adjunta un PDF que certifique cada conocimiento.
        </SectionHint>
        {!showForm && (
          <Button type="button" onClick={() => setShowForm(true)}>
            + Añadir conocimiento
          </Button>
        )}
      </div>

      <ul className="flex flex-wrap gap-2">
        {conocimientos.map((c) => (
          <li
            key={c.id}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900 px-3 py-1.5 text-sm font-medium"
          >
            <span>
              {c.conocimientoNombre}
              <span className="text-emerald-700/80 text-xs ml-1">({c.grupo})</span>
              {c.documentoDisponible && (
                <span className="text-emerald-700/80 text-xs ml-1">· PDF</span>
              )}
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
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Conocimiento *</label>
            <select
              required
              value={conocimientoId}
              onChange={(e) => setConocimientoId(e.target.value)}
              className="w-full rounded-xl border border-emerald-100 px-4 py-3"
            >
              <option value="">Selecciona…</option>
              {Object.entries(porGrupo).map(([grupo, items]) => (
                <optgroup key={grupo} label={grupo}>
                  {items.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <Input
            label="Institución (opcional)"
            value={institucion}
            onChange={(e) => setInstitucion(e.target.value)}
            placeholder="Ej. instituto o certificadora"
          />
          <PdfFileInput
            label="Certificado o constancia (PDF)"
            hint="Adjunta el documento que certifique este conocimiento o habilidad."
            required
            value={documento}
            onChange={setDocumento}
            error={docError ?? undefined}
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
