import type {
  CatalogoConocimientoDTO,
  ContactoEmpresaDTO,
  CronogramaDTO,
  DireccionDTO,
} from "@/types/catalogos";

export const MODALIDADES = ["Presencial", "Remoto", "Hibrido"] as const;
export type Modalidad = (typeof MODALIDADES)[number];

export const ESTADOS_OFERTA = ["Activa", "Pausada"] as const;
export type EstadoOferta = (typeof ESTADOS_OFERTA)[number];

export const TIPOS_PUESTO = ["Pick Time", "Part Time", "Full Time"] as const;
export type TipoPuesto = (typeof TIPOS_PUESTO)[number];

export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  Presencial: "Presencial",
  Remoto: "Remoto",
  Hibrido: "Híbrido",
};

export type LogoArchivoMeta = {
  name: string;
  path: string;
  size: number;
  mimeType: string;
};

export type ArchivoAdjuntoMeta = LogoArchivoMeta;

export type EmpresaDTO = {
  id: string;
  nombre: string;
  razonSocial: string;
  ruc: string;
  rubro: string;
  logo: string | null;
  telefono: string;
  paginaWeb: string;
  descripcion: string | null;
  contactos?: ContactoEmpresaDTO[];
};

export type OfertaLaboralDTO = {
  id: string;
  empresaId: string;
  titulo: string;
  perfil: string;
  descripcion: string;
  tipoContrato: string;
  modalidad: Modalidad;
  salario: string;
  estado: EstadoOferta;
  fechaPublicacion: string;
  logoArchivos: LogoArchivoMeta[];
  logoUrl: string | null;
  basesArchivo: ArchivoAdjuntoMeta | null;
  basesViewUrl: string | null;
  tipoPuesto: TipoPuesto[];
  cantidadVacantes: number;
  funciones: string;
  beneficios: string;
  direccionTrabajo: DireccionDTO | null;
  cronogramas: CronogramaDTO[];
  carrerasRequeridas: { id: number; nombre: string }[];
  conocimientosRequeridos: CatalogoConocimientoDTO[];
  empresa?: EmpresaDTO;
};

export type ContactoInput = {
  nombres: string;
  apellidoPaterno: string;
  correo: string;
  celular: string;
};

export type CronogramaInput = {
  etapa: string;
  urlConsulta?: string;
  inicio: string;
  fin?: string | null;
  responsable?: string;
};

export type CrearOfertaInput = {
  empresaId: string;
  nombrePuesto: string;
  perfil: string;
  tipoContrato: string;
  tipoPuesto: TipoPuesto[];
  cantidadVacantes: number;
  funciones: string;
  beneficios: string;
  modalidad: Modalidad;
  salario?: string;
  direccionLiteral: string;
  latitud?: string;
  longitud?: string;
  carreraIds: number[];
  conocimientoIds: number[];
  cronogramas: CronogramaInput[];
  contactoPrincipal: ContactoInput;
  contactoGerente: ContactoInput;
};

export type ActualizarOfertaInput = CrearOfertaInput & {
  estado?: EstadoOferta;
};
