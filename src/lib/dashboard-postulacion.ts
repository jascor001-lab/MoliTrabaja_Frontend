import type { OfertaLaboral, Postulacion, Postulante } from "@prisma/client";

import { cvViewUrl } from "@/lib/cv-access";
import { calcularMatchScorePercentage } from "@/lib/match-score";
import { numeroDocumentoDe } from "@/lib/postulante-doc";
import { calcularEdad, nombreCompleto } from "@/lib/validacion-postulante";
import type {
  AccionReclutador,
  CandidateActionable,
  CvFormato,
  CvParsed,
  DashboardDualResponse,
  EstadoPipeline,
  EstadoPostulante,
  FunnelSummary,
  StatusCode,
} from "@/types/postulacion";
import { ACCIONES_RECLUTADOR, ESTADOS_PIPELINE } from "@/types/postulacion";

const LEGACY_MAP: Record<string, EstadoPipeline> = {
  Recibido: "En Revisión",
  Evaluación: "Entrevista",
  Finalizado: "No Seleccionado (Fuera del Proceso)",
};

export function normalizarEstadoPipeline(raw: string): EstadoPipeline {
  if (ESTADOS_PIPELINE.includes(raw as EstadoPipeline)) {
    return raw as EstadoPipeline;
  }
  return LEGACY_MAP[raw] ?? "En Revisión";
}

export function parseCvParsed(raw: string): CvParsed {
  try {
    const p = JSON.parse(raw) as Partial<CvParsed> & {
      skills?: string[];
      experience_years?: number;
    };
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
    return {
      stack: [],
      skills: [],
      experience: { years: 0 },
      experience_years: 0,
      education: [],
    };
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

export function accionesDisponibles(estado: EstadoPipeline): AccionReclutador[] {
  if (estado === "Aceptado / Seleccionado") return ["Rechazar"];
  if (estado === "No Seleccionado (Fuera del Proceso)") {
    return ["Aceptar", "Mover a Entrevista"];
  }
  return ["Aceptar", "Rechazar", "Mover a Entrevista"];
}

export function accionAEstado(accion: AccionReclutador): EstadoPipeline {
  switch (accion) {
    case "Aceptar":
      return "Aceptado / Seleccionado";
    case "Rechazar":
      return "No Seleccionado (Fuera del Proceso)";
    case "Mover a Entrevista":
      return "Entrevista";
  }
}

function buildFunnel(postulaciones: { estadoSeguimiento: string }[]): FunnelSummary {
  const funnel: FunnelSummary = {
    en_revision: 0,
    entrevistas: 0,
    aceptados: 0,
    no_seleccionados: 0,
  };

  for (const p of postulaciones) {
    const e = normalizarEstadoPipeline(p.estadoSeguimiento);
    if (e === "En Revisión") funnel.en_revision++;
    else if (e === "Entrevista") funnel.entrevistas++;
    else if (e === "Aceptado / Seleccionado") funnel.aceptados++;
    else funnel.no_seleccionados++;
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

type OfertaMatch = OfertaLaboral & {
  carreras?: { carrera: { nombre: string } }[];
  conocimientos?: { conocimiento: { nombre: string } }[];
};

type Row = Postulacion & {
  postulante: Postulante & {
    direccion?: { direccionLiteral: string } | null;
    conocimientos?: { conocimiento: { nombre: string } }[];
    educaciones?: { carrera: { nombre: string } }[];
  };
};

function ofertaMatchInput(oferta: OfertaMatch) {
  return {
    titulo: oferta.titulo,
    funciones: oferta.funciones,
    descripcion: oferta.descripcion,
    perfil: oferta.perfil,
    carreras: oferta.carreras?.map((c) => c.carrera.nombre) ?? [],
    conocimientos: oferta.conocimientos?.map((k) => k.conocimiento.nombre) ?? [],
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

      const matchScore =
        p.matchScore > 0
          ? p.matchScore
          : calcularMatchScorePercentage(cv, matchOferta, postConoc, postCarr);

      const cvPath = p.postulante.cvPath;
      const cvAvailable = Boolean(cvPath?.startsWith("/uploads/cv/"));

      return {
        dni: doc,
        nombre: nombreCompleto(p.postulante),
        edad: calcularEdad(fechaNac),
        match_score_percentage: matchScore,
        current_status: estado,
        available_actions: accionesDisponibles(estado),
        cv_available: cvAvailable,
        ...(cvAvailable && {
          cv_filename: nombreArchivoCv(cvPath),
          cv_formato: formatoCvDesdePath(cvPath),
          cv_view_url: cvViewUrl(oferta.id, doc),
        }),
      };
    }
  );

  const response: DashboardDualResponse = {
    application_id: "",
    job_metadata: {
      job_id: oferta.id,
      title: oferta.titulo,
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
