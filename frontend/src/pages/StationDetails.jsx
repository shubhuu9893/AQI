import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Activity, Clock, Database } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getStationById, getHealthRisk } from '../services/api';
import AQIRing from '../components/common/AQIRing';
import AQIStatusBadge from '../components/common/AQIStatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import { SkeletonCard } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import Tabs from '../components/common/Tabs';
import { timeAgo } from '../utils/formatters';

const TREND_TABS = [
  { value: '24h', label: '24H' },
  { value: '7d',  label: '7D' },
];

function PollutantRow({ name, value, unit, color }) {
  const pct = Math.min(((value ?? 0) / 200) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 48, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color ?? 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ width: 80, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
        {value ?? '--'} <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>{unit}</span>
      </span>
    </div>
  );
}

export default function StationDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [station, setStation]     = useState(null);
  const [healthRisk, setRisk]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [trendPeriod, setPeriod]  = useState('24h');

  useEffect(() => {
    setLoading(true);
    setError(null);

    getStationById(id)
      .then(async s => {
        setStation(s);
        // Also fetch health risk for this station
        try {
          const hr = await getHealthRisk(s.id, {
            aqi: s.aqi, pm25: s.pm25, pm10: s.pm10, no2: s.no2, so2: s.so2, co: s.co, o3: s.o3,
          });
          setRisk(hr);
        } catch {
          // health risk is non-critical
        }
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {[1,2,3].map(i => <SkeletonCard key={i} lines={4} />)}
    </div>
  );

  if (error) return <ErrorState title="Station not found" description={error} onRetry={() => navigate(-1)} />;

  const trendData = trendPeriod === '24h' ? (station.trend24h ?? []) : (station.trend7d ?? []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Station header */}
      <div className="card" style={{ padding: 'var(--space-6)',
        background: 'linear-gradient(135deg,var(--bg-surface) 0%,var(--bg-surface-2) 100%)',
        borderLeft: `4px solid ${station.category.color}` }}>
        <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <AQIRing aqi={station.aqi} size={160} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{station.name}</h2>
              <AQIStatusBadge aqi={station.aqi} size="md" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--primary)" />
                {station.city}, {station.state} ? {station.distance?.toFixed(1)} km away
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <Activity size={14} color="var(--success)" /> Station ID: <strong>{station.id}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <Clock size={14} /> Updated {timeAgo(station.updatedAt)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <Database size={14} />
                <span style={{ padding: '2px 8px', background: 'var(--info-light)', color: 'var(--info)',
                  borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: 'var(--text-xs)' }}>{station.dataSource}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pollutants + metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card card-pad">
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Pollutant Levels</div>
          <PollutantRow name="PM2.5" value={station.pm25} unit="ug/m3" color="#f97316" />
          <PollutantRow name="PM10"  value={station.pm10} unit="ug/m3" color="#eab308" />
          <PollutantRow name="NO2"   value={station.no2}  unit="ug/m3" color="#6366f1" />
          <PollutantRow name="SO2"   value={station.so2}  unit="ug/m3" color="#8b5cf6" />
          <PollutantRow name="CO"    value={station.co}   unit="mg/m3" color="#ec4899" />
          <PollutantRow name="O3"    value={station.o3}   unit="ug/m3" color="#0ea5e9" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Health risk */}
          {healthRisk && (
            <div className="card card-pad">
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Health Risk</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: `var(--aqi-${healthRisk.cssClass})` }}>{healthRisk.level}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{healthRisk.score}/100</span>
              </div>
              <ProgressBar value={healthRisk.score} max={100} color={`var(--aqi-${healthRisk.cssClass})`} height={6} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '12px 0 0', lineHeight: 1.6 }}>{healthRisk.recommendation}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="card card-pad" style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Station Info</div>
            {[
              { label: 'Station ID',   value: station.id },
              { label: 'City',         value: station.city },
              { label: 'State',        value: station.state },
              { label: 'Lat / Lon',    value: `${station.lat?.toFixed(4)}, ${station.lng?.toFixed(4)}` },
              { label: 'Distance',     value: `${station.distance?.toFixed(1)} km` },
              { label: 'Status',       value: ' Active' },
              { label: 'Data Source',  value: station.dataSource },
              { label: 'Last Updated', value: timeAgo(station.updatedAt) },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{row.value ?? '--'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="card card-pad">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>AQI Trend</div>
          <Tabs tabs={TREND_TABS} active={trendPeriod} onChange={setPeriod} />
        </div>

        {trendData.length === 0
          ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No trend data available for this station
            </div>
          : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={station.category.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={station.category.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--text-muted)' }} />
                  <Area type="monotone" dataKey="aqi" stroke={station.category.color} strokeWidth={2.5}
                    fill="url(#stGrad)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        }
      </div>
    </div>
  );
}
