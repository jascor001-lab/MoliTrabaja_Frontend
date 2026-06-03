import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { toEmpresaDTO } from "@/lib/ofertas";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = params;

  const empresa = await prisma.empresa.findUnique({ where: { id } });

  if (!empresa) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  return NextResponse.json(toEmpresaDTO(empresa));
}
