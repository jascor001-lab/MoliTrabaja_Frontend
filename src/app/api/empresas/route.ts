import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { toEmpresaDTO } from "@/lib/ofertas";

export async function GET() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(empresas.map(toEmpresaDTO));
}
