export const SALARIO_A_CONVENIR = "A convenir";

export function isSalarioAConvenir(value: string): boolean {
  const v = value.trim();
  return !v || v.toLowerCase() === SALARIO_A_CONVENIR.toLowerCase();
}

/** Extrae el monto numérico guardado (ej. "S/ 5,500" → "5500"). */
export function parseSalarioMonto(stored: string): string {
  if (isSalarioAConvenir(stored)) return "";
  const digits = stored.replace(/[^\d.]/g, "");
  const n = Number.parseFloat(digits);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.round(n) === n ? Math.round(n) : n);
}

export function formatSalarioSoles(monto: string): string {
  const raw = monto.trim().replace(/,/g, "");
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return SALARIO_A_CONVENIR;
  return `S/ ${n.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatSalarioForSave(aConvenir: boolean, monto: string): string {
  if (aConvenir) return SALARIO_A_CONVENIR;
  return formatSalarioSoles(monto);
}

export function salarioFromStored(stored: string): {
  aConvenir: boolean;
  monto: string;
} {
  if (isSalarioAConvenir(stored)) {
    return { aConvenir: true, monto: "" };
  }
  return { aConvenir: false, monto: parseSalarioMonto(stored) };
}

/** Extrae todos los montos de un salario (incluye rangos tipo "S/ 4,500 - S/ 6,000"). */
export function parseSalarioMontos(stored: string): number[] {
  if (isSalarioAConvenir(stored)) return [];
  return stored
    .split(/\s*[-–—]\s*/)
    .map((part) => Number.parseFloat(part.replace(/[^\d.]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Clave numérica para ordenar salarios de menor a mayor. "A convenir" va al final. */
export function salarioSortKey(stored: string): number {
  if (isSalarioAConvenir(stored)) return Number.POSITIVE_INFINITY;
  const montos = parseSalarioMontos(stored);
  if (montos.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...montos);
}

export const SALARIO_FILTRO_OPCIONES = [
  { value: "", label: "Todos" },
  { value: "hasta-4000", label: "Hasta S/ 4,000" },
  { value: "4000-6000", label: "S/ 4,000 – S/ 6,000" },
  { value: "mas-6000", label: "Más de S/ 6,000" },
  { value: "convenir", label: "A convenir" },
] as const;

export function ofertaCumpleFiltroSalario(stored: string, filtro: string): boolean {
  if (!filtro) return true;
  if (filtro === "convenir") return isSalarioAConvenir(stored);
  if (isSalarioAConvenir(stored)) return false;

  const montos = parseSalarioMontos(stored);
  if (montos.length === 0) return false;
  const min = Math.min(...montos);
  const max = Math.max(...montos);

  if (filtro === "hasta-4000") return max <= 4000;
  if (filtro === "4000-6000") return min <= 6000 && max >= 4000;
  if (filtro === "mas-6000") return min > 6000;
  return true;
}
