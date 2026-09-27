import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
 // The heatmap uses the full station list – we need a dedicated API call that can return all stations.
 // `getStations` supports a radius, so we request a very large one to cover the whole country.
 import { getStations } from '../services/api';
// Import Leaflet core styles – required for proper tile rendering.
// Without this, tiles can appear broken or mis‑aligned.
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';

// Leaflet default icon fix for webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
});

import { PageLoader } from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import AQIStationMarker from '../components/map/AQIStationMarker';
import AQIHeatmapLayer from '../components/map/AQIHeatmapLayer';
import { DEFAULT_MAP_CENTER } from '../data/demoData';
import AQILegend from '../components/map/AQILegend';

export default function MapPage() {
  const { lat: ctxLat = DEFAULT_MAP_CENTER.lat, lon: ctxLon = DEFAULT_MAP_CENTER.lng } = useContext(AppContext);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   const loadStations = async () => {
    setLoading(true);
    setError(null);
    try {
       // Request a large radius (500 km) from the context location to get many stations.
       // For truly global coverage you could use 20000 km or coordinates 0,0 with max radius.
        // A very large radius ensures we capture stations across the country.
        const data = await getStations({ lat: ctxLat, lon: ctxLon, radiusKm: 20000 });
       setStations(data ?? []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load station data');
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
     loadStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxLat, ctxLon]);

  if (loading) return <PageLoader />;
  if (error)
    return (
       // Retry will re‑invoke the data fetch.
       <ErrorState title="Unable to load stations" description={error} onRetry={loadStations} />
    );

  const mapCenter = [ctxLat, ctxLon];

  // Legend component – renders colored boxes with category names
  const MapLegend = () => <AQILegend />;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        {/* Base tiles */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker – simple circle */}
        {ctxLat && ctxLon && (
          <CircleMarker center={mapCenter} radius={6} color="#0077ff" fillColor="#0077ff" stroke={false} />
        )}

        {/* Heatmap layer for AQI intensity */}
        <AQIHeatmapLayer stations={stations} />

        {/* Individual station markers */}
        {stations.map(st => (
          <AQIStationMarker key={st.id} station={st} />
        ))}

        {/* Legend overlay */}
        <MapLegend />
      </MapContainer>
    </div>
  );
}