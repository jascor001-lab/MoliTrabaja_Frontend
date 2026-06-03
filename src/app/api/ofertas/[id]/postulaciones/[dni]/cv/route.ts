import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { resolveCvFile } from "@/lib/cv-access";
import { prisma } from "@/lib/db";

type Params = { params: { id: string; dni: string } };

/** CV del postulante para esta vacante (solo si postuló a la oferta). */
export async function GET(_request: NextRequest, { params }: Params) {
  const jobId = params.id;
  const dni = params.dni.trim();

  if (!/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }

  const postulacion = await prisma.postulacion.findFirst({
    where: {
      ofertaId: jobId,
      postulante: { numeroDocumento: dni },
    },
    include: { postulante: true },
  });

  if (!postulacion) {
    return NextResponse.json(
      { error: "Postulante no encontrado en esta vacante" },
      { status: 404 }
    );
  }

  const cv = await resolveCvFile(postulacion.postulante.cvPath);
  if (!cv) {
    return NextResponse.json({ error: "CV no disponible" }, { status: 404 });
  }

  const buffer = await readFile(cv.absolutePath);
  const disposition = cv.inline ? "inline" : "attachment";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": cv.mime,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(cv.fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
