import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { normalizeAQItoHeat, HEATMAP_GRADIENT, isValidGeoRecord } from '../../utils/aqiUtils';

/**
 * GlobalAQIHeatmapLayer
 *
 * Renders a real-data AQI heatmap using leaflet.heat.
 * - Uses real station coordinates and AQI values only (no fake/random data)
 * - Adjusts heatmap radius dynamically based on zoom level
 * - Only renders when there are valid geographic AQI records
 * - Cleans up on unmount
 *
 * Props:
 *   stations: Array<{ lat, lng, aqi, ... }>  – normalized station/location records
 */
export default function GlobalAQIHeatmapLayer({ stations }) {
  const map      = useMap();
  const heatRef  = useRef(null);
  const stateRef = useRef({ stations: [], zoom: map.getZoom() });

  // Helper: compute heatmap options for current zoom
  function getHeatOptions(zoom) {
    // At world zoom (1-4): large radius, less blur – broad regional coverage
    // At regional zoom (5-8): medium radius
    // At city zoom (9-12): tighter radius, more precise
    // At station zoom (13+): smallest radius, pin-level accuracy
    if (zoom <= 4)  return { radius: 80, blur: 50,  max: 1.0, minOpacity: 0.3 };
    if (zoom <= 6)  return { radius: 55, blur: 40,  max: 1.0, minOpacity: 0.35 };
    if (zoom <= 8)  return { radius: 40, blur: 30,  max: 1.0, minOpacity: 0.4 };
    if (zoom <= 10) return { radius: 30, blur: 22,  max: 1.0, minOpacity: 0.45 };
    if (zoom <= 12) return { radius: 22, blur: 16,  max: 1.0, minOpacity: 0.5 };
    return               { radius: 16, blur: 12,  max: 1.0, minOpacity: 0.55 };
  }

  // Convert stations to heatmap points
  function buildPoints(stationList) {
    return stationList
      .filter(isValidGeoRecord)
      .map(st => {
        const lat = Number(st.lat ?? st.latitude);
        const lon = Number(st.lng ?? st.lon ?? st.longitude);
        const intensity = normalizeAQItoHeat(Number(st.aqi));
        return [lat, lon, intensity];
      });
  }

  // Update heat layer options without recreating it
  function applyOptions(zoom) {
    if (!heatRef.current) return;
    const opts = getHeatOptions(zoom);
    heatRef.current.setOptions(opts);
  }

  // Initialise heat layer once
  useEffect(() => {
    if (heatRef.current) return; // already initialised
    const zoom = map.getZoom();
    const opts = { ...getHeatOptions(zoom), gradient: HEATMAP_GRADIENT };
    heatRef.current = L.heatLayer([], opts).addTo(map);

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
  }, [map]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update data when stations change
  useEffect(() => {
    if (!heatRef.current) return;
    const points = buildPoints(stations);
    heatRef.current.setLatLngs(points);
    stateRef.current.stations = stations;
  }, [stations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen to zoom events to adjust radius
  useMapEvents({
    zoomend() {
      const zoom = map.getZoom();
      stateRef.current.zoom = zoom;
      applyOptions(zoom);
      // Re-apply data after options change (leaflet.heat requires this)
      if (heatRef.current) {
        const points = buildPoints(stateRef.current.stations);
        heatRef.current.setLatLngs(points);
      }
    },
  });

  return null;
}
