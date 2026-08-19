import { TIPOS_PUESTO, type TipoPuesto } from "@/types/bolsa";
import { TIPOS_CONTRATO } from "@/types/catalogos";
import type { ContactoInput, CronogramaInput } from "@/types/bolsa";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type OfertaFieldErrors = Record<string, string>;

export function validarEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function hasFieldErrors(errors: OfertaFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function erroresPaso1(data: {
  cronogramas: CronogramaInput[];
  tieneLogo: boolean;
  tieneBases: boolean;
}): OfertaFieldErrors {
  const errors: OfertaFieldErrors = {};
  if (!data.tieneLogo) {
    errors.logo = "Adjunta el logo de la empresa.";
  }
  if (data.cronogramas.length === 0) {
    errors.inicio = "Indica la fecha de inicio de la convocatoria.";
    return errors;
  }
  const conv = data.cronogramas[0];
  if (!conv.inicio) {
    errors.inicio = "Indica la fecha de inicio de la convocatoria.";
  }
  if (conv.fin && conv.inicio) {
    const inicio = new Date(conv.inicio);
    const fin = new Date(conv.fin);
    if (fin < inicio) {
      errors.fin = "La fecha de fin no puede ser anterior al inicio.";
    }
  }
  if (!data.tieneBases) {
    errors.bases = "Adjunta el documento de bases del trabajo.";
  }
  return errors;
}

export function erroresPaso2(data: {
  nombrePuesto: string;
  perfil: string;
  tipoContrato: string;
  tipoPuesto: TipoPuesto[];
  cantidadVacantes: number;
  funciones: string;
  beneficios: string;
  direccionLiteral: string;
}): OfertaFieldErrors {
  const errors: OfertaFieldErrors = {};
  if (data.nombrePuesto.trim().length < 2) {
    errors.nombrePuesto = "Ingresa el nombre del puesto.";
  }
  if (data.perfil.trim().length < 10) {
    errors.perfil = "Describe el perfil requerido (mín. 10 caracteres).";
  }
  if (!TIPOS_CONTRATO.includes(data.tipoContrato as (typeof TIPOS_CONTRATO)[number])) {
    errors.tipoContrato = "Selecciona un tipo de contrato válido.";
  }
  if (data.tipoPuesto.length === 0) {
    errors.tipoPuesto = "Selecciona al menos un tipo de jornada.";
  }
  if (!Number.isFinite(data.cantidadVacantes) || data.cantidadVacantes < 1) {
    errors.cantidadVacantes = "La cantidad de vacantes debe ser al menos 1.";
  }
  if (data.funciones.trim().length < 10) {
    errors.funciones = "Describe las funciones (mín. 10 caracteres).";
  }
  if (data.beneficios.trim().length < 10) {
    errors.beneficios = "Describe los beneficios (mín. 10 caracteres).";
  }
  if (data.direccionLiteral.trim().length < 5) {
    errors.direccionLiteral = "Ingresa la dirección del puesto de trabajo.";
  }
  return errors;
}

function erroresContacto(c: ContactoInput, prefix: string): OfertaFieldErrors {
  const errors: OfertaFieldErrors = {};
  if (c.nombres.trim().length < 2) {
    errors[`${prefix}_nombres`] = "Ingresa los nombres.";
  }
  if (c.apellidoPaterno.trim().length < 2) {
    errors[`${prefix}_apellidoPaterno`] = "Ingresa el apellido paterno.";
  }
  if (!validarEmail(c.correo)) {
    errors[`${prefix}_correo`] = "Ingresa un correo válido.";
  }
  if (c.celular.replace(/\D/g, "").length < 9) {
    errors[`${prefix}_celular`] = "Ingresa un celular válido.";
  }
  return errors;
}

export function erroresPaso3(data: {
  contactoPrincipal: ContactoInput;
  contactoGerente: ContactoInput;
}): OfertaFieldErrors {
  return {
    ...erroresContacto(data.contactoPrincipal, "contactoPrincipal"),
    ...erroresContacto(data.contactoGerente, "contactoGerente"),
  };
}

export function normalizarTipoPuesto(values: string[]): TipoPuesto[] {
  return values.filter((v): v is TipoPuesto =>
    TIPOS_PUESTO.includes(v as TipoPuesto)
  );
}
