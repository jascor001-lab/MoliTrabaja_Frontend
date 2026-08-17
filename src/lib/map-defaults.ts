/** Sede central — Municipalidad de La Molina, Av. Ricardo Elías Aparicio 740. */
export const MAP_DEFAULT_CENTER = {
  lat: -12.078498,
  lng: -76.917167,
} as const;

export const MAP_DEFAULT_ZOOM = 14;

export function parseCoord(value: string): number | null {
  const n = Number.parseFloat(value.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function formatCoord(value: number): string {
  return value.toFixed(6);
}

export function coordsFromStrings(
  latitud: string,
  longitud: string
): { lat: number; lng: number } | null {
  const lat = parseCoord(latitud);
  const lng = parseCoord(longitud);
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}
