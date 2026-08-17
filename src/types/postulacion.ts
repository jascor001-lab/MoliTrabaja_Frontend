export const GENEROS = ["Masculino", "Femenino", "Otro", "Prefiero no decir"] as const;
export type Genero = (typeof GENEROS)[number];

export const ESTADOS_CIVILES = [
  "Soltero",
  "Casado",
  "Conviviente",
  "Divorciado",
  "Viudo",
] as const;
export type EstadoCivil = (typeof ESTADOS_CIVILES)[number];

/** Estados internos del embudo (reclutador) — persistidos en BD. */
export const ESTADOS_PIPELINE = [
  "En Revisión",
  "Entrevista",
  "Aceptado / Seleccionado",
  "No Seleccionado (Fuera del Proceso)",
] as const;
export type EstadoPipeline = (typeof ESTADOS_PIPELINE)[number];

/**
 * Carpetas de gestión (estilo Computrabajo).
 * Mapeo: Inscritos→En Revisión, En proceso→Entrevista,
 * Finalistas→Aceptado, Descartados→No Seleccionado.
 */
export const CARPETAS_RECLUTADOR = [
  "Inscritos",
  "En proceso",
  "Finalistas",
  "Descartados",
] as const;
export type CarpetaReclutador = (typeof CARPETAS_RECLUTADOR)[number];

/** Estados visibles para el postulante (3 oficiales). */
export const ESTADOS_POSTULANTE = [
  "En Revisión",
  "Aceptado / Seleccionado",
  "No Seleccionado (Fuera del Proceso)",
] as const;
export type EstadoPostulante = (typeof ESTADOS_POSTULANTE)[number];

/** Acciones para mover candidatos entre carpetas. */
export const ACCIONES_RECLUTADOR = [
  "Mover a Inscritos",
  "Mover a En proceso",
  "Mover a Finalistas",
  "Descartar",
] as const;
export type AccionReclutador = (typeof ACCIONES_RECLUTADOR)[number];

export const STATUS_CODES = [
  "IN_REVIEW",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
] as const;
export type StatusCode = (typeof STATUS_CODES)[number];

export type CvParsed = {
  stack: string[];
  skills: string[];
  experience: { years: number };
  experience_years: number;
  education: string[];
};

export type PostulanteInput = {
  tipoDocId: number;
  numeroDocumento: string;
  /** @deprecated alias */
  dni?: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  paisId: number;
  genero: Genero;
  estadoCivil: EstadoCivil;
  correo: string;
  telefono: string;
  direccionLiteral: string;
  /** @deprecated */
  direccion?: string;
  latitud?: string;
  longitud?: string;
};

export type FunnelSummary = {
  inscritos: number;
  en_proceso: number;
  finalistas: number;
  descartados: number;
  /** @deprecated alias de inscritos */
  en_revision: number;
  /** @deprecated alias de en_proceso */
  entrevistas: number;
  /** @deprecated alias de finalistas */
  aceptados: number;
  /** @deprecated alias de descartados */
  no_seleccionados: number;
};

export type CvFormato = "pdf" | "txt" | "word" | "otro";

export type CandidateRequisitosMatch = {
  carreras_requeridas: string[];
  carreras_cumplidas: string[];
  conocimientos_requeridos: string[];
  conocimientos_cumplidos: string[];
};

export type CandidateActionable = {
  dni: string;
  nombre: string;
  edad: number;
  correo: string;
  telefono: string;
  match_score_percentage: number;
  /** Estado interno persistido */
  current_status: EstadoPipeline;
  /** Carpeta visible para la empresa */
  carpeta: CarpetaReclutador;
  available_actions: AccionReclutador[];
  cv_available: boolean;
  cv_filename?: string;
  cv_formato?: CvFormato;
  cv_view_url?: string;
  requisitos: CandidateRequisitosMatch;
  tiene_discapacidad: boolean;
};

export type ActividadPostulacion = {
  id: string;
  etiqueta: string;
  descripcion: string;
  fecha: string | null;
  estado: "completado" | "actual" | "pendiente";
};

export type MisPostulacionItem = {
  application_id: string;
  job_id: string;
  job_title: string;
  empresa: string;
  estado: EstadoPostulante;
  status_code: StatusCode;
  match_score_percentage: number;
  fecha_postulacion: string;
  last_update: string;
  activity_history: ActividadPostulacion[];
};

export type DashboardDualResponse = {
  application_id: string;
  job_metadata: {
    job_id: string;
    title: string;
    empresa: string;
  };
  pestaña_empresa_view: {
    analytics: {
      total_postulantes: number;
      funnel_summary: FunnelSummary;
    };
    candidate_pool_actionable: CandidateActionable[];
  };
  pestaña_personal_view?: {
    application_id: string;
    target_applicant_dni: string;
    tracking: {
      status: EstadoPostulante;
      status_code: StatusCode;
      context_message: string;
      competencia_info: {
        total_rivales_postulando: number;
      };
      last_activity_timestamp: string;
      activity_history: ActividadPostulacion[];
    };
  };
  applicant_profile?: {
    dni: string;
    nombre_completo: string;
    fecha_nacimiento: string;
    edad_automatica: number;
    identificacion: {
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
    };
    demografia: {
      genero: string;
      direccion: string;
      tiene_discapacidad: boolean;
    };
    contacto: {
      correo: string;
      telefono: string;
    };
    cv_parsed: CvParsed;
  };
};
