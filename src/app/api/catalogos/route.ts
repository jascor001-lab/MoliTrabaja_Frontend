import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const [tiposDoc, paises, carreras, conocimientos, instituciones] =
    await Promise.all([
      prisma.tipoDoc.findMany({ orderBy: { id: "asc" } }),
      prisma.pais.findMany({ orderBy: { nombre: "asc" } }),
      prisma.catalogoCarrera.findMany({ orderBy: { nombre: "asc" } }),
      prisma.catalogoConocimiento.findMany({
        orderBy: [{ grupo: "asc" }, { nombre: "asc" }],
      }),
      prisma.catalogoInstitucion.findMany({ orderBy: { nombre: "asc" } }),
    ]);

  return NextResponse.json({
    tiposDoc,
    paises,
    carreras,
    conocimientos,
    instituciones,
  });
}
