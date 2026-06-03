import { NextRequest, NextResponse } from "next/server";

import { persistBasesArchivo } from "@/lib/bases-persist";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pickLogoFromArchivos } from "@/lib/logo-oferta";
import { parseOfertaBody } from "@/lib/oferta-api-body";
import {
  OFERTA_INCLUDE,
  buildDescripcionOferta,
  enrichOfertaDTOWithBases,
  serializeJsonArray,
  syncContactosEmpresa,
  syncCronogramas,
  syncOfertaCatalogos,
  toOfertaDTO,
  upsertDireccion,
} from "@/lib/ofertas";
import { guardarArchivosOferta, guardarBasesOferta } from "@/lib/upload";
import { validarPayloadOferta } from "@/lib/validar-oferta-payload";
import { MODALIDADES } from "@/types/bolsa";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim().toLowerCase();
  const modalidad = searchParams.get("modalidad");
  const empresaId = searchParams.get("empresaId");
  const estado = searchParams.get("estado") ?? "Activa";

  const ofertas = await prisma.ofertaLaboral.findMany({
    where: {
      estado,
      ...(empresaId ? { empresaId } : {}),
      ...(modalidad && MODALIDADES.includes(modalidad as (typeof MODALIDADES)[number])
        ? { modalidad }
        : {}),
    },
    include: OFERTA_INCLUDE,
    orderBy: { fechaPublicacion: "desc" },
  });

  let result = ofertas.map((o) => toOfertaDTO(o));

  if (q) {
    result = result.filter((o) => {
      const haystack = [
        o.titulo,
        o.perfil,
        o.descripcion,
        o.empresa?.nombre,
        o.empresa?.razonSocial,
        ...o.carrerasRequeridas.map((c) => c.nombre),
        ...o.conocimientosRequeridos.map((c) => c.nombre),
        ...o.tipoPuesto,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    let payload;
    let logoFiles: File[];
    let basesFile: File | null;

    try {
      ({ payload, logoFiles, basesFile } = await parseOfertaBody(request));
    } catch {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    }

    const validationError = validarPayloadOferta(payload, logoFiles, 0, basesFile, false);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const {
      empresaId,
      nombrePuesto,
      perfil,
      tipoContrato,
      tipoPuesto,
      cantidadVacantes,
      funciones,
      beneficios,
      modalidad,
      salario,
      direccionLiteral,
      latitud,
      longitud,
      carreraIds,
      conocimientoIds,
      cronogramas,
      contactoPrincipal,
      contactoGerente,
      enviarLogoPorCorreo,
    } = payload;

    if (!empresaId || !modalidad || !MODALIDADES.includes(modalidad)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.tipo !== "empresa" || session.empresaId !== empresaId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const direccionTrabajoId = await upsertDireccion(
      prisma,
      direccionLiteral!,
      latitud,
      longitud
    );

    const oferta = await prisma.ofertaLaboral.create({
      data: {
        empresaId,
        direccionTrabajoId,
        titulo: nombrePuesto!.trim(),
        perfil: perfil!.trim(),
        descripcion: buildDescripcionOferta(funciones!, beneficios!),
        tipoContrato: tipoContrato ?? "Indefinido",
        modalidad,
        salario: (salario ?? "A convenir").trim(),
        estado: "Activa",
        logoArchivos: serializeJsonArray(
          enviarLogoPorCorreo
            ? [{ name: "Pendiente por correo", path: "", size: 0, mimeType: "text/plain" }]
            : []
        ),
        tipoPuesto: serializeJsonArray(tipoPuesto ?? []),
        cantidadVacantes: Number(cantidadVacantes),
        funciones: funciones!.trim(),
        beneficios: beneficios!.trim(),
      },
      include: OFERTA_INCLUDE,
    });

    await syncCronogramas(prisma, oferta.id, cronogramas ?? []);
    await syncOfertaCatalogos(
      prisma,
      oferta.id,
      carreraIds ?? [],
      conocimientoIds ?? []
    );
    await syncContactosEmpresa(
      prisma,
      empresaId,
      contactoPrincipal!,
      contactoGerente!
    );

    let logoPath: string | null = null;
    if (logoFiles.length > 0) {
      const logoMeta = await guardarArchivosOferta(oferta.id, logoFiles);
      logoPath = pickLogoFromArchivos(logoMeta);
      await prisma.ofertaLaboral.update({
        where: { id: oferta.id },
        data: { logoArchivos: serializeJsonArray(logoMeta) },
      });
    }

    if (basesFile) {
      const basesMeta = await guardarBasesOferta(oferta.id, basesFile);
      await persistBasesArchivo(prisma, oferta.id, basesMeta);
    }

    if (logoPath) {
      await prisma.empresa.update({
        where: { id: empresaId },
        data: { logo: logoPath },
      });
    }

    const updated = await prisma.ofertaLaboral.findUnique({
      where: { id: oferta.id },
      include: OFERTA_INCLUDE,
    });

    const dto = await enrichOfertaDTOWithBases(
      toOfertaDTO(updated!),
      prisma,
      oferta.id
    );

    return NextResponse.json(dto, { status: 201 });
  } catch (e) {
    console.error("[POST /api/ofertas]", e);
    const msg = e instanceof Error ? e.message : "Error interno al publicar la oferta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
