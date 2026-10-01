import React from 'react';
import { getAQICategory, getAQIColor } from '../../utils/aqiUtils';

/** null/undefined → 'N/A', 0 stays 0 */
function fmtVal(v, dec = 0) {
  if (v === null || v === undefined) return 'N/A';
  return typeof v === 'number' ? (dec > 0 ? v.toFixed(dec) : String(Math.round(v))) : String(v);
}

function timeAgo(isoStr) {
  if (!isoStr) return null;
  try {
    const diff = (Date.now() - new Date(isoStr)) / 1000;
    if (diff < 60)  return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return null; }
}

/**
 * AQIInfoPanel – floating info card anchored top-right of the map.
 * Shows selected location AQI + key pollutants.
 * Uses real data only; shows N/A for missing values.
 *
 * Props:
 *   location   { city, country, lat, lon }
 *   airQuality { aqi, pollutants: [...], updatedAt }
 *   loading    boolean
 *   onClose    function
 */
export default function AQIInfoPanel({ location, airQuality, loading, onClose }) {
  const aqi   = airQuality?.aqi ?? null;
  const cat   = getAQICategory(aqi);
  const color = getAQIColor(aqi);

  const label = [location?.city, location?.country].filter(Boolean).join(', ')
    || (location?.lat ? `${Number(location.lat).toFixed(2)}, ${Number(location.lon).toFixed(2)}` : 'Unknown');

  const pollutants = airQuality?.pollutants ?? [];
  const pm25 = pollutants.find(p => p.id === 'pm25');
  const pm10 = pollutants.find(p => p.id === 'pm10');
  const no2  = pollutants.find(p => p.id === 'no2');
  const so2  = pollutants.find(p => p.id === 'so2');
  const co   = pollutants.find(p => p.id === 'co');
  const o3   = pollutants.find(p => p.id === 'o3');

  return (
    <div
      style={{
        position:     'absolute',
        top:          16,
        right:        16,
        zIndex:       1000,
        background:   'rgba(10, 12, 20, 0.92)',
        backdropFilter: 'blur(12px)',
        border:       `1px solid ${color}40`,
        borderRadius: 12,
        boxShadow:    `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px ${color}20`,
        width:        260,
        overflow:     'hidden',
        pointerEvents:'all',
        fontFamily:   'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        padding:      '10px 14px 8px',
        borderBottom: `1px solid ${color}30`,
        display:      'flex',
        alignItems:   'flex-start',
        justifyContent: 'space-between',
        gap:          8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Area / Region AQI
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, wordBreak: 'break-word' }}>
            {label}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}
            aria-label="Close"
          >×</button>
        )}
      </div>

      {/* AQI display */}
      {loading ? (
        <div style={{ padding: '16px 14px', color: '#64748b', fontSize: 12, textAlign: 'center' }}>
          Loading real-time AQI data…
        </div>
      ) : (
        <>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Big AQI number */}
            <div style={{
              width:        60, height: 60, borderRadius: '50%',
              background:   `radial-gradient(circle at 35% 35%, ${color}cc, ${color}88)`,
              border:       `2px solid ${color}80`,
              boxShadow:    `0 0 16px ${color}60`,
              display:      'flex', flexDirection: 'column',
              alignItems:   'center', justifyContent: 'center',
              flexShrink:   0,
            }}>
              <div style={{ fontSize: aqi !== null ? 22 : 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {aqi !== null ? Math.round(aqi) : 'N/A'}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AQI</div>
            </div>
            {/* Category info */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.2, marginBottom: 3 }}>
                {aqi !== null ? cat.label : 'No data'}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                {aqi !== null ? `EPA AQI Band: ${cat.range}` : 'No AQI available for this region'}
              </div>
            </div>
          </div>

          {/* Real-time Pollutants grid */}
          {aqi !== null && (
            <div style={{ padding: '0 14px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8, marginBottom: 6 }}>
                ⚡ Real-Time Pollutants
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'PM2.5', val: pm25?.value, unit: 'µg/m³' },
                  { label: 'PM10',  val: pm10?.value, unit: 'µg/m³' },
                  { label: 'NO₂',   val: no2?.value,  unit: 'µg/m³' },
                  { label: 'SO₂',   val: so2?.value,  unit: 'µg/m³' },
                  { label: 'CO',    val: co?.value,   unit: 'mg/m³' },
                  { label: 'O₃',    val: o3?.value,   unit: 'µg/m³' },
                ].map(({ label, val, unit }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '5px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: val !== null && val !== undefined ? '#e2e8f0' : '#475569' }}>
                      {fmtVal(val)}
                    </div>
                    <div style={{ fontSize: 8, color: '#475569' }}>{unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          {airQuality?.updatedAt && (
            <div style={{ padding: '6px 14px 10px', fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              Live · Updated {timeAgo(airQuality.updatedAt)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
