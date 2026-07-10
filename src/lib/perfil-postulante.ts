import type { NextRequest } from "next/server";

import { nombreArchivoDocumento } from "@/lib/perfil-doc-access";
import {
  ORDENES_MERITO,
  SECTORES_LABORALES,
  TIPOS_ESTUDIO,
  type ConocimientoPostulanteDTO,
  type EducacionDTO,
  type ExpLaboralDTO,
} from "@/types/catalogos";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function mapEducacion(e: {
  id: string;
  carreraId: number;
  tipoEstudio: string;
  institucion: string;
  ordenMerito: string;
  fechaIngreso: Date;
  fechaEgreso: Date | null;
  documentoPath?: string | null;
  carrera: { nombre: string };
}): EducacionDTO {
  return {
    id: e.id,
    carreraId: e.carreraId,
    carreraNombre: e.carrera.nombre,
    tipoEstudio: e.tipoEstudio,
    institucion: e.institucion,
    ordenMerito: e.ordenMerito,
    fechaIngreso: toDateInput(e.fechaIngreso),
    fechaEgreso: e.fechaEgreso ? toDateInput(e.fechaEgreso) : null,
    documentoDisponible: Boolean(e.documentoPath),
    documentoNombre: nombreArchivoDocumento(e.documentoPath),
  };
}

export function mapExpLaboral(e: {
  id: string;
  sector: string;
  empresa: string;
  puesto: string;
  tiempoMeses: number;
  fechaInicio: Date;
  fechaFin: Date | null;
  documentoPath?: string | null;
}): ExpLaboralDTO {
  return {
    id: e.id,
    sector: e.sector,
    empresa: e.empresa,
    puesto: e.puesto,
    tiempoMeses: e.tiempoMeses,
    fechaInicio: toDateInput(e.fechaInicio),
    fechaFin: e.fechaFin ? toDateInput(e.fechaFin) : null,
    documentoDisponible: Boolean(e.documentoPath),
    documentoNombre: nombreArchivoDocumento(e.documentoPath),
  };
}

export function mapConocimiento(c: {
  id: string;
  conocimientoId: number;
  institucion: string;
  documentoPath?: string | null;
  conocimiento: { nombre: string; grupo: string };
}): ConocimientoPostulanteDTO {
  return {
    id: c.id,
    conocimientoId: c.conocimientoId,
    conocimientoNombre: c.conocimiento.nombre,
    grupo: c.conocimiento.grupo,
    institucion: c.institucion,
    documentoDisponible: Boolean(c.documentoPath),
    documentoNombre: nombreArchivoDocumento(c.documentoPath),
  };
}

export type EducacionInput = {
  carreraId: number;
  tipoEstudio: string;
  institucion: string;
  ordenMerito: string;
  fechaIngreso: string;
  fechaEgreso?: string;
};

export function validarEducacionInput(
  data: Partial<EducacionInput>
): { ok: true; data: EducacionInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const carreraId = Number(data.carreraId);
  if (!Number.isFinite(carreraId) || carreraId < 1) {
    errors.carreraId = "Selecciona una carrera.";
  }
  const tipoEstudio = data.tipoEstudio?.trim() ?? "";
  if (!TIPOS_ESTUDIO.includes(tipoEstudio as (typeof TIPOS_ESTUDIO)[number])) {
    errors.tipoEstudio = "Selecciona el tipo de estudio.";
  }
  const institucion = data.institucion?.trim() ?? "";
  if (institucion.length < 2) errors.institucion = "Indica la institución.";
  const ordenMerito = data.ordenMerito?.trim() ?? "No aplica";
  if (!ORDENES_MERITO.includes(ordenMerito as (typeof ORDENES_MERITO)[number])) {
    errors.ordenMerito = "Orden de mérito inválido.";
  }
  const fechaIngreso = data.fechaIngreso?.trim() ?? "";
  if (!DATE_RE.test(fechaIngreso)) {
    errors.fechaIngreso = "Indica la fecha de ingreso en formato DD/MM/AAAA.";
  }
  const fechaEgreso = data.fechaEgreso?.trim();
  if (fechaEgreso && !DATE_RE.test(fechaEgreso)) {
    errors.fechaEgreso = "Indica la fecha de egreso en formato DD/MM/AAAA.";
  }
  if (fechaEgreso && fechaIngreso && fechaEgreso < fechaIngreso) {
    errors.fechaEgreso = "La fecha de egreso no puede ser anterior al ingreso.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      carreraId,
      tipoEstudio,
      institucion,
      ordenMerito,
      fechaIngreso,
      fechaEgreso: fechaEgreso || undefined,
    },
  };
}

