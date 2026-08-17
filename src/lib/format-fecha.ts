const DIA_MS = 86_400_000;
const OFERTA_NUEVA_DIAS = 7;

export function esOfertaNueva(iso: string, now = Date.now()): boolean {
  const publishedAt = new Date(iso).getTime();
  if (!Number.isFinite(publishedAt)) return false;
  return now - publishedAt <= OFERTA_NUEVA_DIAS * DIA_MS;
}

export function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 30) return `Hace ${days} días`;

  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months > 1 ? "es" : ""}`;

  return new Date(iso).toLocaleDateString("es-PE");
}

export function formatFechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatVigencia(
  inicio: string,
  fin: string | null
): string {
  const desde = formatFechaCorta(inicio);
  if (!fin) return `Desde ${desde}`;
  return `${desde} — ${formatFechaCorta(fin)}`;
}

export function lineasComoLista(texto: string): string[] {
  return texto
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}
