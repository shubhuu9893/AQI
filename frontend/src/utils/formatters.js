/**
 * AirHealth India -- Formatters & Utilities
 */

export function formatDate(isoString, opts = {}) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  });
}

export function formatTime(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(isoString) {
  if (!isoString) return '--';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hr ago`;
  return `${Math.floor(diffH / 24)} days ago`;
}

export function formatAQI(value) {
  if (value == null) return '--';
  return Math.round(value).toString();
}

export function formatPollutant(value, unit = '') {
  if (value == null) return '--';
  const formatted = typeof value === 'number'
    ? value < 10 ? value.toFixed(1) : Math.round(value).toString()
    : value;
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatTemp(value, unit = 'celsius') {
  if (value == null) return '--';
  if (unit === 'fahrenheit') return `${Math.round(value * 9 / 5 + 32)}?F`;
  return `${Math.round(value)}?C`;
}

export function formatDistance(value, unit = 'km') {
  if (value == null) return '--';
  if (unit === 'miles') return `${(value * 0.621371).toFixed(1)} mi`;
  return `${value.toFixed(1)} km`;
}

export function formatTrend(value) {
  if (value == null || value === 0) return null;
  return { dir: value > 0 ? 'up' : 'down', pct: Math.abs(value) };
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function percentage(value, max) {
  return clamp(Math.round((value / max) * 100), 0, 100);
}

export function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str, len = 40) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '...';
}
