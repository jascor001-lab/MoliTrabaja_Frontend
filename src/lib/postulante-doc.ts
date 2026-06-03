import type { Postulante } from "@prisma/client";

/** Número de documento (UML: nro_doc). Alias histórico dni cuando tipoDoc es DNI. */
export function numeroDocumentoDe(p: Pick<Postulante, "numeroDocumento">): string {
  return p.numeroDocumento;
}

/** @deprecated Usar numeroDocumentoDe — mantiene compatibilidad con rutas ?dni= */
export function dniDe(p: Pick<Postulante, "numeroDocumento">): string {
  return p.numeroDocumento;
}

export async function findPostulanteByDocumento(
  prisma: { postulante: { findFirst: Function } },
  numero: string,
  tipoDocId = 1
) {
  return prisma.postulante.findFirst({
    where: { tipoDocId, numeroDocumento: numero.trim() },
  });
}
