import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { getAQIColor, getAQITextColor, getAQICategory } from '../../utils/aqiUtils';

/** null/undefined → 'N/A', 0 → '0' */
function fmtVal(v, decimals = 0) {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'number') return decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
  return String(v);
}

/**
 * Creates an area/region pill icon showing region name and glowing AQI badge.
 */
const createRegionIcon = (region) => {
  const aqi       = region.aqi;
  const color     = getAQIColor(aqi);
  const textColor = getAQITextColor(aqi);
  const aqiLabel  = aqi !== null && aqi !== undefined ? Math.round(aqi) : 'N/A';
  const shortName = region.name.replace(' Metropolitan Area', ' Metro')
                               .replace(' Metropolitan Region', ' Metro')
                               .replace(' National Capital Region', ' NCR')
                               .replace(' Urban Area', ' Area')
                               .replace(' Island Area', '');

  return L.divIcon({
    className: '',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        background: rgba(10, 14, 26, 0.92);
        backdrop-filter: blur(8px);
        border: 1.5px solid ${color};
        border-radius: 20px;
        padding: 3px 6px 3px 10px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 12px ${color}50;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transform: translate(-50%, -50%);
        font-family: Inter, system-ui, sans-serif;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      ">
        <span style="
          font-size: 11px;
          font-weight: 600;
          color: #e2e8f0;
          margin-right: 8px;
          letter-spacing: -0.2px;
        ">${shortName}</span>
        <span style="
          background: ${color};
          color: ${textColor};
          font-size: 11px;
          font-weight: 800;
          border-radius: 12px;
          padding: 2px 7px;
          line-height: 1.2;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        ">${aqiLabel}</span>
      </div>
    `,
    iconSize:   [140, 30],
    iconAnchor: [70, 15],
    popupAnchor:[0, -18],
  });
};

const ROW = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: 12 };
const LBL = { color: '#64748b', fontWeight: 500 };
const VAL = (isNA) => ({ fontWeight: 700, color: isNA ? '#94a3b8' : '#0f172a' });

function PollutantRow({ label, value, unit }) {
  const isNA = value === 'N/A';
  return (
    <div style={ROW}>
      <span style={LBL}>{label}</span>
      <span style={VAL(isNA)}>{isNA ? 'N/A' : `${value} ${unit}`}</span>
    </div>
  );
}

export default function AQIRegionMarker({ region, onSelect }) {
  const color = getAQIColor(region.aqi);
  const cat   = getAQICategory(region.aqi);
  const icon  = createRegionIcon(region);

  return (
    <>
      {/* Geographic influence circle representing the region/area */}
      <Circle
        center={[region.lat, region.lng]}
        radius={35000} // 35km radius
        pathOptions={{
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 1,
          dashArray: '4, 4',
        }}
      />

      <Marker
        position={[region.lat, region.lng]}
        icon={icon}
        eventHandlers={{
          click: () => {
            if (onSelect) onSelect(region);
          },
        }}
      >
        <Popup minWidth={230} maxWidth={280}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '2px 0' }}>
            <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              🌐 Geographic Region
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>
              {region.name}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
              {[region.macroRegion, region.country].filter(Boolean).join(', ')}
            </div>

            {/* AQI big badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
              padding: '8px 12px', background: `${color}18`,
              borderRadius: 8, border: `1px solid ${color}35`,
            }}>
              <div style={{ textAlign: 'center', minWidth: 48 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
                  {fmtVal(region.aqi)}
                </div>
                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>AQI</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{cat.label}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Region Air Quality</div>
              </div>
            </div>

            {/* Real-time Pollutants */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                Real-Time Pollutants
              </div>
              <PollutantRow label="PM2.5" value={fmtVal(region.pm25)} unit="µg/m³" />
              <PollutantRow label="PM10"  value={fmtVal(region.pm10)} unit="µg/m³" />
              <PollutantRow label="NO₂"   value={fmtVal(region.no2)}  unit="µg/m³" />
              <PollutantRow label="SO₂"   value={fmtVal(region.so2)}  unit="µg/m³" />
              <PollutantRow label="CO"    value={fmtVal(region.co, 1)} unit="mg/m³" />
              <PollutantRow label="O₃"    value={fmtVal(region.o3)}   unit="µg/m³" />
            </div>

            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 8, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
              Source: OpenWeatherMap Air Pollution API (Real-Time)
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
