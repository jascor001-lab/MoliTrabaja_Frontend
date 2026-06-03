export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

/** Geocodificación con Nominatim (OpenStreetMap). Uso moderado en formularios. */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (q.length < 5) return null;

  const params = new URLSearchParams({
    q: `${q}, La Molina, Lima, Perú`,
    format: "json",
    limit: "1",
    countrycodes: "pe",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  const hit = data[0];
  if (!hit) return null;

  const lat = Number.parseFloat(hit.lat);
  const lng = Number.parseFloat(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng, displayName: hit.display_name };
}
