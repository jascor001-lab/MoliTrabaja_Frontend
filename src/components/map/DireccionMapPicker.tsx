"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { Input } from "@/components/ui/Input";
import {
  reverseGeocodeAddress,
  searchAddressSuggestions,
  type AddressSuggestion,
} from "@/lib/geocode";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  coordsFromStrings,
  formatCoord,
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

const SUGGEST_DEBOUNCE_MS = 400;

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
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState(direccionLiteral);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = "direccion-sugerencias";

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

  const selectOnMap = useCallback(
    async (lat: number, lng: number) => {
      setCoords(lat, lng);
      setResolvingAddress(true);
      try {
        const address = await reverseGeocodeAddress(lat, lng);
        onDireccionChange(
          address ?? `Ubicación seleccionada (${formatCoord(lat)}, ${formatCoord(lng)})`
        );
      } catch {
        onDireccionChange(
          `Ubicación seleccionada (${formatCoord(lat)}, ${formatCoord(lng)})`
        );
      } finally {
        setResolvingAddress(false);
      }
    },
    [onDireccionChange, setCoords]
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(direccionLiteral), SUGGEST_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [direccionLiteral]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!showSuggestions || q.length < 3) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestLoading(true);

    const run = async () => {
      try {
        const items = await searchAddressSuggestions(q);
        if (!cancelled) {
          setSuggestions(items);
          setHighlightIndex(items.length > 0 ? 0 : -1);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, showSuggestions]);

  const selectSuggestion = useCallback(
    (item: AddressSuggestion) => {
      onDireccionChange(item.label);
      setCoords(item.lat, item.lng);
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
      setGeocodeError(null);
    },
    [onDireccionChange, setCoords]
  );

  const handleDireccionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "ArrowDown" && direccionLiteral.trim().length >= 3) {
        setShowSuggestions(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  const listVisible = showSuggestions && direccionLiteral.trim().length >= 3;

  return (
    <div className="space-y-3">
      <div className="relative">
          <Input
            label="Dirección *"
            placeholder="Escribe tu dirección o selecciónala en el mapa…"
            value={direccionLiteral}
            autoComplete="off"
            role="combobox"
            aria-expanded={listVisible && suggestions.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            onChange={(e) => {
              onDireccionChange(e.target.value);
              setShowSuggestions(true);
              setGeocodeError(null);
            }}
            onFocus={() => {
              if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = setTimeout(() => {
                setShowSuggestions(false);
                setHighlightIndex(-1);
              }, 180);
            }}
            onKeyDown={handleDireccionKeyDown}
          />

          {(suggestLoading || listVisible) && (
            <ul
              id={listId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-emerald-200 bg-white py-1 shadow-lg"
            >
              {suggestLoading && suggestions.length === 0 && (
                <li className="px-4 py-2.5 text-sm text-slate-500">Buscando direcciones…</li>
              )}
              {suggestions.map((item, i) => (
                <li key={item.id} role="option" aria-selected={highlightIndex === i}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      highlightIndex === i
                        ? "bg-emerald-50 text-emerald-900"
                        : "text-slate-700 hover:bg-emerald-50/80"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(item)}
                    onMouseEnter={() => setHighlightIndex(i)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              {!suggestLoading && listVisible && suggestions.length === 0 && (
                <li className="px-4 py-2.5 text-sm text-slate-500">
                  Sin coincidencias. Selecciona la ubicación directamente en el mapa.
                </li>
              )}
            </ul>
          )}
      </div>

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
          <MapClickHandler onPick={(lat, lng) => void selectOnMap(lat, lng)} />
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
                    void selectOnMap(lat, lng);
                  },
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {resolvingAddress && (
        <p className="text-xs text-emerald-700">Obteniendo la dirección seleccionada…</p>
      )}

      {geocodeError && (
        <p className="text-sm text-red-600" role="alert">
          {geocodeError}
        </p>
      )}
    </div>
  );
}
