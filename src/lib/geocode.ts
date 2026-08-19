export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

export type AddressSuggestion = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

const NOMINATIM_HEADERS: HeadersInit = {
  Accept: "application/json",
  "User-Agent": "BolsaDeTrabajo/1.0 (portal de empleo)",
};

type NominatimHit = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

type NominatimReverseHit = {
  display_name?: string;
};

async function nominatimSearch(
  query: string,
  limit: number
): Promise<NominatimHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q: `${q}, Lima, Perú`,
    format: "json",
    limit: String(limit),
    countrycodes: "pe",
    addressdetails: "0",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: NOMINATIM_HEADERS }
  );

  if (!res.ok) return [];

  const data = (await res.json()) as NominatimHit[];
  return Array.isArray(data) ? data : [];
}

function hitToResult(hit: NominatimHit): GeocodeResult | null {
  const lat = Number.parseFloat(hit.lat);
  const lng = Number.parseFloat(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, displayName: hit.display_name };
}

/** Varias sugerencias mientras el usuario escribe (Nominatim / OpenStreetMap). */
export async function searchAddressSuggestions(
  query: string
): Promise<AddressSuggestion[]> {
  const hits = await nominatimSearch(query, 6);
  const out: AddressSuggestion[] = [];

  for (const hit of hits) {
    const parsed = hitToResult(hit);
    if (!parsed) continue;
    out.push({
      id: String(hit.place_id),
      label: parsed.displayName,
      lat: parsed.lat,
      lng: parsed.lng,
    });
  }

  return out;
}

/** Geocodificación con Nominatim (OpenStreetMap). Uso moderado en formularios. */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (q.length < 5) return null;

  const hits = await nominatimSearch(q, 1);
  return hits[0] ? hitToResult(hits[0]) : null;
}

/** Obtiene la dirección correspondiente a un punto seleccionado en el mapa. */
export async function reverseGeocodeAddress(
  lat: number,
  lng: number
): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "0",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    { headers: NOMINATIM_HEADERS }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as NominatimReverseHit;
  return data.display_name?.trim() || null;
}
