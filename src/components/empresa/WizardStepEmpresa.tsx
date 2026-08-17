"use client";

import { EmpresaLogo } from "@/components/ui/EmpresaLogo";
import { DateInput } from "@/components/ui/DateInput";
import { FileUpload } from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { SectionHint } from "@/components/ui/SectionHint";
import { useOfertaFormStore } from "@/stores/ofertaFormStore";

export function WizardStepEmpresa() {
  const {
    cronogramas,
    existingBases,
    existingLogos,
    basesFile,
    logoFiles,
    setField,
    setBasesFile,
  } = useOfertaFormStore();

  const logoFile = logoFiles[0] ?? null;

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

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Convocatoria y bases</h2>
        <p className="text-sm text-slate-500 mt-1">
          Logo, cronograma y documento oficial de la convocatoria.
        </p>
      </header>

      <SectionHint title="Logo de la empresa *">
        Imagen que verán los postulantes en el portal. Preferible PNG o JPG.
      </SectionHint>

      {existingLogos[0]?.path && !logoFile && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
          <EmpresaLogo src={existingLogos[0].path} alt="Logo actual" size="lg" />
          <p className="text-sm text-slate-600">
            Logo actual de la convocatoria. Sube uno nuevo para reemplazarlo.
          </p>
        </div>
      )}

      <FileUpload
        label="Logo de la empresa (obligatorio)"
        hint="PNG, JPG o WEBP. Máx. 10 MB."
        maxFiles={1}
        multiple={false}
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        files={logoFile ? [logoFile] : []}
        onAdd={(files) => setField("logoFiles", files[0] ? [files[0]] : [])}
        onRemove={() => setField("logoFiles", [])}
      />

    

      <div className="grid sm:grid-cols-2 gap-4">
        <DateInput
          label="Inicio convocatoria *"
          value={conv.inicio}
          onChange={(inicio) => updateCronograma({ inicio })}
          required
        />
        <DateInput
          label="Fin convocatoria (opcional)"
          value={conv.fin ?? ""}
          onChange={(fin) => updateCronograma({ fin })}
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

      <SectionHint title="Bases del trabajo *">
        Documento oficial. Los postulantes podrán consultarlo antes de postular.
      </SectionHint>

      {existingBases && !basesFile && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
          <p className="text-sm font-medium text-slate-700">Bases actuales</p>
          <p className="text-sm text-slate-600 truncate">{existingBases.name}</p>
        </div>
      )}

      <FileUpload
        label="Bases del trabajo (obligatorio)"
        hint="PDF, Word o TXT. Máx. 15 MB."
        maxFiles={1}
        multiple={false}
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        files={basesFile ? [basesFile] : []}
        onAdd={(files) => setBasesFile(files[0] ?? null)}
        onRemove={() => setBasesFile(null)}
      />
    </div>
  );
}
