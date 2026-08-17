import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  asegurarInstitucionCatalogo,
  mapEducacion,
  parsePerfilItemForm,
  requirePostulanteConDni,
  validarEducacionInput,
} from "@/lib/perfil-postulante";
import { guardarDocumentoPerfil } from "@/lib/upload-perfil-doc";

type Ctx = { params: Promise<{ id: string }> };

async function ownedEducacion(postulanteId: string, id: string) {
  return prisma.educacion.findFirst({
    where: { id, postulanteId },
    include: { carrera: true },
  });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requirePostulanteConDni();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await ownedEducacion(auth.postulanteId, id);
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { fields, documento } = await parsePerfilItemForm(request);
  const validation = validarEducacionInput({
    carreraId: Number(fields.carreraId ?? existing.carreraId),
    tipoEstudio: fields.tipoEstudio ?? existing.tipoEstudio,
    institucion: fields.institucion ?? existing.institucion,
    ordenMerito: fields.ordenMerito ?? existing.ordenMerito,
    fechaIngreso:
      fields.fechaIngreso ?? existing.fechaIngreso.toISOString().slice(0, 10),
    fechaEgreso: fields.fechaEgreso
      ? fields.fechaEgreso
      : existing.fechaEgreso
        ? existing.fechaEgreso.toISOString().slice(0, 10)
        : undefined,
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  const institucionCatalogo = await asegurarInstitucionCatalogo(
    validation.data.institucion
  );

  let documentoPath = existing.documentoPath;
  if (documento) {
    try {
      const saved = await guardarDocumentoPerfil(auth.dni, "educacion", id, documento);
      documentoPath = saved.path;
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "No se pudo guardar el archivo" },
        { status: 422 }
      );
    }
  }

  const row = await prisma.educacion.update({
    where: { id },
    data: {
      carreraId: validation.data.carreraId,
      tipoEstudio: validation.data.tipoEstudio,
      institucion: validation.data.institucion,
      ordenMerito: validation.data.ordenMerito,
      fechaIngreso: new Date(validation.data.fechaIngreso),
      fechaEgreso: validation.data.fechaEgreso
        ? new Date(validation.data.fechaEgreso)
        : null,
      documentoPath,
    },
    include: { carrera: true },
  });

  return NextResponse.json({
    educacion: mapEducacion(row),
    institucion: institucionCatalogo,
  });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const auth = await requirePostulanteConDni();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await ownedEducacion(auth.postulanteId, id);
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.educacion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
