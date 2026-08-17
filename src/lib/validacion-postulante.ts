import { ESTADOS_CIVILES, GENEROS, type Genero } from "@/types/postulacion";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseBooleanFlag(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function capitalizarNombre(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function calcularEdad(fechaNacimiento: string, ref = new Date()): number {
  const birth = new Date(fechaNacimiento);
  if (Number.isNaN(birth.getTime())) return 0;
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
}

export type PostulanteFormInput = {
  tipoDocId: number;
  tipoDocAbrev?: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  paisId: number;
  genero: Genero;
  estadoCivil: string;
  correo: string;
  telefono: string;
  direccionLiteral: string;
  latitud?: string;
  longitud?: string;
  tieneDiscapacidad: boolean;
};

export function validarPostulanteInput(
  data: Partial<PostulanteFormInput> & { dni?: string; direccion?: string }
): { ok: true; data: PostulanteFormInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const tipoDocId = Number(data.tipoDocId ?? 1);
  if (!Number.isFinite(tipoDocId) || tipoDocId < 1) {
    errors.tipoDocId = "Selecciona un tipo de documento.";
  }

  const numeroDocumento = (data.numeroDocumento ?? data.dni ?? "")
    .trim()
    .toUpperCase();
  const tipoDocAbrev = data.tipoDocAbrev?.trim().toUpperCase();

  if (tipoDocAbrev === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
    errors.numeroDocumento = "El DNI debe tener exactamente 8 dígitos.";
  } else if (tipoDocAbrev === "CE" && !/^[A-Z0-9]{9,12}$/.test(numeroDocumento)) {
    errors.numeroDocumento = "El CE debe tener entre 9 y 12 caracteres.";
  } else if (tipoDocAbrev === "CPP" && !/^\d{9}$/.test(numeroDocumento)) {
    errors.numeroDocumento = "El CPP debe tener exactamente 9 dígitos.";
  } else if (tipoDocAbrev === "RUC" && !/^\d{11}$/.test(numeroDocumento)) {
    errors.numeroDocumento = "El RUC debe tener exactamente 11 dígitos.";
  } else if (tipoDocAbrev === "PAS" && !/^[A-Z0-9]{6,12}$/.test(numeroDocumento)) {
    errors.numeroDocumento = "El pasaporte debe tener entre 6 y 12 caracteres.";
  } else if (!tipoDocAbrev && tipoDocId === 1 && !/^\d{8}$/.test(numeroDocumento)) {
    errors.numeroDocumento = "El DNI debe tener exactamente 8 dígitos.";
  } else if (!tipoDocAbrev && numeroDocumento.length < 6) {
    errors.numeroDocumento = "Ingresa un número de documento válido.";
  }

  const nombres = data.nombres?.trim() ?? "";
  const apellidoPaterno = data.apellidoPaterno?.trim() ?? "";
  const apellidoMaterno = data.apellidoMaterno?.trim() ?? "";

  if (nombres.length < 2) errors.nombres = "Ingresa tus nombres.";
  if (apellidoPaterno.length < 2) errors.apellidoPaterno = "Ingresa tu apellido paterno.";
  if (apellidoMaterno.length < 2) errors.apellidoMaterno = "Ingresa tu apellido materno.";

  const fechaNacimiento = data.fechaNacimiento?.trim() ?? "";
  if (!DATE_RE.test(fechaNacimiento)) {
    errors.fechaNacimiento = "Usa el formato YYYY-MM-DD.";
  } else {
    const edad = calcularEdad(fechaNacimiento);
    if (edad < 16 || edad > 80) {
      errors.fechaNacimiento = "La edad calculada debe estar entre 16 y 80 años.";
    }
  }

  const paisId = Number(data.paisId ?? 1);
  if (!Number.isFinite(paisId) || paisId < 1) {
    errors.paisId = "Selecciona un país.";
  }

  const genero = data.genero as Genero;
  if (!GENEROS.includes(genero)) {
    errors.genero = "Selecciona un género válido.";
  }

  const estadoCivil = data.estadoCivil ?? "Soltero";
  if (!ESTADOS_CIVILES.includes(estadoCivil as (typeof ESTADOS_CIVILES)[number])) {
    errors.estadoCivil = "Selecciona un estado civil válido.";
  }

  const correo = data.correo?.trim() ?? "";
  if (!EMAIL_RE.test(correo)) {
    errors.correo = "Correo electrónico inválido.";
  }

  const telefono = data.telefono?.trim() ?? "";
  if (telefono.replace(/\D/g, "").length < 9) {
    errors.telefono = "Teléfono inválido (mínimo 9 dígitos).";
  }

  const direccionLiteral = (data.direccionLiteral ?? data.direccion ?? "").trim();
  if (direccionLiteral.length < 5) {
    errors.direccionLiteral = "Ingresa una dirección válida.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      tipoDocId,
      numeroDocumento,
      nombres: capitalizarNombre(nombres),
      apellidoPaterno: capitalizarNombre(apellidoPaterno),
      apellidoMaterno: capitalizarNombre(apellidoMaterno),
      fechaNacimiento,
      paisId,
      genero,
      estadoCivil,
      correo: correo.toLowerCase(),
      telefono,
      direccionLiteral,
      latitud: data.latitud,
      longitud: data.longitud,
      tieneDiscapacidad: Boolean(data.tieneDiscapacidad),
    },
  };
}

export function nombreCompleto(p: {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}): string {
  return `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`;
}
