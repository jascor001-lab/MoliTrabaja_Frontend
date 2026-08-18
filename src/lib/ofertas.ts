import type {
  CatalogoConocimiento,
  ContactoEmpresa,
  Cronograma,
  Direccion,
  Empresa,
  OfertaLaboral,
} from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import { basesViewUrl, parseBasesArchivo } from "@/lib/bases-access";
import { loadBasesArchivoRaw } from "@/lib/bases-persist";
import { pickLogoFromArchivos } from "@/lib/logo-oferta";
import type {
  CatalogoConocimientoDTO,
  ContactoEmpresaDTO,
  CronogramaDTO,
  DireccionDTO,
} from "@/types/catalogos";
import {
  ESTADOS_OFERTA,
  MODALIDADES,
  TIPOS_PUESTO,
  type EmpresaDTO,
  type EstadoOferta,
  type LogoArchivoMeta,
  type Modalidad,
  type OfertaLaboralDTO,
  type TipoPuesto,
} from "@/types/bolsa";

export type OfertaWithRelations = OfertaLaboral & {
  empresa?: Empresa & { contactos?: ContactoEmpresa[] };
  direccionTrabajo?: Direccion | null;
  cronogramas?: Cronograma[];
  carreras?: { carrera: { id: number; nombre: string } }[];
  conocimientos?: { conocimiento: CatalogoConocimiento }[];
};

export function parseJsonArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      /* fallback */
    }
  }
  return [];
}

export function parseLogoArchivos(raw: unknown): LogoArchivoMeta[] {
  const parsed = typeof raw === "string" ? safeJson(raw) : raw;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (item): item is LogoArchivoMeta =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      "path" in item &&
      typeof (item as LogoArchivoMeta).path === "string" &&
      (item as LogoArchivoMeta).path.length > 1
  );
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function serializeJsonArray<T>(items: T[]): string {
  return JSON.stringify(items);
}

function asModalidad(value: string): Modalidad {
  return MODALIDADES.includes(value as Modalidad)
    ? (value as Modalidad)
    : "Presencial";
}

function asEstado(value: string): EstadoOferta {
  return ESTADOS_OFERTA.includes(value as EstadoOferta)
    ? (value as EstadoOferta)
    : "Activa";
}

function asTipoPuesto(values: string[]): TipoPuesto[] {
  return values.filter((v): v is TipoPuesto =>
    TIPOS_PUESTO.includes(v as TipoPuesto)
  );
}

export function buildDescripcionOferta(funciones: string, beneficios: string): string {
  return `FUNCIONES:\n${funciones.trim()}\n\nBENEFICIOS:\n${beneficios.trim()}`;
}

function toDireccionDTO(d: Direccion | null | undefined): DireccionDTO | null {
  if (!d) return null;
  return {
    id: d.id,
    direccionLiteral: d.direccionLiteral,
    latitud: d.latitud,
    longitud: d.longitud,
  };
}

function toContactoDTO(c: ContactoEmpresa): ContactoEmpresaDTO {
  return {
    id: c.id,
    nombres: c.nombres,
    apellidoPaterno: c.apellidoPaterno,
    correo: c.correo,
    celular: c.celular,
    esPrincipal: c.esPrincipal,
    esGerente: c.esGerente,
  };
}

function toCronogramaDTO(c: Cronograma): CronogramaDTO {
  return {
    id: c.id,
    etapa: c.etapa,
    urlConsulta: c.urlConsulta,
    inicio: c.inicio.toISOString(),
    fin: c.fin?.toISOString() ?? null,
    responsable: c.responsable,
  };
}

export function toEmpresaDTO(
  empresa: Empresa & { contactos?: ContactoEmpresa[] }
): EmpresaDTO {
  return {
    id: empresa.id,
    nombre: empresa.nombre,
    razonSocial: empresa.razonSocial,
    ruc: empresa.ruc,
    rubro: empresa.rubro,
    logo: empresa.logo,
    telefono: empresa.telefono,
    paginaWeb: empresa.paginaWeb,
    descripcion: empresa.descripcion,
    contactos: empresa.contactos?.map(toContactoDTO),
  };
}

