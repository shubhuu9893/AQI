import React from 'react';
import { getAQICategory } from '../../services/api';

/**
 * Circular AQI ring visualization.
 * Draws a semi-circle arc proportional to the AQI value (0-500 scale).
 */
export default function AQIRing({ aqi, size = 200 }) {
  const cat = getAQICategory(aqi ?? 0);

  // Arc params
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.72;
  const strokeWidth = (size / 2) * 0.1;
  const circumference = Math.PI * radius; // half circle

  // Clamp AQI to 0-500
  const normalised = Math.min(Math.max(aqi ?? 0, 0), 500) / 500;
  const dashOffset = circumference * (1 - normalised);

  // Half-circle arc starting from left (180deg) going to right (0deg)
  const startX = cx - radius;
  const startY = cy;
  const endX   = cx + radius;
  const endY   = cy;

  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox={`0 0 ${size} ${size * 0.6}`}
      aria-label={`AQI ${aqi} -- ${cat.label}`}
      role="img"
    >
      {/* Background arc */}
      <path
        d={arcPath}
        fill="none"
        stroke="var(--bg-surface-3)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Colored arc -- gradient overlay via multiple segments */}
      <path
        d={arcPath}
        fill="none"
        stroke={cat.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
      />

      {/* AQI value */}
      <text
        x={cx}
        y={cy * 0.82}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontFamily="var(--font-sans)"
        fontWeight="800"
        fontSize={size * 0.18}
      >
        {aqi ?? '--'}
      </text>

      {/* Category label */}
      <text
        x={cx}
        y={cy * 1.08}
        textAnchor="middle"
        fill={cat.color}
        fontFamily="var(--font-sans)"
        fontWeight="600"
        fontSize={size * 0.065}
      >
        {cat.label}
      </text>

      {/* Scale labels */}
      <text x={startX - 2} y={cy + 18} textAnchor="middle" fill="var(--text-muted)" fontSize={size * 0.055} fontFamily="var(--font-sans)">0</text>
      <text x={endX + 2}   y={cy + 18} textAnchor="middle" fill="var(--text-muted)" fontSize={size * 0.055} fontFamily="var(--font-sans)">500</text>
    </svg>
  );
}
