/**
 * Map.jsx – Global AQI Map Page
 *
 * Architecture:
 *   WORLD VIEW   → broad AQI heatmap, no station markers
 *   REGIONAL     → heatmap + fewer markers
 *   CITY VIEW    → heatmap + station markers with AQI bubbles
 *   STATION VIEW → detailed station markers + popups
 *
 * Data:
 *   - Stations from GET /api/stations/nearby (local DB, India coverage)
 *   - AQI for any selected location from GET /api/air_quality (global via AirVisual+OpenAQ)
 *   - Heatmap built from real station data only – NO fake/random points
 *
 * Coverage note:
 *   The backend DB contains Indian stations. For non-India locations,
 *   the AQI info panel shows live data for the selected point but there
 *   will be no nearby station markers (accurate – not pretended).
 */

import React, {
  useContext, useEffect, useState, useCallback, useRef, useMemo,
} from 'react';
import { AppContext } from '../context/AppContext';
import { getStations, getAirQuality, getRegionsAQI } from '../services/api';
import { normalizeAQIPoint, isValidGeoRecord, getAQIColor } from '../utils/aqiUtils';
import { DEFAULT_MAP_CENTER } from '../data/demoData';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer, TileLayer, CircleMarker, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon issue with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

import AQIStationMarker  from '../components/map/AQIStationMarker';
import AQIRegionMarker   from '../components/map/AQIRegionMarker';
import AQIHeatmapLayer   from '../components/map/AQIHeatmapLayer';
import AQILegend         from '../components/map/AQILegend';
import AQIInfoPanel      from '../components/map/AQIInfoPanel';
import MapSearchBar      from '../components/map/MapSearchBar';
import MapControls       from '../components/map/MapControls';


// ─────────────────────────────────────────────────────────────
// Zoom level thresholds for progressive visualization
// ─────────────────────────────────────────────────────────────
const ZOOM_SHOW_MARKERS    = 7;  // Show station markers at this zoom+
const ZOOM_STATION_DETAIL  = 10; // Show full detail markers at this zoom+
const INITIAL_ZOOM         = 3;  // World view on load
const CITY_ZOOM            = 10; // Zoom when flying to a city

// ─────────────────────────────────────────────────────────────
// Sub-components (must be rendered inside <MapContainer>)
// ─────────────────────────────────────────────────────────────

/** Tracks zoom level for progressive visualization */
function ZoomTracker({ onZoom }) {
  useMapEvents({
    zoomend(e) { onZoom(e.target.getZoom()); },
  });
  return null;
}

/** Recalculates Leaflet size on container resize (sidebar toggle, layout changes, window resize) */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    map.invalidateSize();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
    }

    const onWinResize = () => map.invalidateSize();
    window.addEventListener('resize', onWinResize);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, [map]);

  return null;
}

