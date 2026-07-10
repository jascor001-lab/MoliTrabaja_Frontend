const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Aplica máscara DD/MM/AAAA mientras el usuario escribe (máx. 8 dígitos). */
export function formatDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Convierte YYYY-MM-DD a DD/MM/AAAA para mostrar en pantalla. */
export function isoToDisplay(iso: string): string {
  const m = iso.match(ISO_RE);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Convierte DD/MM/AAAA a YYYY-MM-DD si la fecha es válida. */
export function displayToIso(display: string): string | null {
  const m = display.match(DISPLAY_RE);
  if (!m) return null;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (yyyy < 1000 || yyyy > 9999) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const date = new Date(`${iso}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (
    date.getUTCFullYear() !== yyyy ||
    date.getUTCMonth() + 1 !== mm ||
    date.getUTCDate() !== dd
  ) {
    return null;
  }

  return iso;
}

/** Formato legible para listas (acepta ISO o ya formateado). */
export function formatIsoDateDisplay(iso: string): string {
  if (!iso) return "";
  if (DISPLAY_RE.test(iso)) return iso;
  return isoToDisplay(iso) || iso;
}
