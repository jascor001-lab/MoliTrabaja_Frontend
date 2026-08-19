"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { CareerCombobox } from "@/components/ui/CareerCombobox";
import { DateInput } from "@/components/ui/DateInput";
import { InstitutionCombobox } from "@/components/ui/InstitutionCombobox";
import { formatIsoDateDisplay } from "@/lib/date-format";
import { SectionHint } from "@/components/ui/SectionHint";
import { SlideView } from "@/components/ui/SlideView";
import { ORDENES_MERITO, TIPOS_ESTUDIO } from "@/types/catalogos";
import type { EducacionDTO } from "@/types/catalogos";
import { usePerfilPostulanteStore } from "@/stores/perfilPostulanteStore";

const emptyForm = (): {
  carreraId: string;
  tipoEstudio: string;
  institucion: string;
  ordenMerito: string;
  fechaIngreso: string;
  fechaEgreso: string;
} => ({
  carreraId: "",
  tipoEstudio: "Universitario",
  institucion: "",
  ordenMerito: "No aplica",
  fechaIngreso: "",
  fechaEgreso: "",
});

export function PerfilSectionEducacion() {
  const educaciones = usePerfilPostulanteStore((s) => s.educaciones);
  const catalogos = usePerfilPostulanteStore((s) => s.catalogos);
  const saving = usePerfilPostulanteStore((s) => s.saving);
  const formOpen = usePerfilPostulanteStore((s) => s.educacionFormOpen);
  const editingId = usePerfilPostulanteStore((s) => s.editingEducacionId);
  const setEducacionFormOpen = usePerfilPostulanteStore((s) => s.setEducacionFormOpen);
  const addEducacion = usePerfilPostulanteStore((s) => s.addEducacion);
  const updateEducacion = usePerfilPostulanteStore((s) => s.updateEducacion);
  const removeEducacion = usePerfilPostulanteStore((s) => s.removeEducacion);

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const editing = educaciones.find((e) => e.id === editingId);

  useEffect(() => {
    if (editing && formOpen) {
      setForm({
        carreraId: String(editing.carreraId),
        tipoEstudio: editing.tipoEstudio,
        institucion: editing.institucion,
        ordenMerito: editing.ordenMerito,
        fechaIngreso: editing.fechaIngreso,
        fechaEgreso: editing.fechaEgreso ?? "",
      });
    } else if (formOpen && !editingId) {
      setForm(emptyForm());
    }
  }, [editing, formOpen, editingId]);

  const openNew = () => {
    setFormErrors({});
    setEducacionFormOpen(true, null);
  };

  const openEdit = (item: EducacionDTO) => {
    setFormErrors({});
    setEducacionFormOpen(true, item.id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.carreraId) errors.carreraId = "Selecciona una carrera.";
    if (!form.institucion.trim()) errors.institucion = "Ingresa la institución.";
    if (!form.fechaIngreso) errors.fechaIngreso = "Ingresa la fecha de ingreso.";
    if (form.fechaEgreso && form.fechaIngreso && form.fechaEgreso < form.fechaIngreso) {
      errors.fechaEgreso = "La fecha de egreso no puede ser anterior al ingreso.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const payload = {
      carreraId: Number(form.carreraId),
      tipoEstudio: form.tipoEstudio,
      institucion: form.institucion,
      ordenMerito: form.ordenMerito,
      fechaIngreso: form.fechaIngreso,
      fechaEgreso: form.fechaEgreso || undefined,
    };

    const ok = editingId
      ? await updateEducacion(editingId, payload, null)
      : await addEducacion(payload, null);
    if (ok) {
      setForm(emptyForm());
    }
  };

  if (!catalogos) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHint title="Formación académica">
          Registra tus estudios para el porcentaje de encaje con las vacantes. El
          documento que ve la empresa al postular es tu CV.
        </SectionHint>
        {!formOpen && (
          <Button type="button" onClick={openNew}>
            + Añadir formación
          </Button>
        )}
      </div>

      {educaciones.length === 0 && !formOpen && (
        <p className="text-sm text-slate-500 rounded-xl border border-dashed border-slate-200 p-6 text-center">
          Aún no has registrado formación académica. Añade tu primera carrera o
          especialidad.
        </p>
      )}

      <ul className="space-y-3">
        {educaciones.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900">{item.carreraNombre}</p>
                <p className="text-sm text-slate-600">
                  {item.tipoEstudio} · {item.institucion}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatIsoDateDisplay(item.fechaIngreso)}
                  {item.fechaEgreso
                    ? ` → ${formatIsoDateDisplay(item.fechaEgreso)}`
                    : " · En curso"}
                  {item.ordenMerito !== "No aplica" && ` · ${item.ordenMerito} puesto`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => removeEducacion(item.id)}
                  disabled={saving}
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <SlideView
        viewKey={formOpen ? editingId ?? "nuevo" : "cerrado"}
        direction="forward"
      >
        {formOpen && (
          <form
            onSubmit={submit}
            noValidate
            className="space-y-4 rounded-xl border border-emerald-200 bg-white p-4"
          >
            <h3 className="font-bold text-slate-900">
              {editingId ? "Editar formación" : "Nueva formación académica"}
            </h3>

            <CareerCombobox
              careers={catalogos.carreras}
              value={form.carreraId}
              onChange={(carreraId) => setForm({ ...form, carreraId })}
              error={formErrors.carreraId}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tipo de estudio</label>
              <select
                value={form.tipoEstudio}
                onChange={(e) => setForm({ ...form, tipoEstudio: e.target.value })}
                className="w-full rounded-xl border border-emerald-100 px-4 py-3"
              >
                {TIPOS_ESTUDIO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <InstitutionCombobox
              institutions={catalogos.instituciones}
              value={form.institucion}
              onChange={(institucion) => setForm({ ...form, institucion })}
              error={formErrors.institucion}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Orden de mérito</label>
              <select
                value={form.ordenMerito}
                onChange={(e) => setForm({ ...form, ordenMerito: e.target.value })}
                className="w-full rounded-xl border border-emerald-100 px-4 py-3"
              >
                {ORDENES_MERITO.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <DateInput
                label="Fecha de ingreso"
                value={form.fechaIngreso}
                onChange={(fechaIngreso) => setForm({ ...form, fechaIngreso })}
                error={formErrors.fechaIngreso}
              />
              <DateInput
                label="Fecha de egreso (opcional)"
                value={form.fechaEgreso}
                onChange={(fechaEgreso) => setForm({ ...form, fechaEgreso })}
                error={formErrors.fechaEgreso}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : editingId ? "Actualizar" : "Guardar formación"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEducacionFormOpen(false, null)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </SlideView>
    </div>
  );
}
