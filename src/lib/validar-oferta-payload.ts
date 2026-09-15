import { erroresPaso1, erroresPaso2, erroresPaso3, hasFieldErrors } from "@/lib/validacion-oferta";
import { ESTADOS_OFERTA, MODALIDADES, TIPOS_PUESTO } from "@/types/bolsa";
import type { PayloadConFlags } from "@/lib/oferta-api-body";

export function validarLogo(
  logoFilesCount: number,
  existingLogosCount: number
): string | null {
  if (logoFilesCount > 0 || existingLogosCount > 0) return null;
  return "Adjunta el logo de la empresa (imagen PNG o JPG).";
}

export function validarBases(
  basesFile: File | null,
  hasExistingBases: boolean
): string | null {
  if (basesFile || hasExistingBases) return null;
  return "Adjunta las bases de la convocatoria en PDF.";
}

export function validarPayloadOferta(
  payload: PayloadConFlags,
  logoFiles: File[],
  existingLogosCount = 0,
  basesFile: File | null = null,
  hasExistingBases = false
): string | null {
  const {
    nombrePuesto,
    perfil,
    tipoContrato,
    tipoPuesto,
    cantidadVacantes,
    funciones,
    beneficios,
    modalidad,
    direccionLiteral,
    cronogramas,
    contactoPrincipal,
    contactoGerente,
    empresaId,
  } = payload;

  const err1 = erroresPaso1({
    cronogramas: cronogramas ?? [],
    tieneLogo: logoFiles.length > 0 || existingLogosCount > 0,
    tieneBases: Boolean(basesFile) || hasExistingBases,
  });
  if (hasFieldErrors(err1)) return Object.values(err1)[0];

  const tiposValidos = (tipoPuesto ?? []).filter((t) =>
    TIPOS_PUESTO.includes(t as (typeof TIPOS_PUESTO)[number])
  );

  const err2 = erroresPaso2({
    nombrePuesto: nombrePuesto ?? "",
    perfil: perfil ?? "",
    tipoContrato: tipoContrato ?? "",
    tipoPuesto: tiposValidos,
    cantidadVacantes: Number(cantidadVacantes),
    funciones: funciones ?? "",
    beneficios: beneficios ?? "",
    direccionLiteral: direccionLiteral ?? "",
  });
  if (hasFieldErrors(err2)) return Object.values(err2)[0];

  const err3 = erroresPaso3({
    contactoPrincipal: contactoPrincipal ?? {
      nombres: "",
      apellidoPaterno: "",
      correo: "",
      celular: "",
    },
    contactoGerente: contactoGerente ?? {
      nombres: "",
      apellidoPaterno: "",
      correo: "",
      celular: "",
    },
  });
  if (hasFieldErrors(err3)) return Object.values(err3)[0];

  if (!empresaId || !modalidad || !MODALIDADES.includes(modalidad)) {
    return "Datos incompletos";
  }

  if (payload.estado && !ESTADOS_OFERTA.includes(payload.estado as (typeof ESTADOS_OFERTA)[number])) {
    return "Estado de oferta inválido";
  }

  return null;
}
