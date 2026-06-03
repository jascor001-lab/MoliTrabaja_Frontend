import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toEmpresaDTO } from "@/lib/ofertas";

export async function GET() {
  const session = await getSession();
  if (!session || session.tipo !== "empresa" || !session.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: session.empresaId },
    include: { contactos: true },
  });
  if (!empresa) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    ...toEmpresaDTO(empresa),
    email: empresa.email,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.tipo !== "empresa" || !session.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    nombre?: string;
    razonSocial?: string;
    rubro?: string;
    descripcion?: string;
    telefono?: string;
    paginaWeb?: string;
  };

  const updated = await prisma.empresa.update({
    where: { id: session.empresaId },
    data: {
      ...(body.nombre?.trim() ? { nombre: body.nombre.trim() } : {}),
      ...(body.razonSocial?.trim() ? { razonSocial: body.razonSocial.trim() } : {}),
      ...(body.rubro?.trim() ? { rubro: body.rubro.trim() } : {}),
      ...(body.telefono !== undefined ? { telefono: body.telefono.trim() } : {}),
      ...(body.paginaWeb !== undefined ? { paginaWeb: body.paginaWeb.trim() } : {}),
      ...(body.descripcion !== undefined
        ? { descripcion: body.descripcion.trim() || null }
        : {}),
    },
    include: { contactos: true },
  });

  return NextResponse.json({
    ...toEmpresaDTO(updated),
    email: updated.email,
  });
}
