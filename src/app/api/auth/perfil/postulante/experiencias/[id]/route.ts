import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  mapExpLaboral,
  requirePostulanteSession,
  validarExpLaboralInput,
} from "@/lib/perfil-postulante";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const session = await requirePostulanteSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.expLaboral.findFirst({
    where: { id, postulanteId: session.postulanteId },
  });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const validation = validarExpLaboralInput({
    sector: String(body.sector ?? existing.sector),
    empresa: String(body.empresa ?? existing.empresa),
    puesto: String(body.puesto ?? existing.puesto),
    fechaInicio: String(
      body.fechaInicio ?? existing.fechaInicio.toISOString().slice(0, 10)
    ),
    fechaFin: body.fechaFin
      ? String(body.fechaFin)
      : existing.fechaFin
        ? existing.fechaFin.toISOString().slice(0, 10)
        : undefined,
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  const row = await prisma.expLaboral.update({
    where: { id },
    data: {
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

  return NextResponse.json({ experiencia: mapExpLaboral(row) });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const session = await requirePostulanteSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.expLaboral.findFirst({
    where: { id, postulanteId: session.postulanteId },
  });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.expLaboral.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
