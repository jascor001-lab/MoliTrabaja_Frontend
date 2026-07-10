"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Input } from "@/components/ui/Input";
import { PdfFileInput } from "@/components/ui/PdfFileInput";
import { formatIsoDateDisplay } from "@/lib/date-format";
import { SectionHint } from "@/components/ui/SectionHint";
import { SECTORES_LABORALES } from "@/types/catalogos";
import { usePerfilPostulanteStore } from "@/stores/perfilPostulanteStore";

export function PerfilSectionExperiencia() {
  const experiencias = usePerfilPostulanteStore((s) => s.experiencias);
  const saving = usePerfilPostulanteStore((s) => s.saving);
  const addExperiencia = usePerfilPostulanteStore((s) => s.addExperiencia);
  const removeExperiencia = usePerfilPostulanteStore((s) => s.removeExperiencia);

  const [form, setForm] = useState({
    sector: "Tecnología" as string,
    empresa: "",
    puesto: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [documento, setDocumento] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento) {
      setDocError("Adjunta un PDF que respalde esta experiencia laboral.");
      return;
    }
    setDocError(null);
    const ok = await addExperiencia(
      {
        ...form,
        fechaFin: form.fechaFin || undefined,
      },
      documento
    );
    if (ok) {
      setForm({
        sector: "Tecnología",
        empresa: "",
        puesto: "",
        fechaInicio: "",
        fechaFin: "",
      });
      setDocumento(null);
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <SectionHint title="ExpLaboral">
          Historial laboral con PDF de respaldo (carta de trabajo, certificado, etc.).
        </SectionHint>
        {!showForm && (
          <Button type="button" onClick={() => setShowForm(true)}>
            + Añadir experiencia
          </Button>
        )}
      </div>

      <ul className="space-y-3">
        {experiencias.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex justify-between gap-3"
          >
            <div>
              <p className="font-bold text-slate-900">{item.puesto}</p>
              <p className="text-sm text-slate-600">
                {item.empresa} · {item.sector}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatIsoDateDisplay(item.fechaInicio)}
                {item.fechaFin ? ` → ${formatIsoDateDisplay(item.fechaFin)}` : " · Actual"}
                {item.tiempoMeses > 0 && ` · ${item.tiempoMeses} meses`}
                {item.documentoDisponible && " · PDF adjunto"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeExperiencia(item.id)}
              className="text-sm text-red-600 font-semibold hover:underline shrink-0"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {showForm && (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-emerald-200 p-4"
        >
          <h3 className="font-bold text-slate-900">Nueva experiencia</h3>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Sector *</label>
            <select
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="w-full rounded-xl border border-emerald-100 px-4 py-3"
            >
              {SECTORES_LABORALES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Empresa *"
            value={form.empresa}
            onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            required
          />
          <Input
            label="Puesto *"
            value={form.puesto}
            onChange={(e) => setForm({ ...form, puesto: e.target.value })}
            required
          />
          <PdfFileInput
            label="Documento de respaldo (PDF)"
            hint="Carta de trabajo, certificado laboral u otro documento que acredite la experiencia."
            required
            value={documento}
            onChange={setDocumento}
            error={docError ?? undefined}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <DateInput
              label="Inicio *"
              value={form.fechaInicio}
              onChange={(fechaInicio) => setForm({ ...form, fechaInicio })}
              required
            />
            <DateInput
              label="Fin (opcional)"
              value={form.fechaFin}
              onChange={(fechaFin) => setForm({ ...form, fechaFin })}
            />
          </div>
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
