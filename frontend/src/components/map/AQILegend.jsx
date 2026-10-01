import React, { useState } from 'react';
import { AQI_CATEGORIES } from '../../utils/aqiUtils';

/**
 * AQILegend
 *
 * Fixed bottom-left legend card that explains the AQI color scale.
 * Designed for dark map backgrounds with semi-transparent backdrop.
 * Collapsible on mobile to save screen space.
 */
export default function AQILegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position:     'absolute',
        bottom:       20,
        left:         16,
        zIndex:       1000,
        background:   'rgba(10, 12, 20, 0.88)',
        backdropFilter: 'blur(8px)',
        border:       '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow:    '0 4px 20px rgba(0,0,0,0.5)',
        minWidth:     180,
        overflow:     'hidden',
        pointerEvents:'all',
        userSelect:   'none',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        style={{
          width:      '100%',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding:    '8px 12px',
          background: 'transparent',
          border:     'none',
          cursor:     'pointer',
          color:      '#e2e8f0',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8' }}>
          AQI Index
        </span>
        <span style={{ fontSize: 14, color: '#64748b', transition: 'transform 0.2s', transform: collapsed ? 'rotate(180deg)' : 'none' }}>
          ▲
        </span>
      </button>

      {/* Category rows */}
      {!collapsed && (
        <div style={{ padding: '6px 0 8px' }}>
          {AQI_CATEGORIES.map(cat => (
            <div
              key={cat.range}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        8,
                padding:    '3px 12px',
              }}
            >
              {/* Color swatch */}
              <div
                style={{
                  width:        12,
                  height:       12,
                  borderRadius: 3,
                  background:   cat.color,
                  flexShrink:   0,
                  boxShadow:    `0 0 6px ${cat.color}80`,
                }}
              />
              {/* Label */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2 }}>
                  {cat.label === 'Unhealthy for Sensitive Groups' ? 'Unhealthy (Sensitive)' : cat.label}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1 }}>
                  AQI {cat.range}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
