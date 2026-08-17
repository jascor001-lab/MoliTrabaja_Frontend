export const TIPOS_CONTRATO = [
  "Indefinido",
  "Plazo fijo",
  "Prácticas",
  "Locación de servicios",
] as const;
export type TipoContrato = (typeof TIPOS_CONTRATO)[number];

export const ESTADOS_CIVILES = [
  "Soltero",
  "Casado",
  "Conviviente",
  "Divorciado",
  "Viudo",
] as const;
export type EstadoCivil = (typeof ESTADOS_CIVILES)[number];

export const SECTORES_LABORALES = [
  "Acuicultura",
  "Administración pública",
  "Aeronáutica",
  "Agricultura y agroindustria",
  "Alimentos y bebidas",
  "Arquitectura y diseño",
  "Artes, cultura y entretenimiento",
  "Automotriz",
  "Banca y servicios financieros",
  "Belleza y cuidado personal",
  "Call center y BPO",
  "Comercio mayorista",
  "Comercio minorista",
  "Comercio exterior y aduanas",
  "Comunicaciones y medios",
  "Consultoría",
  "Contabilidad y auditoría",
  "Construcción",
  "Defensa y fuerzas armadas",
  "Deporte y recreación",
  "Educación",
  "Energía y electricidad",
  "Farmacéutica",
  "Gastronomía",
  "Gobierno y sector público",
  "Hotelería y turismo",
  "Hidrocarburos",
  "Industria y manufactura",
  "Inmobiliaria",
  "Investigación y ciencia",
  "Legal",
  "Limpieza y mantenimiento",
  "Logística, transporte y almacenamiento",
  "Marketing y publicidad",
  "Medio ambiente",
  "Minería y metalurgia",
  "Naval y portuario",
  "ONG y cooperación internacional",
  "Pesca",
  "Recursos humanos",
  "Retail",
  "Salud",
  "Seguridad y vigilancia",
  "Seguros",
  "Servicios profesionales",
  "Siderurgia",
  "Telecomunicaciones",
  "Tecnología de la información",
  "Textil y confecciones",
  "Veterinaria",
  "Agua y saneamiento",
  "Otro",
] as const;
export type SectorLaboral = (typeof SECTORES_LABORALES)[number];

export const TIPOS_ESTUDIO = [
  "Secundaria",
  "Técnico",
  "Universitario",
  "Posgrado",
] as const;
export type TipoEstudio = (typeof TIPOS_ESTUDIO)[number];

export const ORDENES_MERITO = [
  "Primero",
  "Segundo",
  "Tercero",
  "Cuarto",
  "Quinto",
  "No aplica",
] as const;
export type OrdenMerito = (typeof ORDENES_MERITO)[number];

export const GRUPOS_CONOCIMIENTO = [
  "Técnico",
  "Idioma",
  "Ofimática",
  "Blanda",
  "Otro",
] as const;
export type GrupoConocimiento = (typeof GRUPOS_CONOCIMIENTO)[number];

export type TipoDocDTO = { id: number; nombreCompleto: string; abrev: string };
export type PaisDTO = { id: number; nombre: string; prefijoCelular: string };
export type CatalogoCarreraDTO = { id: number; nombre: string };
export type CatalogoConocimientoDTO = {
  id: number;
  nombre: string;
  grupo: string;
};
export type CatalogoInstitucionDTO = {
  id: number;
  razonSocial: string;
  nombre: string;
};

export type DireccionDTO = {
  id: string;
  direccionLiteral: string;
  latitud: string | null;
  longitud: string | null;
};

export type ContactoEmpresaDTO = {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  correo: string;
  celular: string;
  esPrincipal: boolean;
  esGerente: boolean;
};

export type CronogramaDTO = {
  id: string;
  etapa: string;
  urlConsulta: string;
  inicio: string;
  fin: string | null;
  responsable: string;
};

export type ExpLaboralDTO = {
  id: string;
  sector: string;
  empresa: string;
  puesto: string;
  tiempoMeses: number;
  fechaInicio: string;
  fechaFin: string | null;
  documentoDisponible: boolean;
  documentoNombre?: string;
};

export type EducacionDTO = {
  id: string;
  carreraId: number;
  carreraNombre: string;
  tipoEstudio: string;
  institucion: string;
  ordenMerito: string;
  fechaIngreso: string;
  fechaEgreso: string | null;
  documentoDisponible: boolean;
  documentoNombre?: string;
};

export type ConocimientoPostulanteDTO = {
  id: string;
  conocimientoId: number;
  conocimientoNombre: string;
  grupo: string;
  institucion: string;
  documentoDisponible: boolean;
  documentoNombre?: string;
};
