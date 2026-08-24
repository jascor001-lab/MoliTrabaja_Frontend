import { scryptSync, timingSafeEqual } from "crypto";
import { compareSync, hashSync } from "bcryptjs";

export {
  validarCorreoRegistro,
  validarCuentaRegistro,
  validarPasswordRegistro,
} from "@/lib/password-validacion";

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || stored === "pending") return false;
  if (stored.startsWith("$2")) {
    try {
      return compareSync(password, stored);
    } catch {
      return false;
    }
  }
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

