import { NextRequest, NextResponse } from "next/server";

import {
  accionAEstado,
  buildDashboardDual,
  normalizarEstadoPipeline,
} from "@/lib/dashboard-postulacion";
import { prisma } from "@/lib/db";
import { numeroDocumentoDe } from "@/lib/postulante-doc";
import { ACCIONES_RECLUTADOR, ESTADOS_PIPELINE, type AccionReclutador } from "@/types/postulacion";

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = params;

  let body: { action?: string; estadoSeguimiento?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  let nuevoEstado: string | undefined;

  if (body.action && ACCIONES_RECLUTADOR.includes(body.action as AccionReclutador)) {
    nuevoEstado = accionAEstado(body.action as AccionReclutador);
  } else if (body.estadoSeguimiento) {
    nuevoEstado = normalizarEstadoPipeline(body.estadoSeguimiento);
    if (!ESTADOS_PIPELINE.includes(nuevoEstado as (typeof ESTADOS_PIPELINE)[number])) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
  }

  if (!nuevoEstado) {
    return NextResponse.json({ error: "Indica action o estadoSeguimiento" }, { status: 400 });
  }

  const postulacion = await prisma.postulacion.findFirst({
    where: { OR: [{ id }, { codigo: id }] },
    include: { postulante: true },
  });

  if (!postulacion) {
    return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });
  }

  await prisma.postulacion.update({
    where: { id: postulacion.id },
    data: { estadoSeguimiento: nuevoEstado, lastUpdate: new Date() },
  });

  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: postulacion.ofertaId },
    include: {
      carreras: { include: { carrera: true } },
      conocimientos: { include: { conocimiento: true } },
      postulaciones: {
        include: {
          postulante: {
            include: {
              direccion: true,
              conocimientos: { include: { conocimiento: true } },
              educaciones: { include: { carrera: true } },
            },
          },
        },
      },
    },
  });

  if (!oferta) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(
    buildDashboardDual({
      oferta,
      postulaciones: oferta.postulaciones,
      targetDni: numeroDocumentoDe(postulacion.postulante),
    })
  );
}
