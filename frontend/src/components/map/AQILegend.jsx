import React from 'react';
import { AQI_CATEGORIES } from '../../data/demoData';

/**
 * Legend component that displays the AQI colour scale.
 * It is used in {@link MapPage} to show users how station colours map to categories.
 */
export default function AQILegend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'var(--bg-surface)',
        padding: '4px 8px',
        borderRadius: 4,
        boxShadow: '0 2px 6px rgba(0,0,0,.15)',
        fontSize: 'var(--text-xs)',
        lineHeight: '1.2',
      }}
    >
      {AQI_CATEGORIES.map(cat => (
        <div
          key={cat.range}
          style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              backgroundColor: cat.color,
              borderRadius: 3,
              display: 'inline-block',
            }}
          />
          <span>{cat.label}</span>
        </div>
      ))}
    </div>
  );
}
