"use client";

import dynamic from "next/dynamic";

import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Input } from "@/components/ui/Input";
import { SectionHint } from "@/components/ui/SectionHint";
import { ESTADOS_CIVILES } from "@/types/catalogos";
import { GENEROS } from "@/types/postulacion";
import { usePerfilPostulanteStore } from "@/stores/perfilPostulanteStore";

const DireccionMapPicker = dynamic(
  () =>
    import("@/components/map/DireccionMapPicker").then((m) => m.DireccionMapPicker),
  { ssr: false, loading: () => <p className="text-sm text-slate-400">Cargando mapa…</p> }
);

export function PerfilSectionPersonal() {
  const personal = usePerfilPostulanteStore((s) => s.personal);
  const catalogos = usePerfilPostulanteStore((s) => s.catalogos);
  const saving = usePerfilPostulanteStore((s) => s.saving);
  const setPersonalField = usePerfilPostulanteStore((s) => s.setPersonalField);
  const savePersonal = usePerfilPostulanteStore((s) => s.savePersonal);

  if (!personal || !catalogos) return null;

  const docLabel =
    catalogos.tiposDoc.find((t) => t.id === personal.tipoDocId)?.nombreCompleto ??
    "Documento";

  return (
    <div className="space-y-5">
      <SectionHint title="Datos personales">
        Identificación, contacto y dirección de residencia.
      </SectionHint>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Tipo de documento</label>
          <select
            value={personal.tipoDocId}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"
          >
            {catalogos.tiposDoc.map((t) => (
              <option key={t.id} value={t.id}>
                {t.abrev} — {t.nombreCompleto}
              </option>
            ))}
          </select>
        </div>
        <Input label={docLabel} value={personal.numeroDocumento} disabled />
      </div>

      <Input
        label="Nombres *"
        value={personal.nombres}
        onChange={(e) => setPersonalField("nombres", e.target.value)}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Apellido paterno *"
          value={personal.apellidoPaterno}
          onChange={(e) => setPersonalField("apellidoPaterno", e.target.value)}
        />
        <Input
          label="Apellido materno *"
          value={personal.apellidoMaterno}
          onChange={(e) => setPersonalField("apellidoMaterno", e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <DateInput
          label="Fecha de nacimiento *"
          value={personal.fechaNacimiento}
          onChange={(fechaNacimiento) => setPersonalField("fechaNacimiento", fechaNacimiento)}
          required
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">País *</label>
          <select
            value={personal.paisId}
            onChange={(e) => setPersonalField("paisId", Number(e.target.value))}
            className="w-full rounded-xl border border-emerald-100 px-4 py-3"
          >
            {catalogos.paises.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.prefijoCelular})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Género *</label>
          <select
            value={personal.genero}
            onChange={(e) =>
              setPersonalField("genero", e.target.value as typeof personal.genero)
            }
            className="w-full rounded-xl border border-emerald-100 px-4 py-3"
          >
            {GENEROS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Estado civil *</label>
          <select
            value={personal.estadoCivil}
            onChange={(e) => setPersonalField("estadoCivil", e.target.value)}
            className="w-full rounded-xl border border-emerald-100 px-4 py-3"
          >
            {ESTADOS_CIVILES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input label="Correo" value={personal.correo} disabled />
      <Input
        label="Celular *"
        value={personal.telefono}
        onChange={(e) => setPersonalField("telefono", e.target.value)}
      />

      <SectionHint title="Dirección">
        Ubicación de residencia del postulante.
      </SectionHint>
      <DireccionMapPicker
        direccionLiteral={personal.direccionLiteral}
        latitud={personal.latitud}
        longitud={personal.longitud}
        onDireccionChange={(v) => setPersonalField("direccionLiteral", v)}
        onCoordsChange={(lat, lng) => {
          setPersonalField("latitud", lat);
          setPersonalField("longitud", lng);
        }}
      />

      <Button onClick={savePersonal} disabled={saving}>
        {saving ? "Guardando…" : "Guardar datos personales"}
      </Button>
    </div>
  );
}
