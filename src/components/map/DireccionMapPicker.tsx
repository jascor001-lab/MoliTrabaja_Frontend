"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { geocodeAddress } from "@/lib/geocode";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  coordsFromStrings,
  formatCoord,
  parseCoord,
} from "@/lib/map-defaults";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  direccionLiteral: string;
  latitud: string;
  longitud: string;
  onDireccionChange: (value: string) => void;
  onCoordsChange: (lat: string, lng: string) => void;
};

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, Math.max(map.getZoom(), MAP_DEFAULT_ZOOM), { duration: 0.5 });
    },
  });
  return null;
}

function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), MAP_DEFAULT_ZOOM), {
      duration: 0.6,
    });
  }, [position, map]);
  return null;
}

export function DireccionMapPicker({
  direccionLiteral,
  latitud,
  longitud,
  onDireccionChange,
  onCoordsChange,
}: Props) {
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const position = useMemo(
    () => coordsFromStrings(latitud, longitud),
    [latitud, longitud]
  );

  const mapCenter: [number, number] = position
    ? [position.lat, position.lng]
    : [MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng];

  const setCoords = useCallback(
    (lat: number, lng: number) => {
      onCoordsChange(formatCoord(lat), formatCoord(lng));
      setGeocodeError(null);
    },
    [onCoordsChange]
  );

  const handleGeocode = async () => {
    setGeocodeError(null);
    setGeocoding(true);
    try {
      const result = await geocodeAddress(direccionLiteral);
      if (!result) {
        setGeocodeError("No se encontró la dirección. Ajusta el texto o marca el mapa.");
        return;
      }
      setCoords(result.lat, result.lng);
    } catch {
      setGeocodeError("Error al buscar la dirección. Intenta de nuevo.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleLatChange = (value: string) => {
    const lng = parseCoord(longitud);
    onCoordsChange(value, lng !== null ? formatCoord(lng) : longitud);
  };

  const handleLngChange = (value: string) => {
    const lat = parseCoord(latitud);
    onCoordsChange(lat !== null ? formatCoord(lat) : latitud, value);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div className="flex-1 min-w-0">
          <Input
            label="Dirección literal *"
            placeholder="Ej. Av. La Molina 123, La Molina"
            value={direccionLiteral}
            onChange={(e) => onDireccionChange(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 sm:mb-0.5"
          disabled={geocoding || direccionLiteral.trim().length < 5}
          onClick={handleGeocode}
        >
          {geocoding ? "Buscando…" : "Ubicar en mapa"}
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Haz clic en el mapa o arrastra el marcador para fijar coordenadas. También puedes
        editarlas manualmente.
      </p>

      <div className="overflow-hidden rounded-xl border border-emerald-200 shadow-sm">
        <MapContainer
          center={mapCenter}
          zoom={MAP_DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-64 w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={setCoords} />
          {position && (
            <>
              <MapRecenter position={[position.lat, position.lng]} />
              <Marker
                position={[position.lat, position.lng]}
                icon={markerIcon}
                draggable
                eventHandlers={{
                  dragend(e) {
                    const { lat, lng } = e.target.getLatLng();
                    setCoords(lat, lng);
                  },
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Latitud"
          placeholder="-12.076100"
          value={latitud}
          onChange={(e) => handleLatChange(e.target.value)}
        />
        <Input
          label="Longitud"
          placeholder="-76.941200"
          value={longitud}
          onChange={(e) => handleLngChange(e.target.value)}
        />
      </div>

      {geocodeError && (
        <p className="text-sm text-red-600" role="alert">
          {geocodeError}
        </p>
      )}
    </div>
  );
}
