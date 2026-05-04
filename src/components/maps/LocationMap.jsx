import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
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

export default function LocationMap({
  latitude,
  longitude,
  title = 'Location',
  description,
  heightClassName = 'h-72',
  zoom = 16,
}) {
  ensureLeafletConfig();

  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasCoordinates ? [latitude, longitude] : DEFAULT_CENTER;

  if (!hasCoordinates) {
    return (
      <div className={`empty-panel ${heightClassName}`}>
        <MapPinned className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
        <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title} unavailable</h4>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          This grievance does not have valid map coordinates yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/70 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/40 ${heightClassName}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport center={center} zoom={zoom} />
        <Marker position={center}>
          <Popup>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-slate-600">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
              {description ? <p className="text-xs text-slate-500">{description}</p> : null}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
