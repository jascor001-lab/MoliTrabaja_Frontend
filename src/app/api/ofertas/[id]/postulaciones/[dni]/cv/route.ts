import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { nombreArchivoCv, resolveCvFile } from "@/lib/cv-access";
import { prisma } from "@/lib/db";

type Params = { params: { id: string; dni: string } };

/** CV enviado en esta postulación (snapshot; no cambia si el perfil actualiza el CV). */
export async function GET(_request: NextRequest, { params }: Params) {
  const jobId = params.id;
  const dni = params.dni.trim();

  if (!dni || dni.length < 5) {
    return NextResponse.json({ error: "Documento inválido" }, { status: 400 });
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

  // Preferir el CV congelado al postular; fallback a perfil (postulaciones antiguas).
  const snapshotPath = postulacion.cvPath || postulacion.postulante.cvPath;
  const cv = await resolveCvFile(snapshotPath);
  if (!cv) {
    return NextResponse.json({ error: "CV no disponible" }, { status: 404 });
  }

  const buffer = await readFile(cv.absolutePath);
  const displayName = nombreArchivoCv(snapshotPath) ?? cv.fileName;
  const disposition = cv.inline ? "inline" : "attachment";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": cv.mime,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(displayName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
