import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  mapConocimiento,
  parsePerfilItemForm,
  requirePostulanteConDni,
  validarConocimientoInput,
} from "@/lib/perfil-postulante";
import { guardarDocumentoPerfil } from "@/lib/upload-perfil-doc";

export async function POST(request: NextRequest) {
  const auth = await requirePostulanteConDni();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { fields, documento } = await parsePerfilItemForm(request);
  const validation = validarConocimientoInput({
    conocimientoId: Number(fields.conocimientoId),
    institucion: fields.institucion ?? "",
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  if (!documento) {
    return NextResponse.json(
      { error: "Debes adjuntar un PDF que certifique este conocimiento." },
      { status: 422 }
    );
  }

  const conocimiento = await prisma.catalogoConocimiento.findUnique({
    where: { id: validation.data.conocimientoId },
  });
  if (!conocimiento) {
    return NextResponse.json({ error: "Conocimiento no encontrado" }, { status: 400 });
  }

  const duplicado = await prisma.conocimientoPostulante.findFirst({
    where: {
      postulanteId: auth.postulanteId,
      conocimientoId: validation.data.conocimientoId,
    },
  });
  if (duplicado) {
    return NextResponse.json(
      { error: "Ya registraste este conocimiento en tu perfil." },
      { status: 409 }
    );
  }

  const row = await prisma.conocimientoPostulante.create({
    data: {
      postulanteId: auth.postulanteId,
      conocimientoId: validation.data.conocimientoId,
      institucion: validation.data.institucion ?? "",
    },
    include: { conocimiento: true },
  });

  try {
    const saved = await guardarDocumentoPerfil(
      auth.dni,
      "conocimiento",
      row.id,
      documento
    );
    const updated = await prisma.conocimientoPostulante.update({
      where: { id: row.id },
      data: { documentoPath: saved.path },
      include: { conocimiento: true },
    });
    return NextResponse.json({ conocimiento: mapConocimiento(updated) }, { status: 201 });
  } catch (e) {
    await prisma.conocimientoPostulante.delete({ where: { id: row.id } });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo guardar el PDF" },
      { status: 422 }
    );
  }
}
