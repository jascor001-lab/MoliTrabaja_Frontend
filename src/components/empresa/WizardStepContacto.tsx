"use client";

import { Input } from "@/components/ui/Input";
import { SectionHint } from "@/components/ui/SectionHint";
import { useOfertaFormStore } from "@/stores/ofertaFormStore";

type Props = {
  embedded?: boolean;
};

export function WizardStepContacto({ embedded = false }: Props) {
  const { contactoPrincipal, contactoGerente, setContactoField, fieldErrors } =
    useOfertaFormStore();

  return (
    <div className="space-y-8">
      {!embedded && (
        <header>
          <h2 className="text-xl font-bold text-slate-900">Contactos de empresa</h2>
          <p className="text-sm text-slate-500 mt-1" />
        </header>
      )}

      <section className="space-y-4">
        <SectionHint variant="success" title="Contacto principal (RRHH)">
          Persona responsable del proceso de selección.
        </SectionHint>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nombres"
            value={contactoPrincipal.nombres}
            onChange={(e) => setContactoField("contactoPrincipal", "nombres", e.target.value)}
            error={fieldErrors.contactoPrincipal_nombres}
          />
          <Input
            label="Apellido paterno"
            value={contactoPrincipal.apellidoPaterno}
            onChange={(e) =>
              setContactoField("contactoPrincipal", "apellidoPaterno", e.target.value)
            }
            error={fieldErrors.contactoPrincipal_apellidoPaterno}
          />
        </div>
        <Input
          label="Correo"
          type="email"
          value={contactoPrincipal.correo}
          onChange={(e) => setContactoField("contactoPrincipal", "correo", e.target.value)}
          error={fieldErrors.contactoPrincipal_correo}
        />
        <Input
          label="Celular"
          type="tel"
          value={contactoPrincipal.celular}
          onChange={(e) => setContactoField("contactoPrincipal", "celular", e.target.value)}
          error={fieldErrors.contactoPrincipal_celular}
        />
      </section>

      <section className="space-y-4 border-t border-emerald-100 pt-6">
        <SectionHint title="Gerente / supervisor">
          Jefe del responsable del proceso de seleccion .
        </SectionHint>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nombres"
            value={contactoGerente.nombres}
            onChange={(e) => setContactoField("contactoGerente", "nombres", e.target.value)}
            error={fieldErrors.contactoGerente_nombres}
          />
          <Input
            label="Apellido paterno"
            value={contactoGerente.apellidoPaterno}
            onChange={(e) =>
              setContactoField("contactoGerente", "apellidoPaterno", e.target.value)
            }
            error={fieldErrors.contactoGerente_apellidoPaterno}
          />
        </div>
        <Input
          label="Correo"
          type="email"
          value={contactoGerente.correo}
          onChange={(e) => setContactoField("contactoGerente", "correo", e.target.value)}
          error={fieldErrors.contactoGerente_correo}
        />
        <Input
          label="Celular"
          type="tel"
          value={contactoGerente.celular}
          onChange={(e) => setContactoField("contactoGerente", "celular", e.target.value)}
          error={fieldErrors.contactoGerente_celular}
        />
      </section>
    </div>
  );
}
