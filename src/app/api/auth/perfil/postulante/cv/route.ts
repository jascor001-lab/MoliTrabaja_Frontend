import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { nombreArchivoCv, resolveCvFile } from "@/lib/cv-access";
import { extraerTextoCv, parsearCvTexto } from "@/lib/cv-parser";
import { prisma } from "@/lib/db";
import { numeroDocumentoDe } from "@/lib/postulante-doc";
import { guardarCvPostulante } from "@/lib/upload-cv";

/** Ver / descargar el CV del perfil propio. */
export async function GET() {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const postulante = await prisma.postulante.findUnique({
    where: { id: session.postulanteId },
    select: { cvPath: true },
  });
  if (!postulante) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const cv = await resolveCvFile(postulante.cvPath);
  if (!cv) {
    return NextResponse.json({ error: "Aún no has subido un CV" }, { status: 404 });
  }

  const buffer = await readFile(cv.absolutePath);
  const displayName = nombreArchivoCv(postulante.cvPath) ?? cv.fileName;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": cv.mime,
      "Content-Disposition": cv.inline
        ? `inline; filename="${displayName}"`
        : `attachment; filename="${displayName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

/** Subir o reemplazar el CV del perfil. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const cvFile = form.get("cv");

  if (!(cvFile instanceof File) || cvFile.size === 0) {
    return NextResponse.json(
      { error: "Adjunta tu CV en PDF, Word o TXT." },
      { status: 422 }
    );
  }

  const postulante = await prisma.postulante.findUnique({
    where: { id: session.postulanteId },
  });
  if (!postulante) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  try {
    const dni = numeroDocumentoDe(postulante);
    const { path: cvPath, name } = await guardarCvPostulante(dni, cvFile);
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    const textoCv = await extraerTextoCv(buffer, cvFile.name);
    const cvParsed = parsearCvTexto(textoCv, []);

    await prisma.postulante.update({
      where: { id: session.postulanteId },
      data: {
        cvPath,
        cvParsed: JSON.stringify(cvParsed),
      },
    });

    return NextResponse.json({
      ok: true,
      cvPath,
      cvFilename: name,
      cvDisponible: true,
      message: "CV guardado en tu perfil.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo guardar el CV" },
      { status: 422 }
    );
  }
}
