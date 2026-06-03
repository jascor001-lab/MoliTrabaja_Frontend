import { NextRequest, NextResponse } from "next/server";

import { buildDashboardDual } from "@/lib/dashboard-postulacion";
import { prisma } from "@/lib/db";
import { findPostulanteByDocumento, numeroDocumentoDe } from "@/lib/postulante-doc";

export async function GET(request: NextRequest) {
  const applicationId = request.nextUrl.searchParams.get("application_id")?.trim();
  const dni = request.nextUrl.searchParams.get("dni")?.trim();
  const jobId = request.nextUrl.searchParams.get("job_id")?.trim();

  let postulacion = null;

  if (applicationId) {
    postulacion = await prisma.postulacion.findFirst({
      where: {
        OR: [{ codigo: applicationId }, { id: applicationId }],
      },
      include: {
        postulante: { include: { direccion: true } },
        oferta: { include: { empresa: true } },
      },
    });
  } else if (dni && jobId) {
    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json({ error: "DNI inválido (8 dígitos)" }, { status: 400 });
    }
    const postulante = await findPostulanteByDocumento(prisma, dni);
    if (!postulante) {
      return NextResponse.json({ error: "No hay postulaciones para este DNI" }, { status: 404 });
    }
    postulacion = await prisma.postulacion.findUnique({
      where: {
        ofertaId_postulanteId: { ofertaId: jobId, postulanteId: postulante.id },
      },
      include: {
        postulante: { include: { direccion: true } },
        oferta: { include: { empresa: true } },
      },
    });
  } else if (dni) {
    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json({ error: "DNI inválido (8 dígitos)" }, { status: 400 });
    }
    postulacion = await prisma.postulacion.findFirst({
      where: { postulante: { numeroDocumento: dni } },
      orderBy: { createdAt: "desc" },
      include: {
        postulante: { include: { direccion: true } },
        oferta: { include: { empresa: true } },
      },
    });
  } else {
    return NextResponse.json(
      { error: "Indica application_id o dni (y opcionalmente job_id)" },
      { status: 400 }
    );
  }

  if (!postulacion) {
    return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });
  }

  const oferta = postulacion.oferta;
  const todas = await prisma.postulacion.findMany({
    where: { ofertaId: oferta.id },
    include: {
      postulante: {
        include: {
          direccion: true,
          conocimientos: { include: { conocimiento: true } },
          educaciones: { include: { carrera: true } },
        },
      },
    },
  });

  const ofertaFull = await prisma.ofertaLaboral.findUnique({
    where: { id: oferta.id },
    include: {
      carreras: { include: { carrera: true } },
      conocimientos: { include: { conocimiento: true } },
    },
  });

  const full = buildDashboardDual({
    oferta: ofertaFull ?? oferta,
    postulaciones: todas,
    targetDni: numeroDocumentoDe(postulacion.postulante),
    includeProfile: true,
  });

  return NextResponse.json({
    application_id: full.application_id,
    job_metadata: full.job_metadata,
    pestaña_personal_view: full.pestaña_personal_view,
    applicant_profile: full.applicant_profile,
  });
}
