import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import AQIRing from '../common/AQIRing';
import AQIProgress from '../common/AQIProgress';
import AQIStatusBadge from '../common/AQIStatusBadge';
import { SkeletonCard } from '../common/Skeleton';
import { timeAgo } from '../../utils/formatters';

/**
 * Display a pollutant value safely:
 *   null / undefined → "N/A"
 *   0               → "0"
 *   number          → rounded string
 */
function fmtPollutant(v) {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'number') return v < 10 ? v.toFixed(1) : String(Math.round(v));
  return String(v);
}

export default function AQIHero({ data, loading }) {
  if (loading) return <SkeletonCard lines={5} />;
  if (!data) return null;

  const { aqi, category, location, updatedAt, pollutants = [] } = data;

  // Pick the three key pollutants from the real data; fall back to N/A
  const getPollutant = (id) => pollutants.find(p => p.id === id);
  const pm25 = getPollutant('pm25');
  const pm10 = getPollutant('pm10');
  const no2  = getPollutant('no2');

  const quickPollutants = [
    { name: 'PM2.5', value: fmtPollutant(pm25?.value), unit: pm25?.unit ?? 'µg/m³' },
    { name: 'PM10',  value: fmtPollutant(pm10?.value), unit: pm10?.unit ?? 'µg/m³' },
    { name: 'NO₂',   value: fmtPollutant(no2?.value),  unit: no2?.unit  ?? 'µg/m³' },
  ];

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative background circle */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: category?.color ?? '#0ea5e9',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />

      <div style={{ padding: 'var(--space-6)', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>
              Current Air Quality
            </div>
            {location?.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} color="var(--primary)" />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {location.city}{location.state ? `, ${location.state}` : ''}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            <Clock size={12} />
            <span>Updated {timeAgo(updatedAt)}</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          {/* AQI Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <AQIRing aqi={aqi} size={180} />
            <AQIStatusBadge aqi={aqi} size="md" />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                AQI Scale (0 – 500)
              </div>
              <AQIProgress aqi={aqi} />
            </div>

            {/* Quick pollutant strip – real data */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {quickPollutants.map(p => (
                <div
                  key={p.name}
                  style={{
                    background: 'var(--bg-surface-3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {p.value}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{p.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