export type ExpLaboralInput = {
  sector: string;
  empresa: string;
  puesto: string;
  fechaInicio: string;
  fechaFin?: string;
};

function mesesEntre(inicio: string, fin?: string): number {
  const a = new Date(inicio);
  const b = fin ? new Date(fin) : new Date();
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const months =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return Math.max(0, months);
}

export function validarExpLaboralInput(
  data: Partial<ExpLaboralInput>
): { ok: true; data: ExpLaboralInput & { tiempoMeses: number } } | {
  ok: false;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const sector = data.sector?.trim() ?? "";
  if (!SECTORES_LABORALES.includes(sector as (typeof SECTORES_LABORALES)[number])) {
    errors.sector = "Selecciona un sector.";
  }
  const empresa = data.empresa?.trim() ?? "";
  if (empresa.length < 2) errors.empresa = "Indica la empresa.";
  const puesto = data.puesto?.trim() ?? "";
  if (puesto.length < 2) errors.puesto = "Indica el puesto.";
  const fechaInicio = data.fechaInicio?.trim() ?? "";
  if (!DATE_RE.test(fechaInicio)) errors.fechaInicio = "Fecha de inicio inválida.";
  const fechaFin = data.fechaFin?.trim();
  if (fechaFin && !DATE_RE.test(fechaFin)) errors.fechaFin = "Fecha de fin inválida.";
  if (fechaFin && fechaInicio && fechaFin < fechaInicio) {
    errors.fechaFin = "La fecha de fin no puede ser anterior al inicio.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      sector,
      empresa,
      puesto,
      fechaInicio,
      fechaFin: fechaFin || undefined,
      tiempoMeses: mesesEntre(fechaInicio, fechaFin),
    },
  };
}

export type ConocimientoInput = {
  conocimientoId: number;
  institucion?: string;
};

export function validarConocimientoInput(
  data: Partial<ConocimientoInput>
): { ok: true; data: ConocimientoInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const conocimientoId = Number(data.conocimientoId);
  if (!Number.isFinite(conocimientoId) || conocimientoId < 1) {
    errors.conocimientoId = "Selecciona un conocimiento.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      conocimientoId,
      institucion: data.institucion?.trim() ?? "",
    },
  };
}

export async function requirePostulanteSession() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    return null;
  }
  return session;
}

export async function requirePostulanteConDni() {
  const session = await requirePostulanteSession();
  if (!session?.postulanteId) return null;

  const { prisma } = await import("@/lib/db");
  const postulante = await prisma.postulante.findUnique({
    where: { id: session.postulanteId },
    select: { id: true, numeroDocumento: true },
  });
  if (!postulante) return null;

  return {
    postulanteId: postulante.id,
    dni: postulante.numeroDocumento,
  };
}

export async function parsePerfilItemForm(request: NextRequest): Promise<{
  fields: Record<string, string>;
  documento: File | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const fd = await request.formData();
    const fields: Record<string, string> = {};
    let documento: File | null = null;
    for (const [key, value] of fd.entries()) {
      if (key === "documento" && value instanceof File && value.size > 0) {
        documento = value;
      } else if (typeof value === "string") {
        fields[key] = value;
      }
    }
    return { fields, documento };
  }

  const body = (await request.json()) as Record<string, unknown>;
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key !== "documento" && value != null) {
      fields[key] = String(value);
    }
  }
  return { fields, documento: null };
}
