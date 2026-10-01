import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { RefreshCw, MapPin, Wind, AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AQIHero from '../components/dashboard/AQIHero';
import PollutantCard from '../components/dashboard/PollutantCard';
import WeatherCard from '../components/dashboard/WeatherCard';
import HealthRiskCard from '../components/dashboard/HealthRiskCard';
import AQITrendChart from '../components/dashboard/AQITrendChart';
import NearbyStations from '../components/dashboard/NearbyStations';
import ErrorState from '../components/common/ErrorState';
import { getDashboard } from '../services/api';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DEMO_CITIES } from '../data/demoData';

function getGreeting(name) {
  const h = new Date().getHours();
  const timeGreeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

export default function Dashboard() {
  const routerLocation = useLocation();
  const navigate        = useNavigate();
  const { location: ctxLocation, setLocationFromCity } = useContext(AppContext);
  const { user } = useAuth() || {};
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : null;

  // -----------------------------------------------------------------------
  // Resolve coordinates from URL query param OR context – never hardcode Pune
  // -----------------------------------------------------------------------
  const queryParams = new URLSearchParams(routerLocation.search);
  const cityId      = queryParams.get('city');

  // When a city param is present, sync context (handles page reload / direct URL)
  const syncedRef = useRef(null);
  useEffect(() => {
    if (!cityId || syncedRef.current === cityId) return;
    const demoCity = DEMO_CITIES.find(c => c.id === cityId);
    if (demoCity) {
      setLocationFromCity(demoCity);
      syncedRef.current = cityId;
    }
  }, [cityId, setLocationFromCity]);

  // Use context coords (which now reflect search/geolocation/URL)
  const lat = ctxLocation.lat;
  const lon = ctxLocation.lon;

  const [dashData,   setDashData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else { setLoading(true); setError(null); }

    try {
      const data = await getDashboard(lat, lon);
      setDashData(data);
      setError(null);
    } catch (err) {
      setError(err.message ?? 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lat, lon]);

  // Reload when coordinates change
  useEffect(() => { loadData(); }, [loadData]);

  // -----------------------------------------------------------------------
  // Display label – prefer API-resolved location, then context label
  // -----------------------------------------------------------------------
  const locationLabel = dashData?.location?.city
    ? [dashData.location.city, dashData.location.state].filter(Boolean).join(', ')
    : ctxLocation.label || 'Global';

  // -----------------------------------------------------------------------
  // Hero data – real values only, null if not yet loaded
  // -----------------------------------------------------------------------
  const heroData = dashData
    ? {
        aqi:       dashData.aqi,
        category:  dashData.category,
        location:  dashData.location,
        updatedAt: dashData.updatedAt,
        // Pass real pollutants so hero strip shows actual values
        pollutants: dashData.airQuality?.pollutants ?? [],
      }
    : null;

  const isLoading = loading && !dashData;

  if (error && !dashData) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        description={error}
        onRetry={() => loadData()}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            {getGreeting(firstName)}
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={13} style={{ flexShrink: 0, color: 'var(--primary)' }} />
            Air Quality Overview — {locationLabel}
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => loadData(true)}
          disabled={refreshing}
          aria-label="Refresh dashboard data"
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Soft error banner when we have stale data + error */}
      {error && dashData && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          background: 'var(--warning-light)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--warning)', fontSize: 'var(--text-sm)', color: 'var(--warning-dark)',
        }}>
          <AlertTriangle size={15} />
          <span>Showing cached data. {error}</span>
        </div>
      )}

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

      {/* AQI Trend */}
      <AQITrendChart stationId={dashData?.nearbyStations?.[0]?.id ?? null} />

      {/* Nearby Stations */}
      <NearbyStations stations={dashData?.nearbyStations ?? []} loading={isLoading} />
    </div>
  );
}
