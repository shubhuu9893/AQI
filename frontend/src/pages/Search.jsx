import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Search, MapPin, Activity, Clock, X, ArrowRight, Navigation } from 'lucide-react';
import { getCities, getStations } from '../services/api';
import AQIStatusBadge from '../components/common/AQIStatusBadge';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MAX_RECENT = 5;

export default function SearchPage() {
  const navigate = useNavigate();
  const { setLocationFromCity, setLocationFromCoords, isLocating } = useContext(AppContext);
  const inputRef = useRef(null);

  const [query,          setQuery]    = useState('');
  const [cities,         setCities]   = useState([]);
  const [stations,       setStations] = useState([]);
  const [loading,        setLoading]  = useState(false);
  const [locError,       setLocError] = useState(null);
  const [recentSearches, setRecent]   = useLocalStorage('recent-searches', []);

  useEffect(() => {
    inputRef.current?.focus();
    // Load city list and a broad set of stations for search
    Promise.all([getCities(), getStations({ radiusKm: 20000 }).catch(() => [])])
      .then(([c, s]) => {
        setCities(c);
        setStations(s);
      });
  }, []);

  const filteredCities = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return cities.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.state ?? '').toLowerCase().includes(q) ||
      (c.country ?? '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query, cities]);

  const filteredStations = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return stations.filter(s =>
      s.name.toLowerCase().includes(q) || (s.city ?? '').toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query, stations]);

  const hasResults = filteredCities.length > 0 || filteredStations.length > 0;

  const addRecent = (item) => {
    setRecent(prev => {
      const filtered = prev.filter(r => r.id !== item.id);
      return [item, ...filtered].slice(0, MAX_RECENT);
    });
  };

  // Navigate to dashboard for a city – updates unified context + URL
  const goToCity = (city) => {
    addRecent({ id: city.id, type: 'city', name: city.name, sub: city.state });
    // Update the single source of truth
    setLocationFromCity(city);
    navigate(`/dashboard?city=${encodeURIComponent(city.id)}`);
  };

  // Go to a recent city search (re-uses stored id to find full city object)
  const goToRecentCity = (recent) => {
    const city = cities.find(c => c.id === recent.id);
    if (city) {
      goToCity(city);
    } else {
      // City data not loaded yet – navigate with URL param, dashboard will sync
      navigate(`/dashboard?city=${encodeURIComponent(recent.id)}`);
    }
  };

  const goToStation = (station) => {
    addRecent({ id: station.id, type: 'station', name: station.name, sub: station.city });
    navigate(`/station/${station.id}`);
  };

  // Use current location
  const handleCurrentLocation = async () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setLocationFromCoords(pos.coords.latitude, pos.coords.longitude, 'current-location');
        navigate('/dashboard');
      },
      (err) => {
        if (err.code === 1) {
          setLocError('Location permission denied. Please allow location access in browser settings.');
        } else {
          setLocError('Unable to determine your location. Please try again.');
        }
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 4px' }}>Search</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
          Find cities, locations and monitoring stations
        </p>
      </div>

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search cities, states, or stations…"
          className="input"
          style={{ paddingLeft: 44, paddingRight: query ? 40 : 14, fontSize: 'var(--text-base)', height: 52 }}
          aria-label="Search cities and stations"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Current location button */}
      <button
        className="btn btn-secondary btn-md"
        onClick={handleCurrentLocation}
        disabled={isLocating}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <Navigation size={16} color="var(--primary)" />
        {isLocating ? 'Detecting location…' : '📍 Use Current Location'}
      </button>

      {/* Location error */}
      {locError && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', color: 'var(--danger-dark)', fontSize: 'var(--text-sm)', border: '1px solid var(--danger)' }}>
          {locError}
        </div>
      )}

      {/* Recent searches */}
      {!query && recentSearches.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Recent</span>
            <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', color: 'var(--text-muted)' }} onClick={() => setRecent([])}>
              Clear
            </button>
          </div>
          {recentSearches.map(r => (
            <button
              key={r.id}
              onClick={() => r.type === 'station' ? navigate(`/station/${r.id}`) : goToRecentCity(r)}
              className="dropdown-item"
              style={{ width: '100%', padding: '10px 16px' }}
            >
              <Clock size={14} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.sub}</div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      )}

      {/* No query + no recent */}
      {!query && recentSearches.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-muted)' }}>
          <Search size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>Type to search for cities or monitoring stations</p>
          <p style={{ fontSize: 'var(--text-xs)', margin: '6px 0 0', color: 'var(--text-muted)' }}>Tip: Use Ctrl+K from anywhere to open search</p>
        </div>
      )}

      {/* Results */}
      {query && (
        <>
          {/* Cities */}
          {filteredCities.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 8px', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Cities ({filteredCities.length})
              </div>
              {filteredCities.map(city => (
                <button
                  key={city.id}
                  className="dropdown-item"
                  style={{ width: '100%', padding: '12px 16px' }}
                  onClick={() => goToCity(city)}
                >
                  <MapPin size={16} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{city.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {[city.state, city.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          )}

          {/* Stations */}
          {filteredStations.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 8px', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Monitoring Stations ({filteredStations.length})
              </div>
              {filteredStations.map(station => (
                <button
                  key={station.id}
                  className="dropdown-item"
                  style={{ width: '100%', padding: '12px 16px' }}
                  onClick={() => goToStation(station)}
                >
                  <Activity size={16} color={station.category?.color ?? 'var(--primary)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{station.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{station.city}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {station.aqi !== null && station.aqi !== undefined && (
                      <>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: station.category?.color ?? 'var(--text-primary)' }}>
                          AQI {station.aqi}
                        </span>
                        <AQIStatusBadge aqi={station.aqi} size="xs" />
                      </>
                    )}
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          )}

          {!hasResults && (
            <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 'var(--text-sm)' }}>No results for "<strong>{query}</strong>"</p>
              <p style={{ fontSize: 'var(--text-xs)', margin: '4px 0 0' }}>Try searching for a city name or state</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
