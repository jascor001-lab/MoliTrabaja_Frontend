const STORAGE_KEY = "molitrabaja_ofertas_vistas";

function leerIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function listarOfertasVistas(): string[] {
  return leerIds();
}

export function marcarOfertaVista(ofertaId: string): void {
  if (typeof window === "undefined" || !ofertaId) return;
  const ids = leerIds();
  if (ids.includes(ofertaId)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([ofertaId, ...ids].slice(0, 200)));
}
