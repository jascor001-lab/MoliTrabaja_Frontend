import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { resolveCvFile } from "@/lib/cv-access";
import { extraerTextoCv, parsearCvTexto } from "@/lib/cv-parser";
import { buildDashboardDual, generarCodigoPostulacion } from "@/lib/dashboard-postulacion";
import { prisma } from "@/lib/db";
import { calcularMatchScorePercentage } from "@/lib/match-score";
import { actualizarDireccionPostulante } from "@/lib/postulante-persist";
import {
  validarPostulanteInput,
  type PostulanteFormInput,
} from "@/lib/validacion-postulante";
import type { EstadoCivil } from "@/types/catalogos";
import type { Genero } from "@/types/postulacion";

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

    if (!jobId) {
      return NextResponse.json({ error: "job_id es obligatorio" }, { status: 400 });
    }

    const perfilDb = await prisma.postulante.findUnique({
      where: { id: session.postulanteId },
      include: { direccion: true, tipoDoc: true },
    });
    if (!perfilDb) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const existente = await prisma.postulacion.findUnique({
      where: {
        ofertaId_postulanteId: {
          ofertaId: jobId,
          postulanteId: session.postulanteId,
        },
      },
    });
    if (existente) {
      return NextResponse.json(
        {
          error:
            "Ya postulaste a esta vacante. El CV se envió una sola vez y no se puede cambiar aquí. Puedes actualizar tu CV en Mi perfil para futuras postulaciones.",
        },
        { status: 409 }
      );
    }

    const cvFile = await resolveCvFile(perfilDb.cvPath);
    if (!cvFile) {
      return NextResponse.json(
        {
          error: "Sube y guarda tu CV en Mi perfil → Curriculum antes de postular.",
          redirect: "/personal/perfil",
        },
        { status: 422 }
      );
    }

    const telefonoForm = String(form.get("telefono") ?? "").trim();
    const direccionForm = String(
      form.get("direccionLiteral") ?? form.get("direccion") ?? ""
    ).trim();

    const rawInput: Partial<PostulanteFormInput> = {
      tipoDocId: perfilDb.tipoDocId,
      tipoDocAbrev: perfilDb.tipoDoc.abrev,
      numeroDocumento: perfilDb.numeroDocumento,
      nombres: perfilDb.nombres,
      apellidoPaterno: perfilDb.apellidoPaterno,
      apellidoMaterno: perfilDb.apellidoMaterno,
      fechaNacimiento: perfilDb.fechaNacimiento.toISOString().slice(0, 10),
      paisId: perfilDb.paisId,
      genero: perfilDb.genero as Genero,
      estadoCivil: perfilDb.estadoCivil as EstadoCivil,
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
    const buffer = await readFile(cvFile.absolutePath);
    const textoCv = await extraerTextoCv(buffer, cvFile.fileName);
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

    // Snapshot: path actual del perfil; si luego lo reemplazan, la empresa sigue viendo este.
    const cvSnapshotPath = perfilDb.cvPath!;

    await actualizarDireccionPostulante(
      prisma,
      session.postulanteId,
      perfilDb.direccionId,
      validation.data.direccionLiteral
    );

    await prisma.postulante.update({
      where: { id: session.postulanteId },
      data: {
        telefono: validation.data.telefono,
        cvParsed: JSON.stringify(cvParsed),
      },
    });

    await prisma.postulacion.create({
      data: {
        codigo: generarCodigoPostulacion(),
        ofertaId: jobId,
        postulanteId: session.postulanteId,
        estadoSeguimiento: "En Revisión",
        matchScore,
        rankingFit: rankingFromScore(matchScore),
        cvPath: cvSnapshotPath,
      },
    });

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

    return NextResponse.json(payload, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al procesar postulación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
