"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { PuestoInclusivoCheckbox } from "@/components/ui/PuestoInclusivoCheckbox";
import { SectionHint } from "@/components/ui/SectionHint";
import { ESTADOS_CIVILES } from "@/types/catalogos";
import { GENEROS } from "@/types/postulacion";
import { validarPostulanteInput } from "@/lib/validacion-postulante";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!personal || !catalogos) return null;

  const tipoDocumento = catalogos.tiposDoc.find((t) => t.id === personal.tipoDocId);
  const docAbrev = tipoDocumento?.abrev ?? "Documento";
  const docConfig: Record<string, { maxLength: number; numeric: boolean }> = {
    DNI: { maxLength: 8, numeric: true },
    CE: { maxLength: 12, numeric: false },
    CPP: { maxLength: 9, numeric: true },
    RUC: { maxLength: 11, numeric: true },
    PAS: { maxLength: 12, numeric: false },
  };
  const currentDocConfig = docConfig[docAbrev] ?? {
    maxLength: 15,
    numeric: false,
  };
  const paisSeleccionado = catalogos.paises.find((p) => p.id === personal.paisId);
  const prefijoCelular = paisSeleccionado?.prefijoCelular ?? "";

  const onSave = async () => {
    const result = validarPostulanteInput({
      ...personal,
      tipoDocAbrev: docAbrev,
    });
    if (!result.ok) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});
    await savePersonal();
  };

  return (
    <div className="space-y-5">
      <SectionHint title="Datos personales">
        Identificación, contacto y dirección de residencia.
      </SectionHint>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Tipo de documento
          </label>
          <select
            value={personal.tipoDocId}
            onChange={(event) => {
              setPersonalField("tipoDocId", Number(event.target.value));
              setPersonalField("numeroDocumento", "");
            }}
            className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {catalogos.tiposDoc.map((t) => (
              <option key={t.id} value={t.id}>
                {t.abrev} — {t.nombreCompleto}
              </option>
            ))}
          </select>
          <FieldError error={fieldErrors.tipoDocId} />
        </div>
        <Input
          label={`${docAbrev}`}
          value={personal.numeroDocumento}
          maxLength={currentDocConfig.maxLength}
          inputMode={currentDocConfig.numeric ? "numeric" : "text"}
          onChange={(event) => {
            const raw = event.target.value.toUpperCase();
            setPersonalField(
              "numeroDocumento",
              currentDocConfig.numeric
                ? raw.replace(/\D/g, "")
                : raw.replace(/[^A-Z0-9]/g, "")
            );
          }}
          error={fieldErrors.numeroDocumento}
        />
      </div>

      <Input
        label="Nombres"
        value={personal.nombres}
        onChange={(e) => setPersonalField("nombres", e.target.value)}
        error={fieldErrors.nombres}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Apellido paterno"
          value={personal.apellidoPaterno}
          onChange={(e) => setPersonalField("apellidoPaterno", e.target.value)}
          error={fieldErrors.apellidoPaterno}
        />
        <Input
          label="Apellido materno"
          value={personal.apellidoMaterno}
          onChange={(e) => setPersonalField("apellidoMaterno", e.target.value)}
          error={fieldErrors.apellidoMaterno}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <DateInput
          label="Fecha de nacimiento"
          value={personal.fechaNacimiento}
          onChange={(fechaNacimiento) => setPersonalField("fechaNacimiento", fechaNacimiento)}
          error={fieldErrors.fechaNacimiento}
          max={new Date().toISOString().slice(0, 10)}
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">País</label>
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
          <FieldError error={fieldErrors.paisId} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Género</label>
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
          <FieldError error={fieldErrors.genero} />
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Celular</span>
          <span className="flex overflow-hidden rounded-xl border border-emerald-100 bg-white focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200">
            <span className="flex items-center border-r border-emerald-100 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800">
              {prefijoCelular}
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={personal.telefono}
              onChange={(e) =>
                setPersonalField("telefono", e.target.value.replace(/\D/g, ""))
              }
              placeholder="999 999 999"
              className="min-w-0 flex-1 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </span>
          <FieldError error={fieldErrors.telefono} />
        </label>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Estado civil</label>
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
          <FieldError error={fieldErrors.estadoCivil} />
        </div>
        <Input label="Correo" value={personal.correo} disabled />
      </div>

      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Busca tu dirección en el mapa: haz clic en tu ubicación y la dirección aparecerá
        automáticamente en el casillero.
      </p>
      <DireccionMapPicker
        direccionLiteral={personal.direccionLiteral}
        latitud={personal.latitud}
        longitud={personal.longitud}
        onDireccionChange={(v) => setPersonalField("direccionLiteral", v)}
        onCoordsChange={(lat, lng) => {
          setPersonalField("latitud", lat);
          setPersonalField("longitud", lng);
        }}
        error={fieldErrors.direccionLiteral}
      />

      <PuestoInclusivoCheckbox
        variant="postulante"
        checked={personal.tieneDiscapacidad}
        onChange={(checked) => setPersonalField("tieneDiscapacidad", checked)}
      />

      <Button onClick={onSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar datos personales"}
      </Button>
    </div>
  );
}
