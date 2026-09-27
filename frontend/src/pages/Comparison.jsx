import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { getCities, getComparison } from '../services/api';
import AQIStatusBadge from '../components/common/AQIStatusBadge';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { formatTemp } from '../utils/formatters';

const CITY_COLORS = ['#0ea5e9', '#22c55e', '#f97316'];
const MAX_CITIES  = 3;

// Only metrics the backend actually returns
const BAR_METRICS = [
  { key: 'aqi',  label: 'AQI' },
  { key: 'pm25', label: 'PM2.5' },
  { key: 'pm10', label: 'PM10' },
  { key: 'no2',  label: 'NO2' },
];

function CityCard({ city, color, onRemove }) {
  return (
    <div className="card card-pad comparison-city-card" style={{ flex: 1, minWidth: 200, borderTop: `4px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', lineHeight: 1.2 }}>{city.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{city.state}</div>
        </div>
        <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--text-muted)' }}
          onClick={onRemove} aria-label={`Remove ${city.name}`}><X size={14} /></button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color, lineHeight: 1 }}>{city.aqi ?? '--'}</span>
        {city.aqi != null && <AQIStatusBadge aqi={city.aqi} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        {[
          { label: 'PM2.5',    value: city.pm25 != null ? `${city.pm25} ug/m3` : '--' },
          { label: 'PM10',     value: city.pm10 != null ? `${city.pm10} ug/m3` : '--' },
          { label: 'NO2',      value: city.no2  != null ? `${city.no2}  ug/m3` : '--' },
          { label: 'Temp',     value: city.temp != null ? formatTemp(city.temp) : '--' },
          { label: 'Humidity', value: city.humidity != null ? `${city.humidity}%` : '--' },
          { label: 'Risk',     value: city.risk_score != null ? `${Math.round(city.risk_score)}/100` : '--' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '6px 8px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Comparison() {
  const [allCities, setAllCities]     = useState([]);
  const [selectedIds, setSelectedIds] = useState(['pune', 'delhi', 'bangalore']);
  const [compData, setCompData]       = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingComp, setLoadingComp] = useState(false);
  const [compError, setCompError]     = useState(null);
  const [citySearch, setCitySearch]   = useState('');
  const [showPicker, setShowPicker]   = useState(false);

  useEffect(() => {
    getCities().then(c => { setAllCities(c); setLoadingCities(false); });
  }, []);

  useEffect(() => {
    if (!selectedIds.length) { setCompData([]); return; }
    setLoadingComp(true);
    setCompError(null);
    getComparison(selectedIds)
      .then(d => { setCompData(d); setLoadingComp(false); })
      .catch(err => { setCompError(err.message); setLoadingComp(false); });
  }, [selectedIds]);

  const filteredCities = useMemo(() => {
    const base = allCities.filter(c => !selectedIds.includes(c.id));
    if (!citySearch) return base;
    const q = citySearch.toLowerCase();
    return base.filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }, [allCities, selectedIds, citySearch]);

  const addCity    = id => { if (selectedIds.length < MAX_CITIES) setSelectedIds(p => [...p, id]); setShowPicker(false); setCitySearch(''); };
  const removeCity = id => setSelectedIds(p => p.filter(x => x !== id));

  const barData = useMemo(() =>
    BAR_METRICS.map(m => {
      const row = { metric: m.label };
      compData.forEach(c => { row[c.name] = c[m.key] ?? 0; });
      return row;
    }), [compData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>City Comparison</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Compare air quality across up to 3 cities</p>
        </div>
        {selectedIds.length < MAX_CITIES && (
          <div style={{ position: 'relative' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowPicker(v => !v)}><Plus size={14} /> Add City</button>
            {showPicker && (
              <div className="dropdown-menu" style={{ right: 0, top: 'calc(100% + 8px)', width: 280, maxHeight: 320, overflowY: 'auto' }}>
                <div style={{ padding: '8px 12px' }}>
                  <input type="search" className="input" placeholder="Search city..." value={citySearch}
                    onChange={e => setCitySearch(e.target.value)} autoFocus style={{ fontSize: 'var(--text-sm)' }} />
                </div>
                {filteredCities.map(c => (
                  <button key={c.id} className="dropdown-item" onClick={() => addCity(c.id)}>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.state}</div>
                    </div>
                  </button>
                ))}
                {!filteredCities.length && (
                  <div style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No cities found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* City cards */}
      {loadingComp
        ? <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {selectedIds.map(id => <div key={id} style={{ flex: 1, minWidth: 200 }}><SkeletonCard lines={5} /></div>)}
          </div>
        : compError
          ? <ErrorState title="Comparison failed" description={compError} onRetry={() => setSelectedIds([...selectedIds])} />
          : selectedIds.length === 0
            ? <EmptyState icon={BarChart2} title="No cities selected" description="Add up to 3 cities to compare." />
            : (
              <div className="comparison-cities" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                {compData.map((city, i) => (
                  <CityCard key={city.id} city={city} color={CITY_COLORS[i]} onRemove={() => removeCity(city.id)} />
                ))}
              </div>
            )
      }

      {/* Bar chart */}
      {compData.length > 0 && (
        <div className="card card-pad">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 20px' }}>Pollutant Comparison</h3>
          <div className="chart-container-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                {compData.map((c, i) => (
                  <Bar key={c.id} dataKey={c.name} fill={CITY_COLORS[i]} radius={[4,4,0,0]} maxBarSize={40} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
