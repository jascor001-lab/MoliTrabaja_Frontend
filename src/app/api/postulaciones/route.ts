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

    const perfilDb = await prisma.postulante.findUnique({
      where: { id: session.postulanteId },
      include: { direccion: true },
    });
    if (!perfilDb) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const telefonoForm = String(form.get("telefono") ?? "").trim();
    const direccionForm = String(
      form.get("direccionLiteral") ?? form.get("direccion") ?? ""
    ).trim();

    const rawInput: Partial<PostulanteInput> = {
      tipoDocId: perfilDb.tipoDocId,
      numeroDocumento: perfilDb.numeroDocumento,
      nombres: perfilDb.nombres,
      apellidoPaterno: perfilDb.apellidoPaterno,
      apellidoMaterno: perfilDb.apellidoMaterno,
      fechaNacimiento: perfilDb.fechaNacimiento.toISOString().slice(0, 10),
      paisId: perfilDb.paisId,
      genero: perfilDb.genero,
      estadoCivil: perfilDb.estadoCivil,
      correo: perfilDb.correo,
      telefono: telefonoForm || perfilDb.telefono,
      direccionLiteral:
        direccionForm || perfilDb.direccion?.direccionLiteral || "",
    };

    const validation = validarPostulanteInput(rawInput);
    if (!validation.ok) {
      return NextResponse.json(
        {
          error: "Completa tu perfil antes de postular",
          errors: validation.errors,
          redirect: "/personal/perfil",
        },
        { status: 422 }
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

    await actualizarDireccionPostulante(
      prisma,
      session.postulanteId,
      perfilDb.direccionId,
      validation.data.direccionLiteral
    );

    const postulante = await prisma.postulante.update({
      where: { id: session.postulanteId },
      data: {
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
