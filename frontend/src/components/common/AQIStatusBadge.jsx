import React from 'react';
 // Import the pure helper that maps AQI values to category objects.
 // The original import pointed to the API layer which throws an error during rendering
 // because it expects network calls. We now use the local utility defined in demoData.
 import { getAQICategory } from '../../data/demoData';

export default function AQIStatusBadge({ aqi, label, size = 'sm' }) {
  const cat = label ? null : getAQICategory(aqi);
  const cssClass = cat?.cssClass ?? 'neutral';
  const displayLabel = label ?? cat?.label ?? '--';

  const sizes = {
    xs: { fontSize: 'var(--text-xs)', padding: '2px 6px' },
    sm: { fontSize: 'var(--text-xs)', padding: '3px 8px' },
    md: { fontSize: 'var(--text-sm)', padding: '4px 10px' },
    lg: { fontSize: 'var(--text-base)', padding: '6px 14px' },
  };

  return (
    <span
      className={`badge badge-${cssClass}`}
      style={sizes[size]}
      aria-label={`AQI category: ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
}