export function toOfertaDTO(oferta: OfertaWithRelations): OfertaLaboralDTO {
  const logoArchivos = parseLogoArchivos(oferta.logoArchivos);
  const basesArchivo = parseBasesArchivo(oferta.basesArchivo);
  const empresaDto = oferta.empresa ? toEmpresaDTO(oferta.empresa) : undefined;

  const carrerasRequeridas =
    oferta.carreras?.map((oc) => ({
      id: oc.carrera.id,
      nombre: oc.carrera.nombre,
    })) ?? [];

  const conocimientosRequeridos: CatalogoConocimientoDTO[] =
    oferta.conocimientos?.map((ok) => ({
      id: ok.conocimiento.id,
      nombre: ok.conocimiento.nombre,
      grupo: ok.conocimiento.grupo,
    })) ?? [];

  return {
    id: oferta.id,
    empresaId: oferta.empresaId,
    titulo: oferta.titulo,
    perfil: oferta.perfil,
    descripcion: oferta.descripcion,
    tipoContrato: oferta.tipoContrato,
    modalidad: asModalidad(oferta.modalidad),
    salario: oferta.salario,
    estado: asEstado(oferta.estado),
    fechaPublicacion: oferta.fechaPublicacion.toISOString(),
    logoArchivos,
    logoUrl: pickLogoFromArchivos(logoArchivos) ?? empresaDto?.logo ?? null,
    basesArchivo,
    basesViewUrl: basesArchivo
      ? basesViewUrl(oferta.id, basesArchivo.path.split("/").pop() ?? basesArchivo.name)
      : null,
    tipoPuesto: asTipoPuesto(parseJsonArray(oferta.tipoPuesto)),
    cantidadVacantes: oferta.cantidadVacantes,
    aptoDiscapacidad: Boolean(oferta.aptoDiscapacidad),
    funciones: oferta.funciones,
    beneficios: oferta.beneficios,
    direccionTrabajo: toDireccionDTO(oferta.direccionTrabajo),
    cronogramas: oferta.cronogramas?.map(toCronogramaDTO) ?? [],
    carrerasRequeridas,
    conocimientosRequeridos,
    empresa: empresaDto,
  };
}

export const OFERTA_INCLUDE = {
  empresa: { include: { contactos: true } },
  direccionTrabajo: true,
  cronogramas: { orderBy: { inicio: "asc" as const } },
  carreras: { include: { carrera: true } },
  conocimientos: { include: { conocimiento: true } },
};

/** Completa bases cuando el client Prisma aún no expone la columna. */
export async function enrichOfertaDTOWithBases(
  dto: OfertaLaboralDTO,
  db: PrismaClient,
  ofertaId: string
): Promise<OfertaLaboralDTO> {
  if (dto.basesArchivo) return dto;
  const bases = await loadBasesArchivoRaw(db, ofertaId);
  if (!bases) return dto;
  return {
    ...dto,
    basesArchivo: bases,
    basesViewUrl: basesViewUrl(
      ofertaId,
      bases.path.split("/").pop() ?? bases.name
    ),
  };
}

export async function upsertDireccion(
  prisma: PrismaClient,
  literal: string,
  latitud?: string,
  longitud?: string
): Promise<string | null> {
  const trimmed = literal.trim();
  if (!trimmed) return null;
  const dir = await prisma.direccion.create({
    data: {
      direccionLiteral: trimmed,
      latitud: latitud?.trim() || null,
      longitud: longitud?.trim() || null,
    },
  });
  return dir.id;
}

export async function syncContactosEmpresa(
  prisma: PrismaClient,
  empresaId: string,
  principal: {
    nombres: string;
    apellidoPaterno: string;
    correo: string;
    celular: string;
  },
  gerente: {
    nombres: string;
    apellidoPaterno: string;
    correo: string;
    celular: string;
  }
): Promise<void> {
  await prisma.contactoEmpresa.deleteMany({ where: { empresaId } });
  await prisma.contactoEmpresa.createMany({
    data: [
      { empresaId, ...principal, esPrincipal: true, esGerente: false },
      { empresaId, ...gerente, esPrincipal: false, esGerente: true },
    ],
  });
}

export async function syncCronogramas(
  prisma: PrismaClient,
  ofertaId: string,
  cronogramas: {
    etapa: string;
    urlConsulta?: string;
    inicio: string;
    fin?: string | null;
    responsable?: string;
  }[]
): Promise<void> {
  await prisma.cronograma.deleteMany({ where: { ofertaId } });
  if (cronogramas.length === 0) return;
  await prisma.cronograma.createMany({
    data: cronogramas.map((c) => ({
      ofertaId,
      etapa: c.etapa.trim(),
      urlConsulta: c.urlConsulta?.trim() ?? "",
      inicio: new Date(c.inicio),
      fin: c.fin ? new Date(c.fin) : null,
      responsable: c.responsable?.trim() ?? "",
    })),
  });
}

export async function syncOfertaCatalogos(
  prisma: PrismaClient,
  ofertaId: string,
  carreraIds: number[],
  conocimientoIds: number[]
): Promise<void> {
  await prisma.ofertaCarrera.deleteMany({ where: { ofertaId } });
  await prisma.ofertaConocimiento.deleteMany({ where: { ofertaId } });
  if (carreraIds.length > 0) {
    await prisma.ofertaCarrera.createMany({
      data: carreraIds.map((carreraId) => ({ ofertaId, carreraId })),
    });
  }
  if (conocimientoIds.length > 0) {
    await prisma.ofertaConocimiento.createMany({
      data: conocimientoIds.map((conocimientoId) => ({ ofertaId, conocimientoId })),
    });
  }
}
