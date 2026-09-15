import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { parseCvParsed } from "@/lib/dashboard-postulacion";
import { prisma } from "@/lib/db";
import { calcularMatchDetalle } from "@/lib/match-score";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [oferta, postulante] = await Promise.all([
    prisma.ofertaLaboral.findUnique({
      where: { id: params.id },
      include: {
        carreras: { include: { carrera: true } },
        conocimientos: { include: { conocimiento: true } },
      },
    }),
    prisma.postulante.findUnique({
      where: { id: session.postulanteId },
      include: {
        educaciones: { include: { carrera: true } },
        conocimientos: { include: { conocimiento: true } },
      },
    }),
  ]);

  if (!oferta || !postulante) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const cv = parseCvParsed(postulante.cvParsed);
  const detalle = calcularMatchDetalle(
    cv,
    {
      titulo: oferta.titulo,
      funciones: oferta.funciones,
      descripcion: oferta.descripcion,
      perfil: oferta.perfil,
      carreras: oferta.carreras.map((c) => c.carrera.nombre),
      conocimientos: oferta.conocimientos.map((k) => k.conocimiento.nombre),
    },
    postulante.conocimientos.map((k) => k.conocimiento.nombre),
    postulante.educaciones.map((e) => e.carrera.nombre)
  );

  return NextResponse.json({
    percentage: detalle.percentage,
    detalle,
    cvDisponible: Boolean(postulante.cvPath),
    tips: [
      ...(detalle.carreras.missing.length
        ? [`Completa en tu perfil la carrera: ${detalle.carreras.missing[0]}`]
        : []),
      ...(detalle.conocimientos.missing.length
        ? [
            `Añade conocimientos faltantes (${detalle.conocimientos.missing.length}): p. ej. ${detalle.conocimientos.missing.slice(0, 2).join(", ")}`,
          ]
        : []),
      ...(!postulante.cvPath
        ? ["Sube tu CV en PDF para mejorar el encaje con skills y experiencia."]
        : []),
    ],
  });
}
