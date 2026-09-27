import React from 'react';
import { clamp, percentage } from '../../utils/formatters';

export default function ProgressBar({ value, max = 100, color, height = 6, className = '', showLabel = false }) {
  const pct = percentage(value, max);
  const fillColor = color ?? 'var(--primary)';

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{pct}%</span>
        </div>
      )}
      <div
        className={`progress-bar ${className}`}
        style={{ height }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>
    </div>
  );
}
