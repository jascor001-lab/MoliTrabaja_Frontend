import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  asegurarInstitucionCatalogo,
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
    conocimientoNombre: fields.conocimientoNombre ?? "",
    institucion: fields.institucion ?? "",
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  let conocimiento = validation.data.conocimientoId
    ? await prisma.catalogoConocimiento.findUnique({
        where: { id: validation.data.conocimientoId },
      })
    : await prisma.catalogoConocimiento.findFirst({
        where: { nombre: validation.data.conocimientoNombre! },
      });

  if (!conocimiento && validation.data.conocimientoNombre) {
    conocimiento = await prisma.catalogoConocimiento.create({
      data: {
        nombre: validation.data.conocimientoNombre,
        grupo: "Personalizado",
      },
    });
  }
  if (!conocimiento) {
    return NextResponse.json({ error: "Conocimiento no encontrado" }, { status: 400 });
  }

  const duplicado = await prisma.conocimientoPostulante.findFirst({
    where: {
      postulanteId: auth.postulanteId,
      conocimientoId: conocimiento.id,
    },
  });
  if (duplicado) {
    return NextResponse.json(
      { error: "Ya registraste este conocimiento en tu perfil." },
      { status: 409 }
    );
  }

  const institucionCatalogo = await asegurarInstitucionCatalogo(
    validation.data.institucion
  );

  const row = await prisma.conocimientoPostulante.create({
    data: {
      postulanteId: auth.postulanteId,
      conocimientoId: conocimiento.id,
      institucion: validation.data.institucion,
    },
    include: { conocimiento: true },
  });

  if (documento) {
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
      return NextResponse.json(
        {
          conocimiento: mapConocimiento(updated),
          catalogoConocimiento: conocimiento,
          institucion: institucionCatalogo,
        },
        { status: 201 }
      );
    } catch (e) {
      await prisma.conocimientoPostulante.delete({ where: { id: row.id } });
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "No se pudo guardar el archivo" },
        { status: 422 }
      );
    }
  }

  return NextResponse.json(
    {
      conocimiento: mapConocimiento(row),
      catalogoConocimiento: conocimiento,
      institucion: institucionCatalogo,
    },
    { status: 201 }
  );
}
