import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireEmpresa() {
  const session = await getSession();
  if (!session || session.tipo !== "empresa" || !session.empresaId) {
    redirect("/ingreso?tipo=empresa");
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: session.empresaId },
  });

  if (!empresa) {
    redirect("/ingreso?tipo=empresa");
  }

  return empresa;
}

export async function requirePostulante() {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    redirect("/ingreso?tipo=postulante");
  }

  const postulante = await prisma.postulante.findUnique({
    where: { id: session.postulanteId },
  });

  if (!postulante) {
    redirect("/ingreso?tipo=postulante");
  }

  return postulante;
}

export async function assertEmpresaOwnsOferta(empresaId: string, ofertaId: string) {
  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: ofertaId },
    select: { empresaId: true },
  });
  if (!oferta || oferta.empresaId !== empresaId) {
    throw new Error("No autorizado");
  }
}
