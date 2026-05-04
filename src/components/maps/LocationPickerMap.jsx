import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { MapPinned } from 'lucide-react';
import { ensureLeafletConfig } from './leafletConfig';

const DEFAULT_CENTER = [20.5937, 78.9629];

function MapViewport({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: false });
  }, [center, map, zoom]);

  return null;
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
  heightClassName = 'h-[360px]',
}) {
  ensureLeafletConfig();

  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasCoordinates ? [latitude, longitude] : DEFAULT_CENTER;
  const zoom = hasCoordinates ? 16 : 5;

  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/70 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/40 ${heightClassName}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport center={center} zoom={zoom} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {hasCoordinates ? (
          <Marker position={center}>
            <Popup>
              Selected issue location
              <br />
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-slate-950/20 dark:bg-white/90 dark:text-slate-950">
        Tap anywhere on the map to place the complaint marker.
      </div>

      {!hasCoordinates ? (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[20px] border border-amber-200/80 bg-white/92 px-4 py-3 text-xs leading-5 text-amber-700 shadow-lg shadow-amber-950/5 dark:border-amber-400/20 dark:bg-slate-950/88 dark:text-amber-300">
          A location is required before you can submit this grievance.
        </div>
      ) : (
        <div className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-emerald-600/92 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-emerald-950/20">
          <MapPinned className="h-3.5 w-3.5" />
          Marker locked at {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>
      )}
    </div>
  );
}
