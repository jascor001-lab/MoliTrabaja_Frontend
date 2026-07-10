import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  mapConocimiento,
  requirePostulanteSession,
  validarConocimientoInput,
} from "@/lib/perfil-postulante";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const session = await requirePostulanteSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.conocimientoPostulante.findFirst({
    where: { id, postulanteId: session.postulanteId },
    include: { conocimiento: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const validation = validarConocimientoInput({
    conocimientoId: Number(body.conocimientoId ?? existing.conocimientoId),
    institucion: String(body.institucion ?? existing.institucion),
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  const row = await prisma.conocimientoPostulante.update({
    where: { id },
    data: {
      conocimientoId: validation.data.conocimientoId,
      institucion: validation.data.institucion ?? "",
    },
    include: { conocimiento: true },
  });

  return NextResponse.json({ conocimiento: mapConocimiento(row) });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const session = await requirePostulanteSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.conocimientoPostulante.findFirst({
    where: { id, postulanteId: session.postulanteId },
  });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.conocimientoPostulante.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
