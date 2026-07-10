import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createSession, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, validarCuentaRegistro } from "@/lib/password";
import { crearPostulanteConDireccion } from "@/lib/postulante-persist";
import { validarPostulanteInput } from "@/lib/validacion-postulante";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, string | number>;
    const password = String(body.password ?? "");

    const cuentaErrors = validarCuentaRegistro(String(body.correo ?? ""), password);
    if (Object.keys(cuentaErrors).length > 0) {
      return NextResponse.json(
        { error: "Revisa tu correo y contraseña", errors: cuentaErrors },
        { status: 422 }
      );
    }

    const validation = validarPostulanteInput({
      tipoDocId: Number(body.tipoDocId ?? 1),
      numeroDocumento: String(body.numeroDocumento ?? body.dni ?? ""),
      nombres: String(body.nombres ?? ""),
      apellidoPaterno: String(body.apellidoPaterno ?? ""),
      apellidoMaterno: String(body.apellidoMaterno ?? ""),
      fechaNacimiento: String(body.fechaNacimiento ?? ""),
      paisId: Number(body.paisId ?? 1),
      genero: body.genero as "Masculino" | "Femenino" | "Otro",
      estadoCivil: String(body.estadoCivil ?? "Soltero"),
      correo: String(body.correo ?? ""),
      telefono: String(body.telefono ?? ""),
      direccionLiteral: String(body.direccionLiteral ?? body.direccion ?? ""),
    });

    if (!validation.ok) {
      const errors = { ...validation.errors };
      if (errors.numeroDocumento) {
        errors.dni = errors.numeroDocumento;
      }
      if (errors.direccionLiteral) {
        errors.direccion = errors.direccionLiteral;
      }
      return NextResponse.json(
        { error: "Datos inválidos", errors },
        { status: 422 }
      );
    }

    const existsDoc = await prisma.postulante.findFirst({
      where: {
        tipoDocId: validation.data.tipoDocId,
        numeroDocumento: validation.data.numeroDocumento,
      },
    });
    if (existsDoc) {
      return NextResponse.json(
        { error: "Ya existe un perfil con ese documento. Inicia sesión." },
        { status: 409 }
      );
    }

    const existsEmail = await prisma.postulante.findUnique({
      where: { correo: validation.data.correo.toLowerCase() },
    });
    if (existsEmail) {
      return NextResponse.json(
        { error: "Ya existe un perfil con ese correo" },
        { status: 409 }
      );
    }

    const postulante = await crearPostulanteConDireccion(
      prisma,
      validation.data,
      hashPassword(password)
    );

    const session = await createSession({
      tipo: "postulante",
      postulanteId: postulante.id,
    });
    cookies().set(sessionCookieOptions(session.token));

    return NextResponse.json(
      { ok: true, postulanteId: postulante.id, redirect: "/personal" },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/auth/registro/postulante]", e);
    return NextResponse.json({ error: "Error al registrar postulante" }, { status: 500 });
  }
}