/** Fly-to when location changes */
function MapCentre({ lat, lon, triggerFly }) {
  const map = useMap();
  const prevRef = useRef(null);

  useEffect(() => {
    if (lat == null || lon == null) return;
    const key = `${lat},${lon}`;
    if (prevRef.current === key) return; // same location, skip
    prevRef.current = key;
    const zoom = Math.max(map.getZoom(), CITY_ZOOM);
    map.flyTo([lat, lon], zoom, { duration: 1.4, easeLinearity: 0.25 });
  }, [lat, lon, triggerFly]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/** World view button handler */
function WorldViewHelper({ triggerWorld }) {
  const map = useMap();
  useEffect(() => {
    if (!triggerWorld) return;
    map.flyTo([20, 0], INITIAL_ZOOM, { duration: 1.5 });
  }, [triggerWorld]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Selected location pulse marker */
function SelectedLocationMarker({ lat, lon, aqi }) {
  if (lat == null || lon == null) return null;
  const color = aqi != null ? getAQIColor(aqi) : '#3b82f6';
  return (
    <>
      <CircleMarker
        center={[lat, lon]}
        radius={22}
        pathOptions={{
          color: color,
          fillColor: color,
          fillOpacity: 0.18,
          weight: 1.5,
        }}
      />
      <CircleMarker
        center={[lat, lon]}
        radius={9}
        pathOptions={{
          color: '#ffffff',
          fillColor: color,
          fillOpacity: 0.95,
          weight: 2.5,
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main MapPage
// ─────────────────────────────────────────────────────────────

export default function MapPage() {
  const {
    location: appLocation,
    setLocationFromCity,
    setLocationFromCoords,
    isLocating,
  } = useContext(AppContext);

  // Map state
  const [zoom,         setZoom]         = useState(INITIAL_ZOOM);
  const [triggerWorld, setTriggerWorld] = useState(0);
  const [flyTrigger,   setFlyTrigger]   = useState(0);

  // Data state
  const [stations,        setStations]        = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [regions,         setRegions]         = useState([]);
  const [regionsLoading,  setRegionsLoading]  = useState(false);
  // Toggles are always-on; filter bar has been removed from UI
  const showRegions  = true;
  const showStations = true;
  const showHeatmap  = true;


  const [aqiData,      setAqiData]      = useState(null);
  const [aqiLoading,   setAqiLoading]   = useState(false);
  const [aqiError,     setAqiError]     = useState(null);

  // UI state
  const [showPanel,    setShowPanel]    = useState(false);
  const [locError,     setLocError]     = useState(null);

  // Current selected location (from context or last city search)
  const hasLocation = appLocation.source !== 'initial'
    || (appLocation.lat !== 20 && appLocation.lon !== 0);

  const lat = hasLocation ? appLocation.lat : null;
  const lon = hasLocation ? appLocation.lon : null;

  // ── Load nearby stations (local DB) ────────────────────────
  const loadStations = useCallback(async (slat, slon) => {
    if (slat == null || slon == null) return;
    setStationsLoading(true);
    try {
      const data = await getStations({ lat: slat, lon: slon, radiusKm: 25000 });
      setStations((data ?? []).filter(isValidGeoRecord));
    } catch (err) {
      console.warn('[Map] stations fetch failed:', err.message);
      setStations([]);
    } finally {
      setStationsLoading(false);
    }
  }, []);

  // ── Load region-wise AQI measurements ─────────────────────
  const loadRegions = useCallback(async (macro = 'All') => {
    setRegionsLoading(true);
    try {
      const data = await getRegionsAQI(macro);
      setRegions(data ?? []);
    } catch (err) {
      console.warn('[Map] regions fetch failed:', err.message);
      setRegions([]);
    } finally {
      setRegionsLoading(false);
    }
  }, []);

  // ── Load AQI for selected point ──────────────────────────────
  const loadAQI = useCallback(async (alat, alon) => {
    if (alat == null || alon == null) return;
    setAqiLoading(true);
    setAqiError(null);
    try {
      const data = await getAirQuality(alat, alon);
      setAqiData(data);
      setShowPanel(true);
    } catch (err) {
      setAqiError(err.message || 'Unable to load AQI data');
      setAqiData(null);
    } finally {
      setAqiLoading(false);
    }
  }, []);

  // On initial mount: load stations and global regions
  useEffect(() => {
    loadStations(20.5937, 78.9629);
    loadRegions('All');
  }, [loadStations, loadRegions]);

  // When location changes (from search / geolocation):
  useEffect(() => {
    if (lat == null || lon == null) return;
    loadAQI(lat, lon);
    setFlyTrigger(t => t + 1);
  }, [lat, lon]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle city selection from map search bar ────────────────
  const handleCitySelect = useCallback((cityObj) => {
    setLocationFromCity(cityObj);
    loadStations(cityObj.lat, cityObj.lng ?? cityObj.lon);
  }, [setLocationFromCity, loadStations]);

  // ── Handle region selection from region markers ─────────────
  const handleRegionSelect = useCallback((region) => {
    setLocationFromCity({
      id: region.id,
      name: region.name,
      state: region.macroRegion,
      country: region.country,
      lat: region.lat,
      lng: region.lng,
    });
    setAqiData({
      aqi: region.aqi,
      category: region.category,
      pollutants: [
        { id: 'pm25', name: 'PM2.5', value: region.pm25, unit: 'µg/m³' },
        { id: 'pm10', name: 'PM10',  value: region.pm10, unit: 'µg/m³' },
        { id: 'no2',  name: 'NO2',   value: region.no2,  unit: 'µg/m³' },
        { id: 'so2',  name: 'SO2',   value: region.so2,  unit: 'µg/m³' },
        { id: 'co',   name: 'CO',    value: region.co,   unit: 'mg/m³' },
        { id: 'o3',   name: 'O3',    value: region.o3,   unit: 'µg/m³' },
      ],
      updatedAt: new Date().toISOString(),
    });
    setShowPanel(true);
    setFlyTrigger(t => t + 1);
  }, [setLocationFromCity]);

  // ── Handle current location button ──────────────────────────
  const handleCurrentLocation = useCallback(() => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await setLocationFromCoords(latitude, longitude, 'current-location');
        loadStations(latitude, longitude);
      },
      (err) => {
        const msg = err.code === 1
          ? 'Location permission denied. Enable location access in browser settings.'
          : err.code === 3
          ? 'Location request timed out. Please try again.'
          : 'Unable to determine your location.';
        setLocError(msg);
        setTimeout(() => setLocError(null), 5000);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [setLocationFromCoords, loadStations]);

  // ── Combined geographic data (stations + regions + live queried location) ──
  const combinedPoints = useMemo(() => {
    const list = [];
    if (showStations) {
      list.push(...stations);
    }
    if (showRegions) {
      list.push(...regions);
    }
    if (lat != null && lon != null && aqiData?.aqi != null) {
      const alreadyExists = list.some(
        s => Math.abs((s.lat ?? s.latitude) - lat) < 0.05 &&
             Math.abs((s.lng ?? s.lon ?? s.longitude) - lon) < 0.05
      );
      if (!alreadyExists) {
        list.push({
          id: `selected-${lat}-${lon}`,
          lat,
          lng: lon,
          aqi: aqiData.aqi,
          name: appLocation.city || appLocation.label || 'Selected Location',
          city: appLocation.city || '',
          state: appLocation.state || '',
          country: appLocation.country || '',
          pm25: aqiData.pollutants?.find(p => p.id === 'pm25')?.value ?? null,
          pm10: aqiData.pollutants?.find(p => p.id === 'pm10')?.value ?? null,
          no2:  aqiData.pollutants?.find(p => p.id === 'no2')?.value ?? null,
          so2:  aqiData.pollutants?.find(p => p.id === 'so2')?.value ?? null,
          co:   aqiData.pollutants?.find(p => p.id === 'co')?.value ?? null,
          o3:   aqiData.pollutants?.find(p => p.id === 'o3')?.value ?? null,
          dataSource: 'Live AQI',
        });
      }
    }
    return list;
  }, [stations, regions, showStations, showRegions, lat, lon, aqiData, appLocation]);

  // ── Determine whether to show station markers ────────────────
  const showStationMarkers = zoom >= ZOOM_SHOW_MARKERS;

  // ── Map initial center ───────────────────────────────────────
  const initialCenter = [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  return (
    <div
      style={{
        position: 'relative',
        height:   'calc(100vh - var(--navbar-height, 60px))',
        width:    '100%',
        overflow: 'hidden',
        background: '#0a0c14',
      }}
    >
      {/* ── Floating Search Bar ───────────────────────────────── */}
      <MapSearchBar onCitySelect={handleCitySelect} />


      {/* ── AQI Info Panel (top-right) ────────────────────────── */}
      {showPanel && (
        <AQIInfoPanel
          location={appLocation}
          airQuality={aqiData}
          loading={aqiLoading}
          onClose={() => setShowPanel(false)}
        />
      )}

      {/* ── Error toast ───────────────────────────────────────── */}
      {(locError || aqiError) && (
        <div style={{
          position:   'absolute',
          bottom:     80,
          left:       '50%',
          transform:  'translateX(-50%)',
          zIndex:     1001,
          background: 'rgba(239,68,68,0.92)',
          backdropFilter: 'blur(8px)',
          border:     '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding:    '10px 16px',
          color:      '#fff',
          fontSize:   13,
          fontWeight: 500,
          maxWidth:   380,
          textAlign:  'center',
          pointerEvents: 'none',
        }}>
          {locError || aqiError}
        </div>
      )}

      {/* ── No data notice (when no stations + no selected location) */}
      {!stationsLoading && stations.length === 0 && !hasLocation && (
        <div style={{
          position:   'absolute',
          top:        '50%',
          left:       '50%',
          transform:  'translate(-50%, -50%)',
          zIndex:     999,
          background: 'rgba(10,12,20,0.9)',
          backdropFilter: 'blur(12px)',
          border:     '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding:    '20px 28px',
          color:      '#94a3b8',
          fontSize:   14,
          textAlign:  'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌍</div>
          <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>Global AQI Map</div>
          <div>Search for a city to load live AQI data</div>
        </div>
      )}

      {/* ── Leaflet Map ───────────────────────────────────────── */}
      <MapContainer
        center={initialCenter}
        zoom={INITIAL_ZOOM}
        zoomControl={false}          // We use custom controls
        style={{ height: '100%', width: '100%', background: '#0a0c14' }}
        scrollWheelZoom
        worldCopyJump
        minZoom={2}
        maxZoom={18}
      >
        {/*
         * Dark map tile layer – ESRI Dark Gray Canvas
         * Completely free, no API key required, excellent contrast for AQI colors
         * Base layer + reference labels overlay for city/road names
         */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          maxZoom={16}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          attribution=""
          maxZoom={16}
          opacity={0.9}
        />

        {/* Zoom tracker for progressive rendering */}
        <ZoomTracker onZoom={setZoom} />

        {/* Dynamic size recalculation on sidebar toggle, resize, etc. */}
        <MapResizeHandler />

        {/* World view trigger */}
        <WorldViewHelper triggerWorld={triggerWorld} />

        {/* Fly to location when it changes */}
        {lat != null && lon != null && (
          <MapCentre lat={lat} lon={lon} triggerFly={flyTrigger} />
        )}

        {/* Selected location pulse marker */}
        {lat != null && lon != null && (
          <SelectedLocationMarker lat={lat} lon={lon} aqi={aqiData?.aqi} />
        )}

        {/*
         * AQI Heatmap – continuous spatial coverage across regions & areas.
         * Visible at all zoom levels when enabled. Built from real-time regional and station AQI.
         */}
        {showHeatmap && <AQIHeatmapLayer stations={combinedPoints} />}

        {/*
         * Region / Area-wise AQI bubbles – prominent geographic area markers
         */}
        {showRegions && regions.map(reg => (
          <AQIRegionMarker
            key={reg.id}
            region={reg}
            onSelect={handleRegionSelect}
          />
        ))}

        {/*
         * Ground Station markers – shown when station layer is active and zoomed in (zoom >= 7)
         */}
        {showStations && showStationMarkers && stations.map(st => (
          <AQIStationMarker
            key={st.id}
            station={st}
            visible={showStationMarkers}
          />
        ))}

        {/* AQI Legend – fixed bottom-left */}
        <AQILegend />

        {/* Map Controls – world view, location, zoom */}
        <MapControls
          onCurrentLocation={handleCurrentLocation}
          isLocating={isLocating}
        />
      </MapContainer>

      {/* Real-time Data attribution */}
      <div style={{
        position:   'absolute',
        bottom:     8,
        right:      16,
        zIndex:     999,
        fontSize:   10,
        color:      'rgba(255,255,255,0.4)',
        pointerEvents: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        Real-Time AQI & Pollutants: OpenWeatherMap Air Pollution API + Ground Sensors
      </div>
    </div>
  );
}