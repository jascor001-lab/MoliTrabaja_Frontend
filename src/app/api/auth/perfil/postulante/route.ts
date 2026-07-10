import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  mapConocimiento,
  mapEducacion,
  mapExpLaboral,
} from "@/lib/perfil-postulante";
import { numeroDocumentoDe } from "@/lib/postulante-doc";
import { actualizarDireccionPostulante } from "@/lib/postulante-persist";
import { validarPostulanteInput } from "@/lib/validacion-postulante";

export async function GET() {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const p = await prisma.postulante.findUnique({
    where: { id: session.postulanteId },
    include: {
      direccion: true,
      tipoDoc: true,
      pais: true,
      experiencias: true,
      educaciones: { include: { carrera: true } },
      conocimientos: { include: { conocimiento: true } },
    },
  });
  if (!p) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: p.id,
    tipoDocId: p.tipoDocId,
    tipoDoc: p.tipoDoc,
    numeroDocumento: p.numeroDocumento,
    dni: p.numeroDocumento,
    nombres: p.nombres,
    apellidoPaterno: p.apellidoPaterno,
    apellidoMaterno: p.apellidoMaterno,
    fechaNacimiento: p.fechaNacimiento.toISOString().slice(0, 10),
    paisId: p.paisId,
    pais: p.pais,
    genero: p.genero,
    estadoCivil: p.estadoCivil,
    correo: p.correo,
    telefono: p.telefono,
    direccionLiteral: p.direccion?.direccionLiteral ?? "",
    direccion: p.direccion?.direccionLiteral ?? "",
    latitud: p.direccion?.latitud ?? "",
    longitud: p.direccion?.longitud ?? "",
    cvPath: p.cvPath,
    experiencias: p.experiencias.map(mapExpLaboral),
    educaciones: p.educaciones.map(mapEducacion),
    conocimientos: p.conocimientos.map(mapConocimiento),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, string | number>;
  const current = await prisma.postulante.findUnique({
    where: { id: session.postulanteId },
    include: { direccion: true },
  });
  if (!current) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const validation = validarPostulanteInput({
    tipoDocId: current.tipoDocId,
    numeroDocumento: current.numeroDocumento,
    nombres: String(body.nombres ?? current.nombres),
    apellidoPaterno: String(body.apellidoPaterno ?? current.apellidoPaterno),
    apellidoMaterno: String(body.apellidoMaterno ?? current.apellidoMaterno),
    fechaNacimiento:
      String(body.fechaNacimiento) ||
      current.fechaNacimiento.toISOString().slice(0, 10),
    paisId: Number(body.paisId ?? current.paisId),
    genero: (String(body.genero ?? current.genero)) as "Masculino" | "Femenino" | "Otro",
    estadoCivil: String(body.estadoCivil ?? current.estadoCivil),
    correo: current.correo,
    telefono: String(body.telefono ?? current.telefono),
    direccionLiteral: String(
      body.direccionLiteral ?? body.direccion ?? current.direccion?.direccionLiteral ?? ""
    ),
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Datos inválidos", errors: validation.errors },
      { status: 422 }
    );
  }

  await actualizarDireccionPostulante(
    prisma,
    session.postulanteId,
    current.direccionId,
    validation.data.direccionLiteral,
    validation.data.latitud,
    validation.data.longitud
  );

  await prisma.postulante.update({
    where: { id: session.postulanteId },
    data: {
      nombres: validation.data.nombres,
      apellidoPaterno: validation.data.apellidoPaterno,
      apellidoMaterno: validation.data.apellidoMaterno,
      fechaNacimiento: new Date(validation.data.fechaNacimiento),
      paisId: validation.data.paisId,
      genero: validation.data.genero,
      estadoCivil: validation.data.estadoCivil,
      telefono: validation.data.telefono,
    },
  });

  const full = await prisma.postulante.findUnique({
    where: { id: session.postulanteId },
    include: {
      direccion: true,
      tipoDoc: true,
      pais: true,
      experiencias: true,
      educaciones: { include: { carrera: true } },
      conocimientos: { include: { conocimiento: true } },
    },
  });

  if (!full) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: full.id,
    dni: numeroDocumentoDe(full),
    numeroDocumento: full.numeroDocumento,
    nombres: full.nombres,
    apellidoPaterno: full.apellidoPaterno,
    apellidoMaterno: full.apellidoMaterno,
    fechaNacimiento: full.fechaNacimiento.toISOString().slice(0, 10),
    paisId: full.paisId,
    genero: full.genero,
    estadoCivil: full.estadoCivil,
    correo: full.correo,
    telefono: full.telefono,
    direccion: full.direccion?.direccionLiteral ?? "",
    direccionLiteral: full.direccion?.direccionLiteral ?? "",
    latitud: full.direccion?.latitud ?? "",
    longitud: full.direccion?.longitud ?? "",
    cvPath: full.cvPath,
    experiencias: full.experiencias.map(mapExpLaboral),
    educaciones: full.educaciones.map(mapEducacion),
    conocimientos: full.conocimientos.map(mapConocimiento),
  });
}
