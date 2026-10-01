/**
 * AirHealth – Global AQI Service Layer
 * All API calls go through this file.
 * Base URL is read from VITE_API_URL in .env.local
 *
 * This service is geography-agnostic: it accepts any lat/lon and works globally.
 */

import axios from 'axios';
import { getAQICategory } from '../utils/aqiUtils';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const http = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
  res => res,
  err => {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      'Network error';
    return Promise.reject(new Error(msg));
  }
);

// No hardcoded city defaults – callers must supply real coordinates.

// -------------------------------------------------------------
// Health check
// -------------------------------------------------------------
export async function checkHealth() {
  const { data } = await http.get('/health');
  return data;
}

// -------------------------------------------------------------
// Dashboard  GET /api/dashboard?latitude=&longitude=
// -------------------------------------------------------------
export async function getDashboard(lat, lon) {
  const { data } = await http.get('/dashboard', { params: { latitude: lat, longitude: lon } });

  const aq  = data.air_quality  ?? {};
  const wx  = data.weather      ?? {};
  const hr  = data.health_risk;
  const loc = data.location     ?? {};

  return {
    aqi:       aq.aqi ?? null,
    category:  getAQICategory(aq.aqi ?? 0),
    location:  { city: loc.city ?? '--', state: loc.state ?? '--', country: loc.country ?? '' },
    updatedAt: new Date().toISOString(),
    airQuality:        normAirQuality(aq),
    weather:           normWeather(wx),
    healthRisk:        hr ? normHealthRisk(hr) : null,
    nearbyStations:    (data.nearby_stations ?? []).map(normStation),
    historicalSummary: data.historical_summary ?? null,
  };
}

// -------------------------------------------------------------
// Air Quality  GET /api/air_quality?lat=&lon=
// -------------------------------------------------------------
export async function getAirQuality(lat, lon) {
  const { data } = await http.get('/air_quality', { params: { lat, lon } });
  return normAirQuality(data);
}

// -------------------------------------------------------------
// Global Regions / Areas AQI  GET /api/air_quality/regions
// -------------------------------------------------------------
export async function getRegionsAQI(macroRegion = null) {
  const params = macroRegion && macroRegion !== 'All' ? { region: macroRegion } : {};
  const { data } = await http.get('/air_quality/regions', { params });
  return (data ?? []).map(r => ({
    id:          r.id,
    name:        r.name,
    macroRegion: r.macro_region,
    country:     r.country,
    lat:         r.latitude,
    lng:         r.longitude,
    aqi:         r.aqi != null ? Math.round(r.aqi) : null,
    pm25:        r.pm25 != null ? Math.round(r.pm25) : null,
    pm10:        r.pm10 != null ? Math.round(r.pm10) : null,
    no2:         r.no2  != null ? Math.round(r.no2) : null,
    so2:         r.so2  != null ? Math.round(r.so2) : null,
    co:          r.co   != null ? Math.round(r.co * 10) / 10 : null,
    o3:          r.o3   != null ? Math.round(r.o3) : null,
    category:    getAQICategory(r.aqi),
    isRegion:    true,
  }));
}

