import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAQIColor, getAQITextColor, getAQICategory } from '../../utils/aqiUtils';

/** null/undefined → 'N/A', 0 → '0'  (0 is a valid measurement) */
function fmtVal(v, decimals = 0) {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'number') return decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
  return String(v);
}

function fmtTime(isoStr) {
  if (!isoStr) return 'N/A';
  try {
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
}

/**
 * Creates a glowing circle icon with the AQI number inside.
 * Matches the visual reference: dark map, colored circles with white numbers.
 */
const createCircleIcon = (aqi) => {
  const color     = getAQIColor(aqi);
  const textColor = getAQITextColor(aqi);
  const label     = aqi !== null && aqi !== undefined ? Math.round(aqi) : '?';

  // Size varies slightly by AQI severity
  const size = aqi >= 200 ? 40 : aqi >= 100 ? 36 : 32;
  const half = size / 2;
  const fontSize = aqi >= 200 ? 13 : 12;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <!-- Glow ring -->
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.25;
          filter: blur(4px);
        "></div>
        <!-- Main circle -->
        <div style="
          position: absolute;
          inset: 0;
          background: ${color};
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${fontSize}px;
          font-weight: 800;
          color: ${textColor};
          box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px ${color}80;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          cursor: pointer;
          font-family: Inter, system-ui, sans-serif;
          letter-spacing: -0.5px;
        ">${label}</div>
      </div>
    `,
    iconSize:   [size, size],
    iconAnchor: [half, half],
    popupAnchor:[0, -(half + 4)],
  });
};

const ROW  = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: 12 };
const LBL  = { color: '#64748b', fontWeight: 500 };
const VAL  = (isNA) => ({ fontWeight: 700, color: isNA ? '#94a3b8' : '#0f172a' });

function PollutantRow({ label, value, unit }) {
  const isNA = value === 'N/A';
  return (
    <div style={ROW}>
      <span style={LBL}>{label}</span>
      <span style={VAL(isNA)}>{isNA ? 'N/A' : `${value} ${unit}`}</span>
    </div>
  );
}

export default function AQIStationMarker({ station, visible = true }) {
  if (!visible) return null;

  const aqi  = station.aqi;
  const cat  = station.category ?? getAQICategory(aqi);
  const color = cat.color ?? getAQIColor(aqi);
  const icon  = createCircleIcon(aqi);

  const cityLine = [station.city, station.state, station.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Marker position={[station.lat, station.lng]} icon={icon}>
      <Popup minWidth={220} maxWidth={280}>
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '2px 0' }}>
          {/* Station header */}
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2, lineHeight: 1.3 }}>
            {station.name || station.city || 'Monitoring Station'}
          </div>
          {cityLine && (
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
              {cityLine}
            </div>
          )}

          {/* AQI big display */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
            padding: '8px 12px', background: `${color}18`,
            borderRadius: 8, border: `1px solid ${color}35`,
          }}>
            <div style={{ textAlign: 'center', minWidth: 48 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>
                {fmtVal(aqi)}
              </div>
              <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>AQI</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color }}>{cat.label ?? '—'}</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Air Quality Index</div>
            </div>
          </div>

          {/* Pollutants */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
            <PollutantRow label="PM2.5" value={fmtVal(station.pm25)} unit="µg/m³" />
            <PollutantRow label="PM10"  value={fmtVal(station.pm10)} unit="µg/m³" />
            <PollutantRow label="NO₂"   value={fmtVal(station.no2)}  unit="µg/m³" />
            <PollutantRow label="SO₂"   value={fmtVal(station.so2)}  unit="µg/m³" />
            <PollutantRow label="CO"    value={fmtVal(station.co, 1)} unit="mg/m³" />
            <PollutantRow label="O₃"    value={fmtVal(station.o3)}   unit="µg/m³" />
          </div>

          {/* Footer: source + timestamp */}
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, paddingTop: 6, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            {station.dataSource && <span>Source: {station.dataSource}</span>}
            {station.updatedAt  && <span>Updated: {fmtTime(station.updatedAt)}</span>}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}