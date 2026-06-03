import { NextRequest, NextResponse } from "next/server";

import {
  accionAEstado,
  buildDashboardDual,
} from "@/lib/dashboard-postulacion";
import { prisma } from "@/lib/db";
import { findPostulanteByDocumento } from "@/lib/postulante-doc";
import { ACCIONES_RECLUTADOR, type AccionReclutador } from "@/types/postulacion";

export async function PATCH(request: NextRequest) {
  let body: { dni?: string; job_id?: string; action?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const dni = body.dni?.trim();
  const jobId = body.job_id?.trim();
  const action = body.action as AccionReclutador;

  if (!dni || !/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }
  if (!jobId) {
    return NextResponse.json({ error: "job_id es obligatorio" }, { status: 400 });
  }
  if (!action || !ACCIONES_RECLUTADOR.includes(action)) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const postulante = await findPostulanteByDocumento(prisma, dni);
  if (!postulante) {
    return NextResponse.json({ error: "Postulante no encontrado" }, { status: 404 });
  }

  const postulacion = await prisma.postulacion.findUnique({
    where: {
      ofertaId_postulanteId: { ofertaId: jobId, postulanteId: postulante.id },
    },
  });

  if (!postulacion) {
    return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });
  }

  await prisma.postulacion.update({
    where: { id: postulacion.id },
    data: {
      estadoSeguimiento: accionAEstado(action),
      lastUpdate: new Date(),
    },
  });

  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: jobId },
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
      targetDni: dni,
    })
  );
}
