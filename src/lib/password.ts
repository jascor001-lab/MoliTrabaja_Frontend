import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SALT_BYTES = 16;
const KEY_BYTES = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(password, salt, KEY_BYTES);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || stored === "pending") return false;
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarPasswordRegistro(password: string): string | null {
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  return null;
}

export function validarCorreoRegistro(correo: string): string | null {
  const normalized = correo.trim().toLowerCase();
  if (!normalized) return "El correo electrónico es obligatorio.";
  if (!EMAIL_RE.test(normalized)) return "Ingresa un correo electrónico válido.";
  return null;
}

/** Valida correo y contraseña de registro (una sola vez cada uno). */
export function validarCuentaRegistro(
  correo: string,
  password: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  const correoErr = validarCorreoRegistro(correo);
  if (correoErr) errors.correo = correoErr;
  const pwdErr = validarPasswordRegistro(password);
  if (pwdErr) errors.password = pwdErr;
  return errors;
}
