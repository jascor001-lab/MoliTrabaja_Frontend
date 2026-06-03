import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { buildDashboardDual, generarCodigoPostulacion } from "@/lib/dashboard-postulacion";
import { calcularMatchScorePercentage } from "@/lib/match-score";
import { extraerTextoCv, parsearCvTexto } from "@/lib/cv-parser";
import { prisma } from "@/lib/db";
import { actualizarDireccionPostulante } from "@/lib/postulante-persist";
import { guardarCvPostulante } from "@/lib/upload-cv";
import { validarPostulanteInput } from "@/lib/validacion-postulante";
import type { PostulanteInput } from "@/types/postulacion";

function rankingFromScore(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.tipo !== "postulante" || !session.postulanteId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión como postulante para postular" },
        { status: 401 }
      );
    }

    const form = await request.formData();
    const jobId = String(form.get("job_id") ?? "").trim();
    const cvFile = form.get("cv");

    if (!jobId) {
      return NextResponse.json({ error: "job_id es obligatorio" }, { status: 400 });
    }

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      return NextResponse.json({ error: "El CV es obligatorio" }, { status: 400 });
    }

    const rawInput: Partial<PostulanteInput> = {
      tipoDocId: Number(form.get("tipoDocId") ?? 1),
      numeroDocumento: String(form.get("numeroDocumento") ?? form.get("dni") ?? ""),
      nombres: String(form.get("nombres") ?? ""),
      apellidoPaterno: String(form.get("apellidoPaterno") ?? ""),
      apellidoMaterno: String(form.get("apellidoMaterno") ?? ""),
      fechaNacimiento: String(form.get("fechaNacimiento") ?? ""),
      paisId: Number(form.get("paisId") ?? 1),
      genero: String(form.get("genero") ?? "") as PostulanteInput["genero"],
      estadoCivil: String(form.get("estadoCivil") ?? "Soltero") as PostulanteInput["estadoCivil"],
      correo: String(form.get("correo") ?? ""),
      telefono: String(form.get("telefono") ?? ""),
      direccionLiteral: String(form.get("direccionLiteral") ?? form.get("direccion") ?? ""),
    };

    const validation = validarPostulanteInput(rawInput);
    if (!validation.ok) {
      return NextResponse.json(
        { error: "Validación fallida", errors: validation.errors },
        { status: 422 }
      );
    }

    const perfil = await prisma.postulante.findUnique({
      where: { id: session.postulanteId },
      select: { numeroDocumento: true },
    });

    if (validation.data.numeroDocumento !== perfil?.numeroDocumento) {
      return NextResponse.json(
        { error: "El documento no coincide con tu perfil registrado" },
        { status: 403 }
      );
    }

    const oferta = await prisma.ofertaLaboral.findUnique({
      where: { id: jobId },
      include: {
        carreras: { include: { carrera: true } },
        conocimientos: { include: { conocimiento: true } },
      },
    });

    if (!oferta || oferta.estado !== "Activa") {
      return NextResponse.json({ error: "Oferta no disponible" }, { status: 404 });
    }

    const conocimientosReq = oferta.conocimientos.map((k) => k.conocimiento.nombre);
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    const textoCv = await extraerTextoCv(buffer, cvFile.name);
    const cvParsed = parsearCvTexto(textoCv, conocimientosReq);

    const matchOferta = {
      titulo: oferta.titulo,
      funciones: oferta.funciones,
      descripcion: oferta.descripcion,
      perfil: oferta.perfil,
      carreras: oferta.carreras.map((c) => c.carrera.nombre),
      conocimientos: conocimientosReq,
    };
    const matchScore = calcularMatchScorePercentage(cvParsed, matchOferta);

    const { path: cvPath } = await guardarCvPostulante(
      validation.data.numeroDocumento,
      cvFile
    );

    const current = await prisma.postulante.findUnique({
      where: { id: session.postulanteId },
    });
    if (!current) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    await actualizarDireccionPostulante(
      prisma,
      session.postulanteId,
      current.direccionId,
      validation.data.direccionLiteral
    );

    const postulante = await prisma.postulante.update({
      where: { id: session.postulanteId },
      data: {
        nombres: validation.data.nombres,
        apellidoPaterno: validation.data.apellidoPaterno,
        apellidoMaterno: validation.data.apellidoMaterno,
        fechaNacimiento: new Date(validation.data.fechaNacimiento),
        genero: validation.data.genero,
        estadoCivil: validation.data.estadoCivil,
        correo: validation.data.correo,
        telefono: validation.data.telefono,
        cvPath,
        cvParsed: JSON.stringify(cvParsed),
      },
    });

    const existente = await prisma.postulacion.findUnique({
      where: {
        ofertaId_postulanteId: { ofertaId: jobId, postulanteId: postulante.id },
      },
    });

    if (!existente) {
      await prisma.postulacion.create({
        data: {
          codigo: generarCodigoPostulacion(),
          ofertaId: jobId,
          postulanteId: postulante.id,
          estadoSeguimiento: "En Revisión",
          matchScore,
          rankingFit: rankingFromScore(matchScore),
        },
      });
    }

    const ofertaFull = await prisma.ofertaLaboral.findUnique({
      where: { id: jobId },
      include: {
        carreras: { include: { carrera: true } },
        conocimientos: { include: { conocimiento: true } },
        postulaciones: {
          include: {
            postulante: {
              include: {
                direccion: true,
                conocimientos: { include: { conocimiento: true } },
                educaciones: { include: { carrera: true } },
              },
            },
          },
        },
      },
    });

    if (!ofertaFull) {
      return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
    }

    const payload = buildDashboardDual({
      oferta: ofertaFull,
      postulaciones: ofertaFull.postulaciones,
      targetDni: validation.data.numeroDocumento,
      includeProfile: true,
    });

    return NextResponse.json(payload, { status: existente ? 200 : 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al procesar postulación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
