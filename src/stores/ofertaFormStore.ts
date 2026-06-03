import { create } from "zustand";

import { isoToDateInput } from "@/lib/oferta-api-body";
import { salarioFromStored } from "@/lib/salario";
import type {
  ArchivoAdjuntoMeta,
  ContactoInput,
  CronogramaInput,
  EstadoOferta,
  LogoArchivoMeta,
  Modalidad,
  OfertaLaboralDTO,
  TipoPuesto,
} from "@/types/bolsa";

export const WIZARD_STEPS = 4;

const emptyContacto = (): ContactoInput => ({
  nombres: "",
  apellidoPaterno: "",
  correo: "",
  celular: "",
});

export type OfertaFormFields = {
  logoFiles: File[];
  basesFile: File | null;
  enviarLogoPorCorreo: boolean;
  cronogramas: CronogramaInput[];
  nombrePuesto: string;
  perfil: string;
  tipoContrato: string;
  tipoPuesto: TipoPuesto[];
  cantidadVacantes: string;
  funciones: string;
  beneficios: string;
  modalidad: Modalidad;
  salarioAConvenir: boolean;
  salarioMonto: string;
  direccionLiteral: string;
  latitud: string;
  longitud: string;
  carreraIds: number[];
  conocimientoIds: number[];
  contactoPrincipal: ContactoInput;
  contactoGerente: ContactoInput;
  estado: EstadoOferta;
};

export type OfertaFormState = OfertaFormFields & {
  editingOfertaId: string | null;
  existingLogos: LogoArchivoMeta[];
  existingBases: ArchivoAdjuntoMeta | null;
  step: number;
  isSubmitting: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setField: <K extends keyof OfertaFormFields>(
    key: K,
    value: OfertaFormFields[K]
  ) => void;
  setContactoField: (
    rol: "contactoPrincipal" | "contactoGerente",
    key: keyof ContactoInput,
    value: string
  ) => void;
  toggleTipoPuesto: (tipo: TipoPuesto) => void;
  toggleCarrera: (id: number) => void;
  toggleConocimiento: (id: number) => void;
  addLogoFiles: (files: File[]) => void;
  removeLogoFile: (index: number) => void;
  setBasesFile: (file: File | null) => void;
  reset: () => void;
  hydrateFromOferta: (oferta: OfertaLaboralDTO) => void;
  setSubmitting: (value: boolean) => void;
};

const defaultCronograma = (): CronogramaInput[] => [
  { etapa: "Convocatoria", inicio: "", fin: "", responsable: "", urlConsulta: "" },
];

const initialFields: OfertaFormFields = {
  logoFiles: [],
  basesFile: null,
  enviarLogoPorCorreo: false,
  cronogramas: defaultCronograma(),
  nombrePuesto: "",
  perfil: "",
  tipoContrato: "Indefinido",
  tipoPuesto: [],
  cantidadVacantes: "1",
  funciones: "",
  beneficios: "",
  modalidad: "Presencial",
  salarioAConvenir: true,
  salarioMonto: "",
  direccionLiteral: "",
  latitud: "",
  longitud: "",
  carreraIds: [],
  conocimientoIds: [],
  contactoPrincipal: emptyContacto(),
  contactoGerente: emptyContacto(),
  estado: "Activa",
};

const initialMeta = {
  editingOfertaId: null as string | null,
  existingLogos: [] as LogoArchivoMeta[],
  existingBases: null as ArchivoAdjuntoMeta | null,
  step: 1,
  isSubmitting: false,
};

export const useOfertaFormStore = create<OfertaFormState>((set, get) => ({
  ...initialFields,
  ...initialMeta,

  setStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get();
    if (step < WIZARD_STEPS) set({ step: step + 1 });
  },

  prevStep: () => {
    const { step } = get();
    if (step > 1) set({ step: step - 1 });
  },

  setField: (key, value) => set({ [key]: value }),

  setContactoField: (rol, key, value) =>
    set((s) => ({
      [rol]: { ...s[rol], [key]: value },
    })),

  toggleTipoPuesto: (tipo) => {
    const current = get().tipoPuesto;
    if (current.includes(tipo)) {
      set({ tipoPuesto: current.filter((t) => t !== tipo) });
    } else {
      set({ tipoPuesto: [...current, tipo] });
    }
  },

  toggleCarrera: (id) => {
    const current = get().carreraIds;
    set({
      carreraIds: current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id],
    });
  },

  toggleConocimiento: (id) => {
    const current = get().conocimientoIds;
    set({
      conocimientoIds: current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id],
    });
  },

  addLogoFiles: (incoming) => {
    const { logoFiles } = get();
    set({
      logoFiles: [...logoFiles, ...incoming].slice(0, 5),
      enviarLogoPorCorreo: false,
    });
  },

  removeLogoFile: (index) =>
    set({ logoFiles: get().logoFiles.filter((_, i) => i !== index) }),

  setBasesFile: (file) => set({ basesFile: file }),

  reset: () => set({ ...initialFields, ...initialMeta }),

  hydrateFromOferta: (oferta) => {
    const pendienteCorreo = oferta.logoArchivos.some(
      (l) => l.name.toLowerCase().includes("pendiente") || !l.path
    );
    const principal = oferta.empresa?.contactos?.find((c) => c.esPrincipal);
    const gerente = oferta.empresa?.contactos?.find((c) => c.esGerente);
    const cronogramas =
      oferta.cronogramas.length > 0
        ? oferta.cronogramas.map((c) => ({
            etapa: c.etapa,
            urlConsulta: c.urlConsulta,
            inicio: isoToDateInput(c.inicio),
            fin: isoToDateInput(c.fin),
            responsable: c.responsable,
          }))
        : defaultCronograma();

    set({
      ...initialFields,
      editingOfertaId: oferta.id,
      existingLogos: oferta.logoArchivos.filter((l) => l.path),
      existingBases: oferta.basesArchivo,
      step: 1,
      isSubmitting: false,
      logoFiles: [],
      basesFile: null,
      enviarLogoPorCorreo: pendienteCorreo,
      cronogramas,
      nombrePuesto: oferta.titulo,
      perfil: oferta.perfil,
      tipoContrato: oferta.tipoContrato,
      tipoPuesto: oferta.tipoPuesto,
      cantidadVacantes: String(oferta.cantidadVacantes),
      funciones: oferta.funciones,
      beneficios: oferta.beneficios,
      modalidad: oferta.modalidad,
      salarioAConvenir: salarioFromStored(oferta.salario).aConvenir,
      salarioMonto: salarioFromStored(oferta.salario).monto,
      direccionLiteral: oferta.direccionTrabajo?.direccionLiteral ?? "",
      latitud: oferta.direccionTrabajo?.latitud ?? "",
      longitud: oferta.direccionTrabajo?.longitud ?? "",
      carreraIds: oferta.carrerasRequeridas.map((c) => c.id),
      conocimientoIds: oferta.conocimientosRequeridos.map((c) => c.id),
      contactoPrincipal: principal
        ? {
            nombres: principal.nombres,
            apellidoPaterno: principal.apellidoPaterno,
            correo: principal.correo,
            celular: principal.celular,
          }
        : emptyContacto(),
      contactoGerente: gerente
        ? {
            nombres: gerente.nombres,
            apellidoPaterno: gerente.apellidoPaterno,
            correo: gerente.correo,
            celular: gerente.celular,
          }
        : emptyContacto(),
      estado: oferta.estado,
    });
  },

  setSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
