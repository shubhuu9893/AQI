import React from 'react';
import { Wind, Droplets, Eye, Gauge, Thermometer, Sun } from 'lucide-react';
import { SkeletonCard } from '../common/Skeleton';
import { formatTemp } from '../../utils/formatters';

function WeatherStat({ icon: Icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-md)',
          background: color ?? 'var(--bg-surface-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color="var(--text-secondary)" />
      </div>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{value}</div>
      </div>
    </div>
  );
}

export default function WeatherCard({ data, loading }) {
  if (loading) return <SkeletonCard lines={5} />;
  if (!data) return null;

  const { temperature, feelsLike, humidity, pressure, windSpeed, windDirection, visibility, condition, uvIndex } = data;

  return (
    <div className="card card-pad" style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Weather
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {formatTemp(temperature)}
            </span>
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
            {condition}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Feels like {formatTemp(feelsLike)}
          </div>
        </div>

        {/* Weather icon placeholder */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <Sun size={32} color="white" />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 8px' }} />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <WeatherStat icon={Droplets}    label="Humidity"   value={`${humidity}%`} />
        <WeatherStat icon={Wind}        label="Wind"       value={`${windSpeed} km/h ${windDirection}`} />
        <WeatherStat icon={Gauge}       label="Pressure"   value={`${pressure} hPa`} />
        <WeatherStat icon={Eye}         label="Visibility" value={`${visibility} km`} />
        <WeatherStat icon={Thermometer} label="UV Index"   value={uvIndex} />
      </div>
    </div>
  );
}
