"use client";

import { useEffect, useState } from "react";

import { DateInput } from "@/components/ui/DateInput";
import { FileUpload } from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { SectionHint } from "@/components/ui/SectionHint";
import { resolveLogoSrc } from "@/lib/logo-oferta";
import { useOfertaFormStore } from "@/stores/ofertaFormStore";

type Props = {
  embedded?: boolean;
};

function LogoPortada({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mx-auto w-full max-w-[220px]">
      <div className="aspect-square overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white shadow-inner">
        <img
          src={resolveLogoSrc(src)}
          alt={alt}
          className="h-full w-full object-contain object-center p-3"
        />
      </div>
    </div>
  );
}

export function WizardStepEmpresa({ embedded = false }: Props) {
  const {
    cronogramas,
    existingBases,
    existingLogos,
    basesFile,
    logoFiles,
    setField,
    setBasesFile,
    fieldErrors,
  } = useOfertaFormStore();

  const logoFile = logoFiles[0] ?? null;
  const logoActual = existingLogos.filter((l) => l.path).at(-1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!logoFile || !logoFile.type.startsWith("image/")) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const conv = cronogramas[0] ?? {
    etapa: "Convocatoria",
    inicio: "",
    fin: "",
    responsable: "",
    urlConsulta: "",
  };

  const updateCronograma = (patch: Partial<typeof conv>) => {
    const next = [{ ...conv, ...patch }, ...cronogramas.slice(1)];
    setField("cronogramas", next);
  };

  const portadaSrc = logoPreview ?? logoActual?.path ?? null;

  return (
    <div className="space-y-6">
      {!embedded && (
        <header>
          <h2 className="text-xl font-bold text-slate-900">Convocatoria y bases</h2>
          <p className="text-sm text-slate-500 mt-1">
            Logo, cronograma y documento oficial de la convocatoria.
          </p>
        </header>
      )}

      <SectionHint title="Portada / logo de la empresa">
        Imagen que verán los postulantes. Queda encuadrada; no se estira.
      </SectionHint>

      {portadaSrc ? (
        <LogoPortada src={portadaSrc} alt="Portada de la convocatoria" />
      ) : (
        <div className="mx-auto w-full max-w-[220px]">
          <div className="aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 flex items-center justify-center text-sm text-slate-400">
            Sin portada
          </div>
        </div>
      )}

      <FileUpload
        label="Logo de la empresa (obligatorio)"
        hint="PNG, JPG o WEBP. Máx. 10 MB."
        maxFiles={1}
        multiple={false}
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        files={logoFile ? [logoFile] : []}
        error={fieldErrors.logo}
        onAdd={(files) => setField("logoFiles", files[0] ? [files[0]] : [])}
        onRemove={() => setField("logoFiles", [])}
      />

    

      <div className="grid sm:grid-cols-2 gap-4">
        <DateInput
          label="Inicio convocatoria"
          value={conv.inicio}
          onChange={(inicio) => updateCronograma({ inicio })}
          error={fieldErrors.inicio}
          min="2000-01-01"
          max="2100-12-31"
        />
        <DateInput
          label="Fin convocatoria (opcional)"
          value={conv.fin ?? ""}
          onChange={(fin) => updateCronograma({ fin })}
          error={fieldErrors.fin}
          min="2000-01-01"
          max="2100-12-31"
        />
      </div>

      <Input
        label="Responsable"
        placeholder="Nombre del responsable del proceso"
        value={conv.responsable ?? ""}
        onChange={(e) => updateCronograma({ responsable: e.target.value })}
      />

      <Input
        label="URL de consulta (opcional)"
        placeholder="https://..."
        value={conv.urlConsulta ?? ""}
        onChange={(e) => updateCronograma({ urlConsulta: e.target.value })}
      />

     

      {existingBases && !basesFile && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
          <p className="text-sm font-medium text-slate-700">Bases actuales</p>
          <p className="text-sm text-slate-600 truncate">{existingBases.name}</p>
        </div>
      )}

      <FileUpload
        label="Bases del trabajo (obligatorio)"
        hint="Solo PDF. Máx. 15 MB."
        maxFiles={1}
        maxBytes={15 * 1024 * 1024}
        multiple={false}
        accept="application/pdf,.pdf"
        files={basesFile ? [basesFile] : []}
        error={fieldErrors.bases}
        onAdd={(files) => setBasesFile(files[0] ?? null)}
        onRemove={() => setBasesFile(null)}
      />
    </div>
  );
}
