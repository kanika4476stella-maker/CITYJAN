"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle,
} from "lucide-react";
import {
  reverseGeocode,
  getCurrentPosition,
  INDIA_CENTER,
  CITY_ZOOM,
  PIN_ZOOM,
  GeoLocation,
} from "@/lib/geocoding";

interface MapPickerProps {
  value: GeoLocation | null;
  onChange: (loc: GeoLocation) => void;
}

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f5f7ff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#1A3C6E" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#e8eeff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9d8ff" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#d4f1d4" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#e8eeff" }],
  },
];

// Fallback map using OpenStreetMap iframe when no Google Maps key
function FallbackMap({
  value,
  onCoordinateInput,
}: {
  value: GeoLocation | null;
  onCoordinateInput: (lat: number, lng: number) => void;
}) {
  const [latInput, setLatInput] = useState(value?.lat.toFixed(6) ?? "");
  const [lngInput, setLngInput] = useState(value?.lng.toFixed(6) ?? "");
  const [geocoding, setGeocoding] = useState(false);

  const center = value ?? INDIA_CENTER;
  const zoom = value ? 15 : 5;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.01},${center.lat - 0.01},${center.lng + 0.01},${center.lat + 0.01}&layer=mapnik${value ? `&marker=${center.lat},${center.lng}` : ""}`;

  const handleGo = async () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) return;
    setGeocoding(true);
    onCoordinateInput(lat, lng);
    setGeocoding(false);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden border border-primary/15 shadow-sm">
        <iframe
          src={mapUrl}
          className="w-full h-64"
          style={{ border: 0 }}
          aria-label="Issue location map"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-primary/40 text-center">
        📍 Add your{" "}
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          Google Maps coordinates
        </a>{" "}
        or enter lat/lng manually
      </p>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-primary/50 uppercase tracking-wide mb-1 block">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            placeholder="28.6139"
            className="w-full bg-background border border-primary/15 rounded-xl px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-primary/50 uppercase tracking-wide mb-1 block">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            placeholder="77.2090"
            className="w-full bg-background border border-primary/15 rounded-xl px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleGo}
            disabled={geocoding}
            className="bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60"
          >
            {geocoding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Set"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: ["places"],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState(value ?? INDIA_CENTER);
  const [mapZoom, setMapZoom] = useState(value ? CITY_ZOOM : 5);
  const [searchInput, setSearchInput] = useState("");
  const [pinDragging, setPinDragging] = useState(false);

  // Auto-detect GPS on first mount
  useEffect(() => {
    if (!value) {
      detectGPS();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationUpdate = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      const address = await reverseGeocode(lat, lng);
      onChange({ lat, lng, address });
      setMapCenter({ lat, lng });
      setMapZoom(PIN_ZOOM);
      setGeocoding(false);
    },
    [onChange]
  );

  const detectGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await getCurrentPosition();
      await handleLocationUpdate(pos.coords.latitude, pos.coords.longitude);
      if (mapRef.current) {
        mapRef.current.panTo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        mapRef.current.setZoom(PIN_ZOOM);
      }
    } catch (err) {
      setGpsError(
        "Location access denied. Please allow GPS or drop a pin manually."
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      await handleLocationUpdate(lat, lng);
    },
    [handleLocationUpdate]
  );

  const handleMarkerDragEnd = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      setPinDragging(false);
      await handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
    },
    [handleLocationUpdate]
  );

  const handleFallbackCoords = useCallback(
    async (lat: number, lng: number) => {
      await handleLocationUpdate(lat, lng);
    },
    [handleLocationUpdate]
  );

  const noKey = !MAPS_API_KEY || MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY";

  // ── No API key — use fallback ─────────────────────────────────────────────
  if (noKey || loadError) {
    return (
      <div className="space-y-3">
        {/* GPS button still works */}
        <button
          type="button"
          onClick={detectGPS}
          disabled={gpsLoading}
          className="w-full flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 text-accent font-semibold py-3 rounded-xl hover:bg-accent/15 transition-all disabled:opacity-60"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {gpsLoading ? "Detecting GPS…" : "Use My Current Location"}
        </button>

        {gpsError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {gpsError}
          </motion.p>
        )}

        {value && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5"
          >
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-green-700 truncate">{value.address}</span>
          </motion.div>
        )}

        <FallbackMap value={value} onCoordinateInput={handleFallbackCoords} />

        {noKey && (
          <p className="text-xs text-primary/30 text-center">
            Add{" "}
            <code className="bg-primary/8 px-1 rounded">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code>{" "}
            to .env.local for the full interactive map
          </p>
        )}
      </div>
    );
  }

  // ── Loading Google Maps ───────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="h-72 rounded-2xl bg-background border border-primary/15 flex items-center justify-center gap-3 text-primary/40">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading map…</span>
      </div>
    );
  }

  // ── Full Google Maps ──────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* GPS + Instruction bar */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={detectGPS}
          disabled={gpsLoading || geocoding}
          className="flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-accent/90 transition-all disabled:opacity-60 shadow-glow flex-shrink-0"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {gpsLoading ? "Detecting…" : "My Location"}
        </button>
        <div className="flex-1 flex items-center gap-2 bg-background border border-primary/15 rounded-xl px-3 text-sm text-primary/40">
          <MapPin className="w-4 h-4 flex-shrink-0 text-primary/30" />
          <span>Click map or drag pin to set location</span>
        </div>
      </div>

      {gpsError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {gpsError}
        </motion.div>
      )}

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-card">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "320px" }}
          center={mapCenter}
          zoom={mapZoom}
          onClick={handleMapClick}
          onLoad={(map) => { mapRef.current = map; }}
          options={{
            styles: MAP_STYLES,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            clickableIcons: false,
            gestureHandling: "greedy",
          }}
        >
          {value && (
            <>
              {/* Accuracy ring */}
              <Circle
                center={{ lat: value.lat, lng: value.lng }}
                radius={50}
                options={{
                  strokeColor: "#2563EB",
                  strokeOpacity: 0.4,
                  strokeWeight: 1.5,
                  fillColor: "#2563EB",
                  fillOpacity: 0.08,
                }}
              />
              {/* Draggable marker */}
              <Marker
                position={{ lat: value.lat, lng: value.lng }}
                draggable
                onDragStart={() => setPinDragging(true)}
                onDragEnd={handleMarkerDragEnd}
                animation={google.maps.Animation.DROP}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
                      <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1A3C6E" flood-opacity="0.3"/>
                        </filter>
                      </defs>
                      <path d="M20 2C11.163 2 4 9.163 4 18c0 12 16 30 16 30s16-18 16-30C36 9.163 28.837 2 20 2z"
                        fill="#2563EB" filter="url(#shadow)"/>
                      <circle cx="20" cy="18" r="7" fill="white"/>
                      <circle cx="20" cy="18" r="4" fill="#2563EB"/>
                    </svg>`),
                  scaledSize: new google.maps.Size(40, 50),
                  anchor: new google.maps.Point(20, 50),
                }}
              />
            </>
          )}
        </GoogleMap>

        {/* Geocoding overlay */}
        <AnimatePresence>
          {(geocoding || pinDragging) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center gap-2 text-primary/60 text-sm"
            >
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              {pinDragging ? "Drop pin to confirm location…" : "Getting address…"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected address */}
      <AnimatePresence>
        {value && !geocoding && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 bg-accent/6 border border-accent/20 rounded-xl px-4 py-3"
          >
            <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary/50 uppercase tracking-wide mb-0.5">
                Selected Location
              </p>
              <p className="text-sm text-primary font-medium leading-snug">{value.address}</p>
              <p className="text-xs text-primary/40 mt-0.5 font-mono">
                {value.lat.toFixed(6)}°, {value.lng.toFixed(6)}°
              </p>
            </div>
            <button
              type="button"
              onClick={detectGPS}
              className="text-accent/50 hover:text-accent transition-colors flex-shrink-0 mt-0.5"
              title="Re-detect GPS"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
