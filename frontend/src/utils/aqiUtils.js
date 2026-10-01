/**
 * aqiUtils.js – Single source of truth for AQI classification.
 *
 * Follows US EPA AQI standard (same as backend / demoData.js).
 * All map components, markers, and heatmap must import from here.
 */

export const AQI_CATEGORIES = [
  { range: '0–50',    label: 'Good',                           color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)',    cssClass: 'good',           min: 0,   max: 50  },
  { range: '51–100',  label: 'Moderate',                       color: '#eab308', bgColor: 'rgba(234,179,8,0.15)',    cssClass: 'moderate',       min: 51,  max: 100 },
  { range: '101–150', label: 'Unhealthy for Sensitive Groups', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)',   cssClass: 'usg',            min: 101, max: 150 },
  { range: '151–200', label: 'Unhealthy',                      color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)',    cssClass: 'unhealthy',      min: 151, max: 200 },
  { range: '201–300', label: 'Very Unhealthy',                 color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)',   cssClass: 'very-unhealthy', min: 201, max: 300 },
  { range: '301+',    label: 'Hazardous',                      color: '#9f1239', bgColor: 'rgba(159,18,57,0.15)',    cssClass: 'hazardous',      min: 301, max: Infinity },
];

/**
 * Returns the AQI category object for a given AQI value.
 * @param {number|null|undefined} aqi
 * @returns {{ label, color, bgColor, cssClass, range, min, max }}
 */
export function getAQICategory(aqi) {
  if (aqi === null || aqi === undefined || typeof aqi !== 'number') {
    return { label: 'Unknown', color: '#94a3b8', bgColor: 'rgba(148,163,184,0.15)', cssClass: 'unknown', range: '--', min: 0, max: 0 };
  }
  const v = Math.max(0, aqi);
  for (const cat of AQI_CATEGORIES) {
    if (v <= cat.max) return cat;
  }
  return AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
}

/**
 * Returns a CSS color string for a given AQI value.
 * @param {number|null|undefined} aqi
 * @returns {string}
 */
export function getAQIColor(aqi) {
  return getAQICategory(aqi).color;
}

/**
 * Normalizes AQI (0..500+) to a heatmap intensity value in [0, 1].
 * Uses a smooth linear interpolation within each AQI band.
 * @param {number} aqi
 * @returns {number} value in [0, 1]
 */
export function normalizeAQItoHeat(aqi) {
  if (!aqi || aqi <= 0) return 0;
  // Map AQI → [0,1] with soft cap at 500
  return Math.min(1, aqi / 300);
}

/**
 * Leaflet.heat gradient that matches the AQI color scale.
 * Keys are positions in [0,1] matching normalizeAQItoHeat output.
 */
export const HEATMAP_GRADIENT = {
  0.0:  '#22c55e', // Good
  0.17: '#eab308', // Moderate (51/300)
  0.34: '#f97316', // USG (101/300)
  0.5:  '#ef4444', // Unhealthy (150/300)
  0.67: '#a855f7', // Very Unhealthy (201/300)
  1.0:  '#9f1239', // Hazardous
};

/**
 * Returns text color (white or dark) for readability on an AQI-colored background.
 * @param {number|null|undefined} aqi
 * @returns {string}
 */
export function getAQITextColor(aqi) {
  const cat = getAQICategory(aqi);
  // Very light colors need dark text
  if (cat.cssClass === 'good' || cat.cssClass === 'moderate') return '#1a1a1a';
  return '#ffffff';
}

/**
 * Validates a geographic record has usable lat/lon/aqi.
 * @param {object} rec
 * @returns {boolean}
 */
export function isValidGeoRecord(rec) {
  if (!rec) return false;
  const lat = Number(rec.lat ?? rec.latitude);
  const lon = Number(rec.lon ?? rec.lng ?? rec.longitude);
  const aqi = Number(rec.aqi);
  if (isNaN(lat) || isNaN(lon) || isNaN(aqi)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  if (aqi < 0) return false;
  // Exclude test/dummy station records
  const name = String(rec.name ?? rec.station ?? '').toLowerCase();
  if (name.includes('test station') || name === 'test') return false;
  return true;
}

/**
 * Normalizes any AQI station/city record into a canonical AQI point.
 * @param {object} raw
 * @returns {{ id, lat, lon, aqi, city, country, station, timestamp, pm25, pm10, no2, so2, co, o3 }}
 */
export function normalizeAQIPoint(raw) {
  const aqi = raw.aqi !== null && raw.aqi !== undefined ? Math.round(Number(raw.aqi)) : null;
  return {
    id:        raw.id ?? `${raw.lat ?? raw.latitude}-${raw.lon ?? raw.lng ?? raw.longitude}`,
    lat:       Number(raw.lat ?? raw.latitude),
    lon:       Number(raw.lon ?? raw.lng ?? raw.longitude),
    aqi,
    city:      raw.city ?? raw.name ?? '',
    country:   raw.country ?? '',
    station:   raw.name ?? raw.station ?? '',
    timestamp: raw.updatedAt ?? raw.updated_at ?? raw.timestamp ?? null,
    pm25:      raw.pm25 !== null && raw.pm25 !== undefined ? Number(raw.pm25) : null,
    pm10:      raw.pm10 !== null && raw.pm10 !== undefined ? Number(raw.pm10) : null,
    no2:       raw.no2  !== null && raw.no2  !== undefined ? Number(raw.no2)  : null,
    so2:       raw.so2  !== null && raw.so2  !== undefined ? Number(raw.so2)  : null,
    co:        raw.co   !== null && raw.co   !== undefined ? Number(raw.co)   : null,
    o3:        raw.o3   !== null && raw.o3   !== undefined ? Number(raw.o3)   : null,
    category:  getAQICategory(aqi),
  };
}
