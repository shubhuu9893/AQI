import React, { useState, useEffect, useCallback, useContext } from 'react';
import { RefreshCw } from 'lucide-react';
import AQIHero from '../components/dashboard/AQIHero';
import PollutantCard from '../components/dashboard/PollutantCard';
import WeatherCard from '../components/dashboard/WeatherCard';
import HealthRiskCard from '../components/dashboard/HealthRiskCard';
import AQITrendChart from '../components/dashboard/AQITrendChart';
import NearbyStations from '../components/dashboard/NearbyStations';
import ErrorState from '../components/common/ErrorState';
import { getDashboard } from '../services/api';
import { AppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { DEMO_CITIES } from '../data/demoData';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Pune default coords -- overridden by AppContext once geolocation resolves
const DEFAULT_LAT = 18.5204;
const DEFAULT_LON = 73.8567;

export default function Dashboard() {
  // Determine coordinates: either from context (geolocation) or from the
  // "city" query parameter when a city is selected via Search.
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cityId = queryParams.get('city');

  let lat = DEFAULT_LAT;
  let lon = DEFAULT_LON;
  if (cityId) {
    const demoCity = DEMO_CITIES.find(c => c.id === cityId);
    if (demoCity && typeof demoCity.lat === 'number' && typeof demoCity.lng === 'number') {
      lat = demoCity.lat;
      lon = demoCity.lng;
    }
  }
  // Fallback to context values for initial load or when geolocation succeeds
   const { lat: ctxLat, lon: ctxLon, locationLabel: ctxLocationLabel } = useContext(AppContext);
  if (!cityId) {
    // Use the context values only if a city param is not present.
    lat = ctxLat ?? DEFAULT_LAT;
    lon = ctxLon ?? DEFAULT_LON;
  }

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else { setLoading(true); setError(null); }

    try {
      // Single /api/dashboard call returns everything
      const data = await getDashboard(lat, lon);
      setDashData(data);
      setError(null);
    } catch (err) {
      setError(err.message ?? 'Failed to load dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lat, lon]);

  useEffect(() => { loadData(); }, [loadData]);

  if (error && !dashData) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        description={error}
        onRetry={() => loadData()}
      />
    );
  }

  const isLoading = loading && !dashData;
   const locationLabel = dashData?.location
     ? `${dashData.location.city}, ${dashData.location.state}`
     : ctxLocationLabel ?? 'India';

  // Build hero card data from top-level dashboard response
  const heroData = dashData
    ? {
        aqi:       dashData.aqi,
        category:  dashData.category,
        location:  dashData.location,
        updatedAt: dashData.updatedAt,
      }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            {getGreeting()} 
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Air Quality Overview -- {locationLabel}
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => loadData(true)}
          disabled={refreshing}
          aria-label="Refresh dashboard data"
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* AQI Hero */}
      <AQIHero data={heroData} loading={isLoading} />

      {/* Pollutant grid */}
      <section aria-label="Pollutant levels">
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Pollutants
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <PollutantCard key={i} loading />)
            : (dashData?.airQuality?.pollutants ?? []).map(p => (
                <PollutantCard key={p.id} pollutant={p} />
              ))}
        </div>
      </section>

      {/* Weather + Health Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <WeatherCard data={dashData?.weather ?? null} loading={isLoading} />
        <HealthRiskCard data={dashData?.healthRisk ?? null} loading={isLoading} />
      </div>

      {/* AQI Trend -- passes nearest station id so charts are station-scoped */}
      <AQITrendChart stationId={dashData?.nearbyStations?.[0]?.id ?? null} />

      {/* Nearby Stations */}
      <NearbyStations stations={dashData?.nearbyStations ?? []} loading={isLoading} />
    </div>
  );
}
