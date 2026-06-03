import { validarPaso1, validarPaso2, validarPaso3 } from "@/lib/validacion-oferta";
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
  return "Adjunta el documento de bases del trabajo (PDF o Word).";
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

  const err1 =
    validarPaso1({ cronogramas: cronogramas ?? [] }) ??
    validarLogo(logoFiles.length, existingLogosCount) ??
    validarBases(basesFile, hasExistingBases);
  if (err1) return err1;

  const tiposValidos = (tipoPuesto ?? []).filter((t) =>
    TIPOS_PUESTO.includes(t as (typeof TIPOS_PUESTO)[number])
  );

  const err2 = validarPaso2({
    nombrePuesto: nombrePuesto ?? "",
    perfil: perfil ?? "",
    tipoContrato: tipoContrato ?? "",
    tipoPuesto: tiposValidos,
    cantidadVacantes: Number(cantidadVacantes),
    funciones: funciones ?? "",
    beneficios: beneficios ?? "",
    direccionLiteral: direccionLiteral ?? "",
  });
  if (err2) return err2;

  const err3 = validarPaso3({
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
  if (err3) return err3;

  if (!empresaId || !modalidad || !MODALIDADES.includes(modalidad)) {
    return "Datos incompletos";
  }

  if (payload.estado && !ESTADOS_OFERTA.includes(payload.estado as (typeof ESTADOS_OFERTA)[number])) {
    return "Estado de oferta inválido";
  }

  return null;
}
