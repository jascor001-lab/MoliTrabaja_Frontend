import type { OfertaLaboral, Postulacion, Postulante } from "@prisma/client";

import { cvViewUrl } from "@/lib/cv-urls";
import { calcularMatchDetalle } from "@/lib/match-score";
import { numeroDocumentoDe } from "@/lib/postulante-doc";
import { calcularEdad, nombreCompleto } from "@/lib/validacion-postulante";
import { construirHistorialActividad } from "@/lib/postulacion-actividad";
import type {
  AccionReclutador,
  CandidateActionable,
  CandidateRequisitosMatch,
  CarpetaReclutador,
  CvFormato,
  CvParsed,
  DashboardDualResponse,
  EstadoPipeline,
  EstadoPostulante,
  FunnelSummary,
  StatusCode,
} from "@/types/postulacion";
import { ESTADOS_PIPELINE } from "@/types/postulacion";

const EN_REVISION: EstadoPipeline = "En Revisión";

const LEGACY_MAP: Record<string, EstadoPipeline> = {
  Recibido: EN_REVISION,
  Evaluación: "Entrevista",
  Finalizado: "No Seleccionado (Fuera del Proceso)",
};

export function normalizarEstadoPipeline(raw: string): EstadoPipeline {
  if (ESTADOS_PIPELINE.includes(raw as EstadoPipeline)) {
    return raw as EstadoPipeline;
  }
  return LEGACY_MAP[raw] ?? EN_REVISION;
}

export function carpetaDesdePipeline(pipeline: EstadoPipeline): CarpetaReclutador {
  if (pipeline === "Entrevista") return "En proceso";
  if (pipeline === "Aceptado / Seleccionado") return "Finalistas";
  if (pipeline === "No Seleccionado (Fuera del Proceso)") return "Descartados";
  return "Inscritos";
}

export function parseCvParsed(raw: unknown): CvParsed {
  const empty: CvParsed = {
    stack: [],
    skills: [],
    experience: { years: 0 },
    experience_years: 0,
    education: [],
  };
  try {
    const p = (
      typeof raw === "string" ? JSON.parse(raw) : raw
    ) as Partial<CvParsed> & {
      skills?: string[];
      experience_years?: number;
    };
    if (!p || typeof p !== "object") return empty;
    const stack = Array.isArray(p.stack)
      ? p.stack
      : Array.isArray(p.skills)
        ? p.skills
        : [];
    const years = p.experience?.years ?? Number(p.experience_years) ?? 0;
    return {
      stack,
      skills: stack,
      experience: { years },
      experience_years: years,
      education: Array.isArray(p.education) ? p.education : [],
    };
  } catch {
    return empty;
  }
}

export function estadoParaPostulante(pipeline: EstadoPipeline): EstadoPostulante {
  if (pipeline === "Aceptado / Seleccionado") return "Aceptado / Seleccionado";
  if (pipeline === "No Seleccionado (Fuera del Proceso)") {
    return "No Seleccionado (Fuera del Proceso)";
  }
  return "En Revisión";
}

export function statusCodeFromPipeline(pipeline: EstadoPipeline): StatusCode {
  if (pipeline === "Aceptado / Seleccionado") return "ACCEPTED";
  if (pipeline === "No Seleccionado (Fuera del Proceso)") return "REJECTED";
  if (pipeline === "Entrevista") return "INTERVIEW";
  return "IN_REVIEW";
}

const CONTEXT_MESSAGES: Record<EstadoPipeline, string> = {
  "En Revisión":
    "Tu perfil cumple con los requisitos iniciales. El reclutador está revisando activamente tu CV.",
  Entrevista:
    "Has sido preseleccionado. La empresa te contactará para la fase de entrevistas.",
  "Aceptado / Seleccionado":
    "¡Felicitaciones! Has sido aceptado para la posición o la siguiente fase de incorporación.",
  "No Seleccionado (Fuera del Proceso)":
    "En esta oportunidad no continuas en el proceso. Te invitamos a postular a otras vacantes.",
};

/**
 * Embudo solo hacia adelante: Inscritos → En Proceso → Finalistas.
 * No se puede retroceder; Descartar sí está permitido en cualquier etapa activa.
 */
export function accionesDisponibles(estado: EstadoPipeline): AccionReclutador[] {
  const carpeta = carpetaDesdePipeline(estado);
  if (carpeta === "Descartados") return [];
  if (carpeta === "Inscritos") return ["Mover a En proceso", "Descartar"];
  if (carpeta === "En proceso") return ["Mover a Finalistas", "Descartar"];
  // Finalistas: solo descartar (ya no se puede volver atrás)
  return ["Descartar"];
}

