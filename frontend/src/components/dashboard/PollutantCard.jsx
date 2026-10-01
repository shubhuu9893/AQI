import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { getAQICategory } from '../../services/api';
import { SkeletonCard } from '../common/Skeleton';

const POLLUTANT_STANDARDS = {
  pm25: { good: 12,  moderate: 35,  usg: 55 },
  pm10: { good: 54,  moderate: 154, usg: 254 },
  no2:  { good: 53,  moderate: 100, usg: 360 },
  so2:  { good: 35,  moderate: 75,  usg: 185 },
  co:   { good: 4.4, moderate: 9.4, usg: 12.4 },
  o3:   { good: 54,  moderate: 70,  usg: 85 },
};

function getPollutantColor(id, value) {
  // null or undefined → neutral
  if (value === null || value === undefined) return 'var(--text-muted)';
  const std = POLLUTANT_STANDARDS[id];
  if (!std) return 'var(--primary)';
  if (value <= std.good)     return 'var(--aqi-good)';
  if (value <= std.moderate) return 'var(--aqi-moderate)';
  if (value <= std.usg)      return 'var(--aqi-usg)';
  return 'var(--aqi-unhealthy)';
}

/**
 * Safely format a pollutant value.
 *   null / undefined → 'N/A'   (NOT 0 – rule from spec)
 *   0                → '0'
 *   number           → rounded string
 */
function fmtVal(v) {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'number') return v < 10 ? v.toFixed(1) : String(Math.round(v));
  return String(v);
}

export default function PollutantCard({ pollutant, loading }) {
  if (loading) return <SkeletonCard lines={3} />;
  if (!pollutant) return null;

  const { id, name, value, unit, trend, sparkline } = pollutant;

  // Preserve null – do not coerce to 0
  const displayValue = fmtVal(value);
  const color        = getPollutantColor(id, value);
  const sparkData    = sparkline?.map((v, i) => ({ i, v })) ?? [];

  const TrendIcon =
    trend > 0 ? TrendingUp :
    trend < 0 ? TrendingDown :
    Minus;
  const trendColor =
    trend > 0 ? 'var(--danger)' :
    trend < 0 ? 'var(--success)' :
    'var(--text-muted)';

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {name}
        </span>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 800,
            color: displayValue === 'N/A' ? 'var(--text-muted)' : 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {displayValue}
        </span>
        {displayValue !== 'N/A' && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {sparkData.length > 0 && (
        <div style={{ height: 36, margin: '0 -4px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendIcon size={13} color={trendColor} />
          <span style={{ fontSize: 'var(--text-xs)', color: trendColor, fontWeight: 600 }}>
            {trend === 0 ? 'Stable' : `${Math.abs(trend)}%`}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>vs yesterday</span>
        </div>
      )}
    </div>
  );
}
