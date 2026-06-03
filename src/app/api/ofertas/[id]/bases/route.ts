import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { parseBasesArchivo, resolveBasesFile } from "@/lib/bases-access";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };

/** Documento de bases del trabajo de la convocatoria (público para postulantes). */
export async function GET(_request: NextRequest, { params }: Params) {
  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: params.id },
    select: { id: true, estado: true, basesArchivo: true },
  });

  if (!oferta) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  const meta = parseBasesArchivo(oferta.basesArchivo);
  if (!meta) {
    return NextResponse.json(
      { error: "Bases del trabajo no disponibles" },
      { status: 404 }
    );
  }

  const file = await resolveBasesFile(meta);
  if (!file) {
    return NextResponse.json(
      { error: "Archivo de bases no encontrado" },
      { status: 404 }
    );
  }

  const buffer = await readFile(file.absolutePath);
  const disposition = file.inline ? "inline" : "attachment";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.fileName)}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
