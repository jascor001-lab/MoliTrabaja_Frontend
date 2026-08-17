import { NextRequest, NextResponse } from "next/server";

import { loadBasesArchivoRaw, persistBasesArchivo } from "@/lib/bases-persist";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pickLogoFromArchivos } from "@/lib/logo-oferta";
import { parseOfertaBody } from "@/lib/oferta-api-body";
import {
  OFERTA_INCLUDE,
  buildDescripcionOferta,
  enrichOfertaDTOWithBases,
  parseLogoArchivos,
  serializeJsonArray,
  syncContactosEmpresa,
  syncCronogramas,
  syncOfertaCatalogos,
  toOfertaDTO,
  upsertDireccion,
} from "@/lib/ofertas";
import { guardarArchivosOferta, guardarBasesOferta } from "@/lib/upload";
import { validarPayloadOferta } from "@/lib/validar-oferta-payload";
import { TIPOS_PUESTO } from "@/types/bolsa";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: params.id },
    include: OFERTA_INCLUDE,
  });

  if (!oferta) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  const dto = await enrichOfertaDTOWithBases(toOfertaDTO(oferta), prisma, params.id);
  return NextResponse.json(dto);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    const oferta = await prisma.ofertaLaboral.findUnique({
      where: { id },
      include: OFERTA_INCLUDE,
    });

    if (!oferta) {
      return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
    }

    let payload;
    let logoFiles: File[];
    let basesFile: File | null;

    try {
      ({ payload, logoFiles, basesFile } = await parseOfertaBody(request));
    } catch {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    }

    const existingLogos = parseLogoArchivos(oferta.logoArchivos);
    const existingBases = await loadBasesArchivoRaw(prisma, id);
    const validationError = validarPayloadOferta(
      payload,
      logoFiles,
      existingLogos.length,
      basesFile,
      !!existingBases
    );
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const {
      empresaId,
      enviarLogoPorCorreo,
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
      estado,
      aptoDiscapacidad,
    } = payload;

    if (empresaId !== oferta.empresaId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const session = await getSession();
    if (!session || session.tipo !== "empresa" || session.empresaId !== empresaId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const tiposValidos = (tipoPuesto ?? []).filter((t) =>
      TIPOS_PUESTO.includes(t as (typeof TIPOS_PUESTO)[number])
    );

    let logoArchivosMeta = existingLogos;
    if (enviarLogoPorCorreo) {
      logoArchivosMeta = [
        { name: "Pendiente por correo", path: "", size: 0, mimeType: "text/plain" },
      ];
    } else if (logoFiles.length > 0) {
      const nuevos = await guardarArchivosOferta(id, logoFiles);
      logoArchivosMeta = [...existingLogos, ...nuevos].slice(0, 5);
    }

    const logoPath = pickLogoFromArchivos(logoArchivosMeta);
    let basesMeta = existingBases;
    if (basesFile) {
      basesMeta = await guardarBasesOferta(id, basesFile);
    }

    const direccionTrabajoId = await upsertDireccion(
      prisma,
      direccionLiteral!,
      latitud,
      longitud
    );

    await prisma.ofertaLaboral.update({
      where: { id },
      data: {
        direccionTrabajoId,
        titulo: nombrePuesto!.trim(),
        perfil: perfil!.trim(),
        descripcion: buildDescripcionOferta(funciones!, beneficios!),
        tipoContrato: tipoContrato ?? "Indefinido",
        modalidad: modalidad!,
        salario: (salario ?? "A convenir").trim(),
        estado: estado ?? oferta.estado,
        logoArchivos: serializeJsonArray(logoArchivosMeta),
        tipoPuesto: serializeJsonArray(tiposValidos),
        cantidadVacantes: Number(cantidadVacantes),
        aptoDiscapacidad: Boolean(aptoDiscapacidad),
        funciones: funciones!.trim(),
        beneficios: beneficios!.trim(),
      },
    });

    await persistBasesArchivo(prisma, id, basesMeta);
    await syncCronogramas(prisma, id, cronogramas ?? []);
    await syncOfertaCatalogos(prisma, id, carreraIds ?? [], conocimientoIds ?? []);
    await syncContactosEmpresa(prisma, empresaId!, contactoPrincipal!, contactoGerente!);

    if (logoPath) {
      await prisma.empresa.update({
        where: { id: empresaId },
        data: { logo: logoPath },
      });
    }

    const updated = await prisma.ofertaLaboral.findUnique({
      where: { id },
      include: OFERTA_INCLUDE,
    });

    const dto = await enrichOfertaDTOWithBases(toOfertaDTO(updated!), prisma, id);
    return NextResponse.json(dto);
  } catch (e) {
    console.error("[PATCH /api/ofertas/[id]]", e);
    const msg = e instanceof Error ? e.message : "Error interno al guardar la oferta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