export function accionAEstado(accion: AccionReclutador): EstadoPipeline {
  switch (accion) {
    case "Mover a Inscritos":
      return EN_REVISION;
    case "Mover a En proceso":
      return "Entrevista";
    case "Mover a Finalistas":
      return "Aceptado / Seleccionado";
    case "Descartar":
      return "No Seleccionado (Fuera del Proceso)";
  }
}

function buildFunnel(postulaciones: { estadoSeguimiento: string }[]): FunnelSummary {
  const funnel: FunnelSummary = {
    inscritos: 0,
    en_proceso: 0,
    finalistas: 0,
    descartados: 0,
    en_revision: 0,
    entrevistas: 0,
    aceptados: 0,
    no_seleccionados: 0,
  };

  for (const p of postulaciones) {
    const e = normalizarEstadoPipeline(p.estadoSeguimiento);
    if (e === EN_REVISION) {
      funnel.inscritos++;
      funnel.en_revision++;
    } else if (e === "Entrevista") {
      funnel.en_proceso++;
      funnel.entrevistas++;
    } else if (e === "Aceptado / Seleccionado") {
      funnel.finalistas++;
      funnel.aceptados++;
    } else {
      funnel.descartados++;
      funnel.no_seleccionados++;
    }
  }

  return funnel;
}

function formatoCvDesdePath(cvPath: string | null): CvFormato | undefined {
  if (!cvPath) return undefined;
  const ext = cvPath.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "txt") return "txt";
  if (ext === "doc" || ext === "docx") return "word";
  return "otro";
}

function nombreArchivoCv(cvPath: string | null): string | undefined {
  if (!cvPath) return undefined;
  const base = cvPath.split("/").pop();
  if (!base) return undefined;
  const parts = base.split("-");
  return parts.length > 1 ? parts.slice(1).join("-") : base;
}

type CatalogoItem = { id: number; nombre: string };

type OfertaMatch = OfertaLaboral & {
  empresa?: { razonSocial: string; nombre: string };
  carreras?: { carrera: CatalogoItem }[];
  conocimientos?: { conocimiento: CatalogoItem & { grupo?: string } }[];
};

type Row = Postulacion & {
  postulante: Postulante & {
    direccion?: { direccionLiteral: string } | null;
    educaciones?: {
      id: string;
      carrera: { id: number; nombre: string };
    }[];
    experiencias?: {
      id: string;
      puesto: string;
      empresa: string;
      sector: string;
      tiempoMeses: number;
    }[];
    conocimientos?: {
      id: string;
      conocimiento: { id: number; nombre: string; grupo: string };
    }[];
  };
};

function matchRequisitos(
  reqCarreras: CatalogoItem[],
  reqConoc: CatalogoItem[],
  postCarreraIds: number[],
  postConocIds: number[]
): CandidateRequisitosMatch {
  const postCSet = new Set(postCarreraIds);
  const postKSet = new Set(postConocIds);

  return {
    carreras_requeridas: reqCarreras.map((c) => c.nombre),
    carreras_cumplidas: reqCarreras
      .filter((c) => postCSet.has(c.id))
      .map((c) => c.nombre),
    conocimientos_requeridos: reqConoc.map((k) => k.nombre),
    conocimientos_cumplidos: reqConoc
      .filter((k) => postKSet.has(k.id))
      .map((k) => k.nombre),
  };
}

function ofertaMatchInput(oferta: OfertaMatch) {
  const carreras =
    oferta.carreras?.map((c) => ({
      id: c.carrera.id,
      nombre: c.carrera.nombre,
    })) ?? [];
  const conocimientos =
    oferta.conocimientos?.map((k) => ({
      id: k.conocimiento.id,
      nombre: k.conocimiento.nombre,
    })) ?? [];

  return {
    titulo: oferta.titulo,
    funciones: oferta.funciones,
    descripcion: oferta.descripcion,
    perfil: oferta.perfil,
    carreras: carreras.map((c) => c.nombre),
    conocimientos: conocimientos.map((k) => k.nombre),
    carrerasCatalogo: carreras,
    conocimientosCatalogo: conocimientos,
  };
}

