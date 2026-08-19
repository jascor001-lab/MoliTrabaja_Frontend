import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { parseBasesArchivo } from "@/lib/bases-access";
import type { ArchivoAdjuntoMeta } from "@/types/bolsa";

export async function persistBasesArchivo(
  prisma: PrismaClient,
  ofertaId: string,
  meta: ArchivoAdjuntoMeta | null
): Promise<void> {
  await prisma.ofertaLaboral.update({
    where: { id: ofertaId },
    data: { basesArchivo: meta === null ? Prisma.JsonNull : (meta as Prisma.InputJsonValue) },
  });
}

export async function loadBasesArchivoRaw(
  prisma: PrismaClient,
  ofertaId: string
): Promise<ArchivoAdjuntoMeta | null> {
  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: ofertaId },
    select: { basesArchivo: true },
  });
  return parseBasesArchivo(oferta?.basesArchivo ?? null);
}
