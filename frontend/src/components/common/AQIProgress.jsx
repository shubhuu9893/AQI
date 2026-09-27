import React from 'react';
import { AQI_CATEGORIES } from '../../data/demoData';

/**
 * Horizontal AQI scale bar with a needle indicator.
 */
export default function AQIProgress({ aqi }) {
  const pct = Math.min(Math.max((aqi ?? 0) / 500, 0), 1) * 100;

  return (
    <div style={{ width: '100%' }}>
      {/* Gradient bar */}
      <div
        style={{
          position: 'relative',
          height: 12,
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(to right, #22c55e 0%, #eab308 20%, #f97316 30%, #ef4444 40%, #a855f7 60%, #9f1239 100%)',
          marginBottom: 6,
        }}
        role="img"
        aria-label={`AQI ${aqi} on scale 0-500`}
      >
        {/* Needle */}
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: `${pct}%`,
            transform: 'translateX(-50%)',
            width: 4,
            height: 20,
            background: 'var(--text-primary)',
            borderRadius: 2,
            transition: 'left 0.8s ease',
          }}
        />
      </div>

      {/* Scale labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {AQI_CATEGORIES.map(cat => (
          <span
            key={cat.range}
            style={{
              fontSize: 9,
              color: cat.color,
              fontWeight: 'var(--font-semibold)',
              lineHeight: 1,
            }}
          >
            {cat.range.split('-')[0]}
          </span>
        ))}
      </div>
    </div>
  );
}
