import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import {
  estadoParaPostulante,
  normalizarEstadoPipeline,
  parseCvParsed,
  statusCodeFromPipeline,
} from "@/lib/dashboard-postulacion";
import { calcularMatchScorePercentage } from "@/lib/match-score";
import { construirHistorialActividad } from "@/lib/postulacion-actividad";
import { prisma } from "@/lib/db";
import { findPostulanteByDocumento, numeroDocumentoDe } from "@/lib/postulante-doc";
import type { MisPostulacionItem } from "@/types/postulacion";

export async function GET(request: NextRequest) {
  const session = await getSession();
  let dni = request.nextUrl.searchParams.get("dni")?.trim();

  if (session?.tipo === "postulante" && session.postulanteId) {
    const p = await prisma.postulante.findUnique({
      where: { id: session.postulanteId },
      select: { numeroDocumento: true },
    });
    if (p) dni = p.numeroDocumento;
  }

  if (!dni || !/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido (8 dígitos)" }, { status: 400 });
  }

  const postulante = await findPostulanteByDocumento(prisma, dni);
  if (!postulante) {
    return NextResponse.json({ dni, postulaciones: [] });
  }

  const full = await prisma.postulante.findUnique({
    where: { id: postulante.id },
    include: {
      postulaciones: {
        include: {
          oferta: {
            include: {
              empresa: true,
              carreras: { include: { carrera: true } },
              conocimientos: { include: { conocimiento: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!full) {
    return NextResponse.json({ dni, postulaciones: [] });
  }

  const postulaciones: MisPostulacionItem[] = full.postulaciones.map((p) => {
    const cv = parseCvParsed(full.cvParsed);
    const pipeline = normalizarEstadoPipeline(p.estadoSeguimiento);
    const matchOferta = {
      titulo: p.oferta.titulo,
      funciones: p.oferta.funciones,
      descripcion: p.oferta.descripcion,
      perfil: p.oferta.perfil,
      carreras: p.oferta.carreras.map((c) => c.carrera.nombre),
      conocimientos: p.oferta.conocimientos.map((k) => k.conocimiento.nombre),
    };
    const matchScore =
      p.matchScore > 0 ? p.matchScore : calcularMatchScorePercentage(cv, matchOferta);

    const empresa = p.oferta.empresa.razonSocial || p.oferta.empresa.nombre;

    return {
      application_id: p.codigo,
      job_id: p.ofertaId,
      job_title: p.oferta.titulo,
      empresa,
      estado: estadoParaPostulante(pipeline),
      status_code: statusCodeFromPipeline(pipeline),
      match_score_percentage: matchScore,
      fecha_postulacion: p.createdAt.toISOString(),
      last_update: p.lastUpdate.toISOString(),
      activity_history: construirHistorialActividad({
        estadoSeguimiento: p.estadoSeguimiento,
        fechaPostulacion: p.createdAt.toISOString(),
        lastUpdate: p.lastUpdate.toISOString(),
        empresa,
      }),
    };
  });

  return NextResponse.json({
    dni: numeroDocumentoDe(full),
    nombre_completo: `${full.nombres} ${full.apellidoPaterno} ${full.apellidoMaterno}`,
    total: postulaciones.length,
    postulaciones,
  });
}
