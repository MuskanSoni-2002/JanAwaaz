import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { MapPinned } from 'lucide-react';
import { formatGrievanceStatus } from '../../utils/grievances';
import { ensureLeafletConfig } from './leafletConfig';

const DEFAULT_CENTER = [20.5937, 78.9629];

function MapBoundsController({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, 5, { animate: false });
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 14, { animate: false });
      return;
    }

    map.fitBounds(L.latLngBounds(positions), { padding: [32, 32] });
  }, [map, positions]);

  return null;
}

export default function GrievanceOverviewMap({
  grievances,
  heightClassName = 'h-[380px]',
}) {
  ensureLeafletConfig();

  const mappedGrievances = grievances.filter(
    (grievance) => Number.isFinite(grievance.latitude) && Number.isFinite(grievance.longitude)
  );
  const positions = mappedGrievances.map((grievance) => [grievance.latitude, grievance.longitude]);

  if (mappedGrievances.length === 0) {
    return (
      <div className={`empty-panel ${heightClassName}`}>
        <MapPinned className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
        <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No mapped grievances</h4>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          The visible grievances do not have usable location coordinates yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/70 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/40 ${heightClassName}`}>
      <MapContainer center={positions[0] ?? DEFAULT_CENTER} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsController positions={positions} />
        {mappedGrievances.map((grievance) => (
          <Marker
            key={grievance.grievanceId}
            position={[grievance.latitude, grievance.longitude]}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {grievance.categoryName || `Grievance #${grievance.grievanceId}`}
                </p>
                <p className="text-xs text-slate-600">Case #{grievance.grievanceId}</p>
                <p className="text-xs text-slate-600">{formatGrievanceStatus(grievance.status)}</p>
                <p className="text-xs text-slate-500">{grievance.addressText || 'No address text'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
