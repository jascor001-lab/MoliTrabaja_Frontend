import type { PrismaClient } from "@prisma/client";

import { parseBasesArchivo, serializeBasesArchivo } from "@/lib/bases-access";
import type { ArchivoAdjuntoMeta } from "@/types/bolsa";

/** Guarda bases sin depender del client Prisma regenerado (columna en SQLite). */
export async function persistBasesArchivo(
  prisma: PrismaClient,
  ofertaId: string,
  meta: ArchivoAdjuntoMeta | null
): Promise<void> {
  const serialized = serializeBasesArchivo(meta);
  await prisma.$executeRawUnsafe(
    `UPDATE "OfertaLaboral" SET "basesArchivo" = ?, "updatedAt" = datetime('now') WHERE id = ?`,
    serialized,
    ofertaId
  );
}

export async function loadBasesArchivoRaw(
  prisma: PrismaClient,
  ofertaId: string
): Promise<ArchivoAdjuntoMeta | null> {
  const rows = await prisma.$queryRawUnsafe<Array<{ basesArchivo: string }>>(
    `SELECT "basesArchivo" FROM "OfertaLaboral" WHERE id = ? LIMIT 1`,
    ofertaId
  );
  return parseBasesArchivo(rows[0]?.basesArchivo ?? "");
}
