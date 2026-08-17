import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  mapExpLaboral,
  parsePerfilItemForm,
  requirePostulanteConDni,
  validarExpLaboralInput,
} from "@/lib/perfil-postulante";
import { guardarDocumentoPerfil } from "@/lib/upload-perfil-doc";

export async function POST(request: NextRequest) {
  const auth = await requirePostulanteConDni();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { fields, documento } = await parsePerfilItemForm(request);
  const validation = validarExpLaboralInput({
    sector: fields.sector ?? "",
    empresa: fields.empresa ?? "",
    puesto: fields.puesto ?? "",
    fechaInicio: fields.fechaInicio ?? "",
    fechaFin: fields.fechaFin || undefined,
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  const row = await prisma.expLaboral.create({
    data: {
      postulanteId: auth.postulanteId,
      sector: validation.data.sector,
      empresa: validation.data.empresa,
      puesto: validation.data.puesto,
      tiempoMeses: validation.data.tiempoMeses,
      fechaInicio: new Date(validation.data.fechaInicio),
      fechaFin: validation.data.fechaFin
        ? new Date(validation.data.fechaFin)
        : null,
    },
  });

  if (documento) {
    try {
      const saved = await guardarDocumentoPerfil(
        auth.dni,
        "experiencia",
        row.id,
        documento
      );
      const updated = await prisma.expLaboral.update({
        where: { id: row.id },
        data: { documentoPath: saved.path },
      });
      return NextResponse.json({ experiencia: mapExpLaboral(updated) }, { status: 201 });
    } catch (e) {
      await prisma.expLaboral.delete({ where: { id: row.id } });
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "No se pudo guardar el archivo" },
        { status: 422 }
      );
    }
  }

  return NextResponse.json({ experiencia: mapExpLaboral(row) }, { status: 201 });
}
