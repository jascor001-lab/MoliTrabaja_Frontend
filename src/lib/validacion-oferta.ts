import { TIPOS_PUESTO, type TipoPuesto } from "@/types/bolsa";
import { TIPOS_CONTRATO } from "@/types/catalogos";
import type { ContactoInput, CronogramaInput } from "@/types/bolsa";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function validarPaso1(data: {
  cronogramas: CronogramaInput[];
}): string | null {
  if (data.cronogramas.length === 0) {
    return "Agrega al menos una etapa al cronograma de la convocatoria.";
  }
  const conv = data.cronogramas[0];
  if (!conv.inicio) {
    return "Indica la fecha de inicio de la convocatoria.";
  }
  if (conv.fin) {
    const inicio = new Date(conv.inicio);
    const fin = new Date(conv.fin);
    if (fin < inicio) {
      return "La fecha de fin no puede ser anterior al inicio.";
    }
  }
  return null;
}

export function validarPaso2(data: {
  nombrePuesto: string;
  perfil: string;
  tipoContrato: string;
  tipoPuesto: TipoPuesto[];
  cantidadVacantes: number;
  funciones: string;
  beneficios: string;
  direccionLiteral: string;
}): string | null {
  if (data.nombrePuesto.trim().length < 2) {
    return "Ingresa el nombre del puesto.";
  }
  if (data.perfil.trim().length < 10) {
    return "Describe el perfil requerido (mín. 10 caracteres).";
  }
  if (!TIPOS_CONTRATO.includes(data.tipoContrato as (typeof TIPOS_CONTRATO)[number])) {
    return "Selecciona un tipo de contrato válido.";
  }
  if (data.tipoPuesto.length === 0) {
    return "Selecciona al menos un tipo de jornada.";
  }
  if (!Number.isFinite(data.cantidadVacantes) || data.cantidadVacantes < 1) {
    return "La cantidad de vacantes debe ser al menos 1.";
  }
  if (data.funciones.trim().length < 10) {
    return "Describe las funciones con más detalle (mín. 10 caracteres).";
  }
  if (data.beneficios.trim().length < 10) {
    return "Describe los beneficios con más detalle (mín. 10 caracteres).";
  }
  if (data.direccionLiteral.trim().length < 5) {
    return "Ingresa la dirección del puesto de trabajo.";
  }
  return null;
}

function validarContacto(c: ContactoInput, rol: string): string | null {
  if (c.nombres.trim().length < 2) {
    return `Ingresa los nombres del contacto (${rol}).`;
  }
  if (c.apellidoPaterno.trim().length < 2) {
    return `Ingresa el apellido paterno del contacto (${rol}).`;
  }
  if (!validarEmail(c.correo)) {
    return `Ingresa un correo válido para ${rol}.`;
  }
  if (c.celular.replace(/\D/g, "").length < 9) {
    return `Ingresa un celular válido para ${rol}.`;
  }
  return null;
}

export function validarPaso3(data: {
  contactoPrincipal: ContactoInput;
  contactoGerente: ContactoInput;
}): string | null {
  return (
    validarContacto(data.contactoPrincipal, "RRHH") ??
    validarContacto(data.contactoGerente, "gerente/supervisor")
  );
}

export function normalizarTipoPuesto(values: string[]): TipoPuesto[] {
  return values.filter((v): v is TipoPuesto =>
    TIPOS_PUESTO.includes(v as TipoPuesto)
  );
}
