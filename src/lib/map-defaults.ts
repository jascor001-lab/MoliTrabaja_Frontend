/** Centro aproximado del distrito de La Molina, Lima (referencia local). */
export const MAP_DEFAULT_CENTER = {
  lat: -12.0761,
  lng: -76.9412,
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
