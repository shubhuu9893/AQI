import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
// Import the leaflet.heat plugin which adds `L.heatLayer` to Leaflet.
import 'leaflet.heat';

/**
 * React wrapper around the Leaflet Heat Layer.
 * The component receives an array of station objects and draws
 * a heatmap using their coordinates and AQI values.
 *
 * It keeps a single `L.heatLayer` instance per mount and updates its data when
 * the `stations` prop changes. On unmount the layer is removed from the map.
 */
export default function AQIHeatmapLayer({ stations }) {
  const map = useMap();
  const heatRef = useRef(null);

  // Initialise heat layer once on mount
  useEffect(() => {
    if (!heatRef.current) {
       // Create a new heat layer with options tuned for AQI visualization.
       // Radius controls the spread of each station's influence on the map;
       // blur smooths the transition between stations; maxZoom limits
       // rendering at very high zoom levels.
       const gradient = {
         0: '#22c55e',   // Good (≤50)
         0.2: '#eab308', // Moderate (51–100)
         0.4: '#f97316', // USG (101–150)
         0.6: '#ef4444', // Unhealthy (151–200)
         0.8: '#a855f7', // Very Unhealthy (201–300)
         1: '#9f1239',   // Hazardous (>300)
       };

       heatRef.current = L.heatLayer([], {
         radius: 25,
         blur: 20,
         maxZoom: 17,
         gradient,
       }).addTo(map);
    }
    // Update data whenever stations change. Only include stations with
    // complete coordinates and a numeric AQI value.
    const normalizeAQI = aqi => {
      // Normalize AQI to a [0,1] range based on standard thresholds.
      if (aqi <= 50) return 0;
      if (aqi <= 100) return 0.2;
      if (aqi <= 150) return 0.4;
      if (aqi <= 200) return 0.6;
      if (aqi <= 300) return 0.8;
      return 1; // Hazardous or beyond
    };

    const validPoints = stations
      .filter(st => st.lat != null && st.lng != null && typeof st.aqi === 'number')
      .map(st => [st.lat, st.lng, normalizeAQI(st.aqi)]);
    heatRef.current.setLatLngs(validPoints);

    // Clean up on unmount
    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
  }, [stations, map]);

  // No JSX to render – the layer is directly added to the Leaflet map.
  return null;
}
