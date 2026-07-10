import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { resolvePerfilDocumento } from "@/lib/perfil-doc-access";
import type { PerfilDocTipo } from "@/lib/upload-perfil-doc";

type Params = { params: { id: string; dni: string } };

const TIPOS: PerfilDocTipo[] = ["educacion", "experiencia", "conocimiento"];

export async function GET(request: NextRequest, { params }: Params) {
  const jobId = params.id;
  const dni = params.dni.trim();
  const tipo = request.nextUrl.searchParams.get("tipo") as PerfilDocTipo | null;
  const itemId = request.nextUrl.searchParams.get("itemId")?.trim();

  if (!/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }
  if (!tipo || !TIPOS.includes(tipo) || !itemId) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
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

  const postulanteId = postulacion.postulanteId;
  let docPath: string | null = null;

  if (tipo === "educacion") {
    const row = await prisma.educacion.findFirst({
      where: { id: itemId, postulanteId },
    });
    docPath = row?.documentoPath ?? null;
  } else if (tipo === "experiencia") {
    const row = await prisma.expLaboral.findFirst({
      where: { id: itemId, postulanteId },
    });
    docPath = row?.documentoPath ?? null;
  } else {
    const row = await prisma.conocimientoPostulante.findFirst({
      where: { id: itemId, postulanteId },
    });
    docPath = row?.documentoPath ?? null;
  }

  const doc = await resolvePerfilDocumento(docPath);
  if (!doc) {
    return NextResponse.json({ error: "Documento no disponible" }, { status: 404 });
  }

  const buffer = await readFile(doc.absolutePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
