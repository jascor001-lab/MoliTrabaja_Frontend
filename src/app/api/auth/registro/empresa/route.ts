import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createSession, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, validarPasswordRegistro } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      nombre?: string;
      razonSocial?: string;
      ruc?: string;
      rubro?: string;
      email?: string;
      password?: string;
      descripcion?: string;
      telefono?: string;
      paginaWeb?: string;
      contactoNombres?: string;
      contactoPaterno?: string;
      contactoCorreo?: string;
      contactoCelular?: string;
    };

    const nombre = body.nombre?.trim();
    const razonSocial = body.razonSocial?.trim() || nombre;
    const ruc = body.ruc?.trim();
    const rubro = body.rubro?.trim() || "General";
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const descripcion = body.descripcion?.trim() || null;
    const telefono = body.telefono?.trim() || "";
    const paginaWeb = body.paginaWeb?.trim() || "";

    if (!nombre || !ruc || !email || !password) {
      return NextResponse.json({ error: "Completa todos los campos obligatorios" }, { status: 400 });
    }
    if (!/^\d{11}$/.test(ruc)) {
      return NextResponse.json({ error: "El RUC debe tener 11 dígitos" }, { status: 400 });
    }
    const pwdErr = validarPasswordRegistro(password);
    if (pwdErr) return NextResponse.json({ error: pwdErr }, { status: 400 });

    const exists = await prisma.empresa.findFirst({
      where: { OR: [{ ruc }, { email }] },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Ya existe una empresa con ese RUC o correo" },
        { status: 409 }
      );
    }

    const empresa = await prisma.empresa.create({
      data: {
        nombre,
        razonSocial: razonSocial ?? nombre,
        ruc,
        rubro,
        email,
        telefono,
        paginaWeb,
        passwordHash: hashPassword(password),
        descripcion,
      },
    });

    if (body.contactoNombres && body.contactoCorreo) {
      await prisma.contactoEmpresa.create({
        data: {
          empresaId: empresa.id,
          nombres: body.contactoNombres.trim(),
          apellidoPaterno: body.contactoPaterno?.trim() || "",
          correo: body.contactoCorreo.trim(),
          celular: body.contactoCelular?.trim() || telefono,
          esPrincipal: true,
          esGerente: false,
        },
      });
    }

    const session = await createSession({ tipo: "empresa", empresaId: empresa.id });
    cookies().set(sessionCookieOptions(session.token));

    return NextResponse.json(
      { ok: true, empresaId: empresa.id, redirect: "/empresa" },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/auth/registro/empresa]", e);
    return NextResponse.json({ error: "Error al registrar la empresa" }, { status: 500 });
  }
}
