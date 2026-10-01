import React from 'react';

const MACRO_REGIONS = [
  'All',
  'South Asia',
  'East Asia',
  'Europe',
  'North America',
  'Middle East',
  'Oceania',
  'Africa',
  'South America',
];

/**
 * RegionFilterBar – allows the user to filter the map region-wise and toggle layers.
 *
 * Props:
 *   selectedRegion: string ('All', 'Europe', etc.)
 *   onSelectRegion(name)
 *   showRegions: boolean
 *   onToggleRegions()
 *   showStations: boolean
 *   onToggleStations()
 *   showHeatmap: boolean
 *   onToggleHeatmap()
 */
export default function RegionFilterBar({
  selectedRegion,
  onSelectRegion,
  showRegions,
  onToggleRegions,
  showStations,
  onToggleStations,
  showHeatmap,
  onToggleHeatmap,
}) {
  return (
    <div
      style={{
        position:       'absolute',
        top:            74,
        left:           '50%',
        transform:      'translateX(-50%)',
        zIndex:         1000,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            6,
        maxWidth:       'calc(100vw - 32px)',
        pointerEvents:  'all',
        fontFamily:     'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Macro Region Pills */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            4,
          background:     'rgba(10, 14, 26, 0.88)',
          backdropFilter: 'blur(10px)',
          border:         '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius:   24,
          padding:        '3px 6px',
          boxShadow:      '0 4px 20px rgba(0, 0, 0, 0.45)',
          overflowX:      'auto',
          maxWidth:       '100%',
          scrollbarWidth: 'none',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', paddingLeft: 6, paddingRight: 4, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          Region:
        </span>
        {MACRO_REGIONS.map(reg => {
          const active = selectedRegion === reg;
          return (
            <button
              key={reg}
              onClick={() => onSelectRegion(reg)}
              style={{
                background:    active ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                border:        active ? '1px solid #3b82f6' : '1px solid transparent',
                borderRadius:  16,
                color:         active ? '#93c5fd' : '#94a3b8',
                fontSize:      11,
                fontWeight:    active ? 700 : 500,
                padding:       '4px 10px',
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                transition:    'all 0.15s ease',
              }}
            >
              {reg}
            </button>
          );
        })}
      </div>

      {/* 2. Layer Mode Toggles */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            6,
          background:     'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          border:         '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius:   18,
          padding:        '3px 8px',
          boxShadow:      '0 2px 12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <button
          onClick={onToggleRegions}
          style={{
            background:    showRegions ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            border:        showRegions ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius:  12,
            color:         showRegions ? '#6ee7b7' : '#64748b',
            fontSize:      11,
            fontWeight:    600,
            padding:       '3px 9px',
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            gap:           4,
            transition:    'all 0.15s',
          }}
          title="Toggle Region / Area AQI bubbles"
        >
          🌐 Region AQI
        </button>

        <button
          onClick={onToggleHeatmap}
          style={{
            background:    showHeatmap ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            border:        showHeatmap ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius:  12,
            color:         showHeatmap ? '#fcd34d' : '#64748b',
            fontSize:      11,
            fontWeight:    600,
            padding:       '3px 9px',
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            gap:           4,
            transition:    'all 0.15s',
          }}
          title="Toggle Continuous Area Heatmap"
        >
          🌊 Area Heatmap
        </button>

        <button
          onClick={onToggleStations}
          style={{
            background:    showStations ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            border:        showStations ? '1px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius:  12,
            color:         showStations ? '#93c5fd' : '#64748b',
            fontSize:      11,
            fontWeight:    600,
            padding:       '3px 9px',
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            gap:           4,
            transition:    'all 0.15s',
          }}
          title="Toggle Local Stations"
        >
          📍 Stations
        </button>
      </div>
    </div>
  );
}
