import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getSession } from "@/lib/auth";
import { backendUrl } from "@/lib/backend";
import { extraerTextoCv, parsearCvTexto } from "@/lib/cv-parser";
import { prisma } from "@/lib/db";
import { resumenCvParsed } from "@/lib/match-score";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecciona un archivo PDF." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "El CV debe ser un documento PDF." },
      { status: 400 }
    );
  }

  // Reenviar al backend Nest (persistencia de archivo / perfil).
  const nestForm = new FormData();
  nestForm.append("cv", file, file.name);

  let nestRes: Response;
  try {
    nestRes = await fetch(`${backendUrl()}/auth/perfil/postulante/cv`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
      body: nestForm,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el API para guardar el CV." },
      { status: 503 }
    );
  }

  const nestJson = (await nestRes.json().catch(() => ({}))) as Record<string, unknown>;
  if (!nestRes.ok) {
    return NextResponse.json(
      { error: nestJson.error ?? nestJson.message ?? "No se pudo guardar el CV" },
      { status: nestRes.status }
    );
  }

  // Parseo local del PDF para alimentar el % de encaje.
  const buffer = Buffer.from(await file.arrayBuffer());
  const texto = await extraerTextoCv(buffer, file.name);
  const parsed = parsearCvTexto(texto);
  const analisis = resumenCvParsed(parsed);

  try {
    await prisma.postulante.update({
      where: { id: session.postulanteId },
      data: {
        cvParsed: parsed as unknown as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Si Prisma falla, igual devolvemos el análisis para la UI.
  }

  return NextResponse.json({
    ...nestJson,
    cvFilename: nestJson.cvFilename ?? file.name,
    message:
      typeof nestJson.message === "string"
        ? nestJson.message
        : "CV guardado y analizado para el porcentaje de encaje.",
    cvAnalisis: {
      ...analisis,
      textoExtraido: Boolean(texto.trim()),
      aviso: texto.trim()
        ? null
        : "No se pudo leer texto del PDF (puede ser una imagen escaneada). El encaje usará sobre todo tu perfil.",
    },
  });
}
