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

export async function POST(request: NextRequest) {
  const auth = await requirePostulanteConDni();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { fields, documento } = await parsePerfilItemForm(request);
  const validation = validarEducacionInput({
    carreraId: Number(fields.carreraId),
    tipoEstudio: fields.tipoEstudio ?? "",
    institucion: fields.institucion ?? "",
    ordenMerito: fields.ordenMerito ?? "No aplica",
    fechaIngreso: fields.fechaIngreso ?? "",
    fechaEgreso: fields.fechaEgreso || undefined,
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  const carrera = await prisma.catalogoCarrera.findUnique({
    where: { id: validation.data.carreraId },
  });
  if (!carrera) {
    return NextResponse.json({ error: "Carrera no encontrada" }, { status: 400 });
  }

  const institucionCatalogo = await asegurarInstitucionCatalogo(
    validation.data.institucion
  );

  const row = await prisma.educacion.create({
    data: {
      postulanteId: auth.postulanteId,
      carreraId: validation.data.carreraId,
      tipoEstudio: validation.data.tipoEstudio,
      institucion: validation.data.institucion,
      ordenMerito: validation.data.ordenMerito,
      fechaIngreso: new Date(validation.data.fechaIngreso),
      fechaEgreso: validation.data.fechaEgreso
        ? new Date(validation.data.fechaEgreso)
        : null,
    },
    include: { carrera: true },
  });

  if (documento) {
    try {
      const saved = await guardarDocumentoPerfil(
        auth.dni,
        "educacion",
        row.id,
        documento
      );
      const updated = await prisma.educacion.update({
        where: { id: row.id },
        data: { documentoPath: saved.path },
        include: { carrera: true },
      });
      return NextResponse.json(
        {
          educacion: mapEducacion(updated),
          institucion: institucionCatalogo,
        },
        { status: 201 }
      );
    } catch (e) {
      await prisma.educacion.delete({ where: { id: row.id } });
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "No se pudo guardar el archivo" },
        { status: 422 }
      );
    }
  }

  return NextResponse.json(
    {
      educacion: mapEducacion(row),
      institucion: institucionCatalogo,
    },
    { status: 201 }
  );
}