// -------------------------------------------------------------
// AQI Trend  GET /api/charts/24h-aqi | 7d-aqi | 30d-aqi
// -------------------------------------------------------------
export async function getAQITrend(period = '7d', stationId = null) {
  const params = stationId ? { station_id: stationId } : {};

  if (period === '24h') {
    const { data } = await http.get('/charts/24h-aqi', { params });
    return data.map(row => ({
      time: new Date(row.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      aqi:  Math.round(row.avg_aqi ?? 0),
    }));
  }

  if (period === '7d') {
    const { data } = await http.get('/charts/7d-aqi', { params });
    return data.map(row => ({
      time: row.date ? row.date.slice(5) : '',
      aqi:  Math.round(row.avg_aqi ?? 0),
    }));
  }

  // 30d
  const { data } = await http.get('/charts/30d-aqi', { params });
  return data.map(row => ({
    time: row.date ? row.date.slice(5) : '',
    aqi:  Math.round(row.avg_aqi ?? 0),
  }));
}

// -------------------------------------------------------------
// Weather  GET /api/weather?lat=&lon=
// -------------------------------------------------------------
export async function getWeather(lat, lon) {
  const { data } = await http.get('/weather', { params: { lat, lon } });
  return normWeather(data);
}

// -------------------------------------------------------------
// Health Risk  POST /api/health-risk/{stationId}
// -------------------------------------------------------------
export async function getHealthRisk(stationId, metrics = {}) {
  const { data } = await http.post('/health-risk/' + stationId, metrics);
  return normHealthRisk(data);
}

// -------------------------------------------------------------
// Health Impacts -- static guidance cards (no backend endpoint)
// -------------------------------------------------------------
export async function getHealthImpacts() {
  const { DEMO_HEALTH_IMPACTS } = await import('../data/demoData');
  return DEMO_HEALTH_IMPACTS;
}

// -------------------------------------------------------------
// Stations  GET /api/stations/nearby?latitude=&longitude=&radiusKm=
// lat/lon must be supplied by the caller. No hardcoded default location.
// -------------------------------------------------------------
export async function getStations({ lat, lon, radiusKm = 50 } = {}) {
  if (lat == null || lon == null) return [];
  const { data } = await http.get('/stations/nearby', {
    params: { latitude: lat, longitude: lon, radiusKm },
  });
  return (data ?? []).map(normStation);
}

// -------------------------------------------------------------
// Station by ID -- direct endpoint lookup + attaches trend data
// -------------------------------------------------------------
export async function getStationById(id) {
  let station;
  try {
    const { data } = await http.get(`/stations/${id}`);
    station = normStation(data);
  } catch {
    throw new Error("Station '" + id + "' not found");
  }

  const [trend24h, trend7d] = await Promise.all([
    getAQITrend('24h', id).catch(() => []),
    getAQITrend('7d',  id).catch(() => []),
  ]);

  return { ...station, trend24h, trend7d };
}

// -------------------------------------------------------------
// History  GET /api/search
// -------------------------------------------------------------
export async function getHistory(filters = {}) {
  const params = {};
  if (filters.location && filters.location !== 'all') params.city    = filters.location;
  if (filters.dateFrom)  params.dateFrom = filters.dateFrom;
  if (filters.dateTo)    params.dateTo   = filters.dateTo;
  if (filters.sortBy)    params.sortBy   = filters.sortBy;

  const { data } = await http.get('/search', { params });

  return (data ?? []).map((row, i) => {
    const aqi = Math.round(row.aqi ?? 0);
    const cat = getAQICategory(aqi);
    return {
      id:            row.id ?? i,
      date:          row.timestamp ? row.timestamp.split('T')[0] : '--',
      location:      filters.location && filters.location !== 'all' ? filters.location : (row.station_id ?? '--'),
      aqi,
      category:      cat.label,
      categoryClass: cat.cssClass,
      pm25:          Math.round(row.pm25 ?? 0),
      pm10:          Math.round(row.pm10 ?? 0),
      no2:           Math.round(row.no2  ?? 0),
      so2:           Math.round(row.so2  ?? 0),
    };
  });
}

// -------------------------------------------------------------
// Cities -- global list + Nominatim geocoding fallback
// -------------------------------------------------------------
export async function getCities(query) {
  const { DEMO_CITIES } = await import('../data/demoData');
  if (!query) return DEMO_CITIES;
  const q = query.toLowerCase().trim();

  // First: filter from the curated global city list
  const local = DEMO_CITIES.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      (c.state  || '').toLowerCase().includes(q) ||
      (c.country || '').toLowerCase().includes(q)
  );

  // If we have good local results, return them (up to 12)
  if (local.length >= 3) return local.slice(0, 12);

  // Fallback: Nominatim geocoding for cities not in our list
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}` +
      `&limit=8&featuretype=city&addressdetails=1`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!resp.ok) return local;
    const results = await resp.json();
    const geocoded = results
      .filter(r => r.lat && r.lon)
      .map(r => ({
        id:      `geo-${r.place_id}`,
        name:    r.address?.city ?? r.address?.town ?? r.address?.village ?? r.name,
        state:   r.address?.state ?? r.address?.county ?? '',
        country: r.address?.country ?? '',
        lat:     parseFloat(r.lat),
        lng:     parseFloat(r.lon),
      }))
      .filter(r => r.name);
    return [...local, ...geocoded].slice(0, 12);
  } catch {
    return local;
  }
}

// -------------------------------------------------------------
// Comparison  GET /api/compare/cities?city1=&city2=
// -------------------------------------------------------------
export async function getComparison(cityIds) {
  if (!cityIds || cityIds.length < 2) return [];

  const { DEMO_CITIES } = await import('../data/demoData');
  const getName = id => (DEMO_CITIES.find(c => c.id === id) || {}).name || id;

  const results = new Map();

  for (let i = 0; i < cityIds.length - 1; i++) {
    for (let j = i + 1; j < cityIds.length; j++) {
      const id1 = cityIds[i];
      const id2 = cityIds[j];
      try {
        const { data } = await http.get('/compare/cities', {
          params: { city1: getName(id1), city2: getName(id2) },
        });
        for (const key of ['city1', 'city2']) {
          const entry = data[key];
          const id    = key === 'city1' ? id1 : id2;
          if (!results.has(id)) {
            const demo = DEMO_CITIES.find(c => c.id === id) || {};
            results.set(id, normComparisonCity(id, entry.name, entry.metrics, demo));
          }
        }
      } catch {
        for (const id of [id1, id2]) {
          if (!results.has(id)) {
            const demo = DEMO_CITIES.find(c => c.id === id);
            if (demo) results.set(id, normComparisonCityDemo(demo));
          }
        }
      }
    }
  }

  return cityIds.map(id => results.get(id)).filter(Boolean);
}

// -------------------------------------------------------------
// Notifications  GET /api/notifications/list
// -------------------------------------------------------------
export async function getNotifications() {
  try {
    const { data } = await http.get('/notifications/list');
    return (data ?? []).map((n, i) => ({
      id:      n.id ?? i,
      type:    'info',
      title:   'AQI Alert -- ' + n.city,
      message: 'Alert when AQI exceeds ' + n.threshold_aqi,
      time:    new Date().toISOString(),
      read:    false,
    }));
  } catch {
    return [];
  }
}

export async function markNotificationRead() {
  return { success: true };
}

// -------------------------------------------------------------
// AI / Gemini  POST /api/gemini/ask?question=&city=
// -------------------------------------------------------------
export async function sendAIMessage(message, city = '') {
  const { data } = await http.post('/gemini/ask', null, {
    params: { question: message, city },
  });
  let rawContent = data.answer || 'No response from AI.';

  // Strip markdown hashes (### Header -> Header) and asterisks (***bold*** -> bold)
  let cleanContent = rawContent
    .replace(/^#{1,6}\s+/gm, '')       // Remove leading markdown header hashes
    .replace(/\*{2,3}([^*]+)\*{2,3}/g, '$1') // Remove ***bold italic*** and **bold**
    .replace(/\*([^*]+)\*/g, '$1')     // Remove *italic*
    .replace(/^\s*\*\s+/gm, '- ');     // Convert asterisk bullet points to clean dashes

  return {
    id:        Date.now(),
    role:      'assistant',
    content:   cleanContent,
    timestamp: new Date().toISOString(),
  };
}

export function getAISuggestions() {
  return [
    'What does my current AQI mean?',
    'Which pollutants are currently elevated?',
    'How can I reduce outdoor exposure?',
    'Explain today\'s air quality.',
    'Is it safe for children to play outside?',
    'What time of day is air quality typically best?',
    'How does weather affect air quality?',
    'What are the health effects of PM2.5?',
  ];
}

// -------------------------------------------------------------
// Export  GET /api/export/report?city=&fmt=csv|pdf
// -------------------------------------------------------------
export async function exportCSV(rows, city) {
  city = city || 'unknown';
  try {
    const response = await http.get('/export/report', {
      params: { city, fmt: 'csv' },
      responseType: 'blob',
    });
    triggerDownload(response.data, 'airhealth-' + city + '-export.csv', 'text/csv');
  } catch {
    clientCSV(rows, city);
  }
  return { success: true };
}

export async function exportPDF(rows, city) {
  city = city || 'unknown';
  try {
    const response = await http.get('/export/report', {
      params: { city, fmt: 'pdf' },
      responseType: 'blob',
    });
    triggerDownload(response.data, 'airhealth-' + city + '-report.pdf', 'application/pdf');
  } catch {
    clientTxt(rows, city);
  }
  return { success: true };
}

// Re-export utility used by components
export { getAQICategory };

// -------------------------------------------------------------
// Normalisation helpers
// -------------------------------------------------------------
function normAirQuality(raw) {
  const aqi = raw?.aqi ?? null;
  return {
    location:  'Current location',
    updatedAt: new Date().toISOString(),
    aqi,
    category: getAQICategory(aqi ?? 0),
    pollutants: [
      { id: 'pm25', name: 'PM2.5', value: round(raw?.pm25), unit: 'ug/m3', standard: 60,  trend: 0, sparkline: [] },
      { id: 'pm10', name: 'PM10',  value: round(raw?.pm10), unit: 'ug/m3', standard: 100, trend: 0, sparkline: [] },
      { id: 'no2',  name: 'NO2',   value: round(raw?.no2),  unit: 'ug/m3', standard: 80,  trend: 0, sparkline: [] },
      { id: 'so2',  name: 'SO2',   value: round(raw?.so2),  unit: 'ug/m3', standard: 80,  trend: 0, sparkline: [] },
      { id: 'co',   name: 'CO',    value: roundF(raw?.co),  unit: 'mg/m3', standard: 4,   trend: 0, sparkline: [] },
      { id: 'o3',   name: 'O3',    value: round(raw?.o3),   unit: 'ug/m3', standard: 100, trend: 0, sparkline: [] },
    ],
  };
}

function normWeather(raw) {
  return {
    location:     'Current location',
    updatedAt:    new Date().toISOString(),
    temperature:  raw?.temperature   ?? null,
    feelsLike:    raw?.temperature   ?? null,
    humidity:     raw?.humidity      ?? null,
    pressure:     raw?.pressure      ?? null,
    windSpeed:    raw?.wind_speed    ?? null,
    windDirection:compassFromDeg(raw?.wind_direction),
    windDegree:   raw?.wind_direction ?? null,
    visibility:   raw?.visibility    ?? null,
    uvIndex:      null,
    dewPoint:     null,
    condition:    'Current conditions',
    conditionCode:'clear',
    forecast:     [],
  };
}

function normHealthRisk(raw) {
  if (!raw) return null;
  const score = raw.risk_score ?? 0;
  const level = normRiskLevel(raw.risk_level);
  return {
    level,
    cssClass:         riskCssClass(level),
    score:            Math.round(score),
    maxScore:         100,
    sensitiveGroups:  parseSensitiveGroups(raw.recommendation),
    recommendation:   cleanRecommendation(raw.recommendation),
    generalPopulation:'Follow standard precautions based on current AQI.',
    outdoorWorkers:   'Consider a mask during extended outdoor work.',
    pollutantRisks:   [],
  };
}

function normStation(raw) {
  const aqi = Math.round(raw.aqi ?? raw.latest_aqi ?? 0);
  return {
    id:         raw.id,
    name:       raw.name,
    code:       (raw.id || '').toString().toUpperCase().slice(0, 8) || '--',
    city:       raw.city  || raw.name,
    state:      raw.state || '',
    lat:        raw.latitude  ?? raw.lat,
    lng:        raw.longitude ?? raw.lng,
    distance:   raw.distance_km ?? raw.distance ?? 0,
    aqi,
    category:   getAQICategory(aqi),
    status:     'active',
    pm25:       Math.round(raw.pm25 ?? 0),
    pm10:       Math.round(raw.pm10 ?? 0),
    no2:        Math.round(raw.no2  ?? 0),
    so2:        Math.round(raw.so2  ?? 0),
    co:         raw.co ?? 0,
    o3:         Math.round(raw.o3   ?? 0),
    updatedAt:  raw.updated_at ?? new Date().toISOString(),
    dataSource: raw.data_source ?? 'CPCB',
  };
}

function normComparisonCity(id, name, metrics, demo) {
  const aqi  = Math.round(metrics?.aqi  ?? demo?.aqi  ?? 0);
  const pm25 = Math.round(metrics?.pm25 ?? demo?.pm25 ?? 0);
  return {
    id,
    name,
    state:    demo?.state || '',
    lat:      demo?.lat   || 0,
    lng:      demo?.lng   || 0,
    aqi,
    pm25,
    pm10:     Math.round(metrics?.pm10 ?? pm25 * 1.9),
    no2:      Math.round(metrics?.no2  ?? pm25 * 0.7),
    so2:      5,
    o3:       35,
    temp:     Math.round(metrics?.temperature ?? demo?.temp ?? 28),
    humidity: Math.round(metrics?.humidity    ?? demo?.humidity ?? 60),
    category: getAQICategory(aqi),
    history7d:[],
  };
}

function normComparisonCityDemo(demo) {
  const aqi  = demo.aqi  ?? 0;
  const pm25 = demo.pm25 ?? 0;
  return {
    ...demo,
    pm10:     Math.round(pm25 * 1.9),
    no2:      Math.round(pm25 * 0.7),
    so2:      5,
    o3:       35,
    temp:     demo.temp ?? 28,
    category: getAQICategory(aqi),
    history7d:[],
  };
}

// Small utility helpers – preserve nulls for missing values
function round(v)  { return v != null ? Math.round(v)            : null; }
function roundF(v) { return v != null ? Math.round(v * 10) / 10  : null; }

function compassFromDeg(deg) {
  if (deg == null) return '--';
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function normRiskLevel(raw) {
  if (!raw) return 'Low';
  const r = raw.toLowerCase();
  if (r.includes('very high')) return 'Very High';
  if (r.includes('high'))      return 'High';
  if (r.includes('moderate'))  return 'Moderate';
  return 'Low';
}

function riskCssClass(level) {
  const map = { Low: 'good', Moderate: 'moderate', High: 'usg', 'Very High': 'unhealthy' };
  return map[level] || 'moderate';
}

function parseSensitiveGroups(recommendation) {
  const groups = [];
  const text   = (recommendation || '').toLowerCase();
  if (text.includes('child'))                     groups.push('Children');
  if (text.includes('older') || text.includes('elder')) groups.push('Older Adults');
  if (text.includes('respiratory'))               groups.push('Respiratory Conditions');
  if (text.includes('heart'))                     groups.push('Heart Conditions');
  if (!groups.length)                             groups.push('Sensitive Groups');
  return groups;
}

function cleanRecommendation(raw) {
  if (!raw) return 'Monitor air quality and take precautions as needed.';
  return raw.replace(/\s+/g, ' ').trim();
}

function triggerDownload(blob, filename, mimeType) {
  const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function clientCSV(rows, city) {
  const headers = ['Date','Location','AQI','PM2.5','PM10','NO2','Status'];
  const lines   = [headers.join(','), ...rows.map(r =>
    [r.date, r.location, r.aqi, r.pm25, r.pm10, r.no2, r.category].join(',')
  )];
  triggerDownload(new Blob([lines.join('\n')], { type: 'text/csv' }), 'airhealth-' + city + '.csv', 'text/csv');
}

function clientTxt(rows, city) {
  const lines = [
    'AirHealth India -- ' + city + ' Export',
    'Generated: ' + new Date().toLocaleString('en-IN'),
    '',
    ...rows.slice(0, 50).map(r => r.date + ' | ' + r.location + ' | AQI ' + r.aqi + ' | ' + r.category),
  ];
  triggerDownload(new Blob([lines.join('\n')], { type: 'text/plain' }), 'airhealth-' + city + '.txt', 'text/plain');
}