export function buildDashboardDual(params: {
  oferta: OfertaMatch;
  postulaciones: Row[];
  targetDni?: string;
  includeProfile?: boolean;
}): DashboardDualResponse {
  const { oferta, postulaciones, targetDni, includeProfile } = params;
  const total = postulaciones.length;
  const matchOferta = ofertaMatchInput(oferta);

  const reqCarreras = matchOferta.carrerasCatalogo;
  const reqConoc = matchOferta.conocimientosCatalogo;

  const candidate_pool_actionable: CandidateActionable[] = postulaciones.map(
    (p) => {
      const cv = parseCvParsed(p.postulante.cvParsed);
      const estado = normalizarEstadoPipeline(p.estadoSeguimiento);
      const fechaNac = p.postulante.fechaNacimiento.toISOString().slice(0, 10);
      const doc = numeroDocumentoDe(p.postulante);
      const postConoc =
        p.postulante.conocimientos?.map((k) => k.conocimiento.nombre) ?? [];
      const postCarr =
        p.postulante.educaciones?.map((e) => e.carrera.nombre) ?? [];

      const matchDetalle = calcularMatchDetalle(
        cv,
        matchOferta,
        postConoc,
        postCarr
      );
      const matchScore = matchDetalle.percentage;

      const cvPath = p.cvPath || p.postulante.cvPath;
      const cvAvailable = Boolean(cvPath?.startsWith("/uploads/cv/"));

      return {
        dni: doc,
        nombre: nombreCompleto(p.postulante),
        edad: calcularEdad(fechaNac),
        correo: p.postulante.correo,
        telefono: p.postulante.telefono,
        match_score_percentage: matchScore,
        match_detalle: matchDetalle,
        current_status: estado,
        carpeta: carpetaDesdePipeline(estado),
        available_actions: accionesDisponibles(estado),
        cv_available: cvAvailable,
        requisitos: matchRequisitos(
          reqCarreras,
          reqConoc,
          p.postulante.educaciones?.map((e) => e.carrera.id) ?? [],
          p.postulante.conocimientos?.map((k) => k.conocimiento.id) ?? []
        ),
        tiene_discapacidad: Boolean(
          (p.postulante as { tieneDiscapacidad?: boolean }).tieneDiscapacidad
        ),
        ...(cvAvailable && {
          cv_filename: nombreArchivoCv(cvPath),
          cv_formato: formatoCvDesdePath(cvPath),
          cv_view_url: cvViewUrl(oferta.id, doc),
        }),
      };
    }
  );

  const empresaNombre = oferta.empresa?.razonSocial || oferta.empresa?.nombre || "";

  const response: DashboardDualResponse = {
    application_id: "",
    job_metadata: {
      job_id: oferta.id,
      title: oferta.titulo,
      empresa: empresaNombre,
    },
    pestaña_empresa_view: {
      analytics: {
        total_postulantes: total,
        funnel_summary: buildFunnel(postulaciones),
      },
      candidate_pool_actionable,
    },
  };

  if (targetDni) {
    const row = postulaciones.find((p) => numeroDocumentoDe(p.postulante) === targetDni);
    if (row) {
      const pipeline = normalizarEstadoPipeline(row.estadoSeguimiento);
      const statusPostulante = estadoParaPostulante(pipeline);

      response.application_id = row.codigo;
      response.pestaña_personal_view = {
        application_id: row.codigo,
        target_applicant_dni: targetDni,
        tracking: {
          status: statusPostulante,
          status_code: statusCodeFromPipeline(pipeline),
          context_message: CONTEXT_MESSAGES[pipeline],
          competencia_info: { total_rivales_postulando: total },
          last_activity_timestamp: row.lastUpdate.toISOString(),
          activity_history: construirHistorialActividad({
            estadoSeguimiento: row.estadoSeguimiento,
            fechaPostulacion: row.createdAt.toISOString(),
            lastUpdate: row.lastUpdate.toISOString(),
            empresa: empresaNombre,
          }),
        },
      };

      if (includeProfile) {
        const cv = parseCvParsed(row.postulante.cvParsed);
        const fechaNac = row.postulante.fechaNacimiento.toISOString().slice(0, 10);
        response.applicant_profile = {
          dni: numeroDocumentoDe(row.postulante),
          nombre_completo: nombreCompleto(row.postulante),
          fecha_nacimiento: fechaNac,
          edad_automatica: calcularEdad(fechaNac),
          identificacion: {
            nombres: row.postulante.nombres,
            apellido_paterno: row.postulante.apellidoPaterno,
            apellido_materno: row.postulante.apellidoMaterno,
          },
          demografia: {
            genero: row.postulante.genero,
            direccion: row.postulante.direccion?.direccionLiteral ?? "",
            tiene_discapacidad: Boolean(
              (row.postulante as { tieneDiscapacidad?: boolean }).tieneDiscapacidad
            ),
          },
          contacto: {
            correo: row.postulante.correo,
            telefono: row.postulante.telefono,
          },
          cv_parsed: cv,
        };
      }
    }
  }

  return response;
}

export function generarCodigoPostulacion(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `MOL-${n}`;
}
