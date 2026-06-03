import type { PrismaClient } from "@prisma/client";

import type { PostulanteFormInput } from "@/lib/validacion-postulante";

export async function crearPostulanteConDireccion(
  prisma: PrismaClient,
  data: PostulanteFormInput,
  passwordHash: string
) {
  const direccion = await prisma.direccion.create({
    data: {
      direccionLiteral: data.direccionLiteral,
      latitud: data.latitud?.trim() || null,
      longitud: data.longitud?.trim() || null,
    },
  });

  return prisma.postulante.create({
    data: {
      tipoDocId: data.tipoDocId,
      numeroDocumento: data.numeroDocumento,
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      fechaNacimiento: new Date(data.fechaNacimiento),
      paisId: data.paisId,
      genero: data.genero,
      estadoCivil: data.estadoCivil,
      correo: data.correo.toLowerCase(),
      telefono: data.telefono,
      direccionId: direccion.id,
      passwordHash,
    },
    include: { direccion: true, tipoDoc: true, pais: true },
  });
}

export async function actualizarDireccionPostulante(
  prisma: PrismaClient,
  postulanteId: string,
  direccionId: string | null,
  literal: string,
  latitud?: string,
  longitud?: string
) {
  const trimmed = literal.trim();
  if (direccionId) {
    await prisma.direccion.update({
      where: { id: direccionId },
      data: {
        direccionLiteral: trimmed,
        latitud: latitud?.trim() || null,
        longitud: longitud?.trim() || null,
      },
    });
    return direccionId;
  }
  const dir = await prisma.direccion.create({
    data: {
      direccionLiteral: trimmed,
      latitud: latitud?.trim() || null,
      longitud: longitud?.trim() || null,
    },
  });
  await prisma.postulante.update({
    where: { id: postulanteId },
    data: { direccionId: dir.id },
  });
  return dir.id;
}
