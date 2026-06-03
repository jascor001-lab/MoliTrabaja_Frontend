import { NextRequest, NextResponse } from "next/server";

import { buildDashboardDual } from "@/lib/dashboard-postulacion";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  const { id: jobId } = params;
  const targetDni = request.nextUrl.searchParams.get("dni")?.trim();

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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!oferta) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  const payload = buildDashboardDual({
    oferta,
    postulaciones: oferta.postulaciones,
    targetDni: targetDni || undefined,
    includeProfile: false,
  });

  return NextResponse.json(payload);
}
