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
