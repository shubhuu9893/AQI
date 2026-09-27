/**
 * AirHealth India -- Static Reference Data
 * ============================================================
 * This file now contains ONLY:
 *   1. getAQICategory() -- pure helper, used throughout the app
 *   2. AQI_CATEGORIES   -- reference table for the Health page
 *   3. DEMO_CITIES      -- city list used by city picker / Search
 *                         (no /cities endpoint on the backend)
 *   4. DEMO_HEALTH_IMPACTS -- static health-guidance cards
 *                            (no backend endpoint for these)
 *
 * All live measurement data (AQI, weather, stations, history,
 * comparison, AI) now comes from the real FastAPI backend via
 * src/services/api.js.
 * ============================================================
 */

// -- AQI Category helper -------------------------------------
export function getAQICategory(aqi) {
  if (aqi <= 50)  return { label: 'Good',                           color: '#22c55e', cssClass: 'good',           band: 1 };
  if (aqi <= 100) return { label: 'Moderate',                       color: '#eab308', cssClass: 'moderate',       band: 2 };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316', cssClass: 'usg',            band: 3 };
  if (aqi <= 200) return { label: 'Unhealthy',                      color: '#ef4444', cssClass: 'unhealthy',      band: 4 };
  if (aqi <= 300) return { label: 'Very Unhealthy',                 color: '#a855f7', cssClass: 'very-unhealthy', band: 5 };
  return           { label: 'Hazardous',                            color: '#9f1239', cssClass: 'hazardous',      band: 6 };
}

// -- AQI Categories reference table --------------------------
export const AQI_CATEGORIES = [
  { range: '0-50',    label: 'Good',                           color: '#22c55e', cssClass: 'good',           description: 'Air quality is satisfactory and poses little or no risk.' },
  { range: '51-100',  label: 'Moderate',                       color: '#eab308', cssClass: 'moderate',       description: 'Acceptable air quality; some pollutants may affect sensitive individuals.' },
  { range: '101-150', label: 'Unhealthy for Sensitive Groups', color: '#f97316', cssClass: 'usg',            description: 'General public is unlikely to be affected, but sensitive groups may experience health effects.' },
  { range: '151-200', label: 'Unhealthy',                      color: '#ef4444', cssClass: 'unhealthy',      description: 'Everyone may begin to experience health effects; sensitive groups may face serious effects.' },
  { range: '201-300', label: 'Very Unhealthy',                 color: '#a855f7', cssClass: 'very-unhealthy', description: 'Health alert: everyone may experience serious health effects.' },
  { range: '301+',    label: 'Hazardous',                      color: '#9f1239', cssClass: 'hazardous',      description: 'Emergency conditions. Everyone is more likely to be affected. Avoid outdoor activities.' },
];

// -- City list (no backend /cities endpoint) ------------------
export const DEMO_CITIES = [
  { id: 'delhi',        name: 'Delhi',          state: 'Delhi',             lat: 28.6139, lng: 77.2090, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'mumbai',       name: 'Mumbai',         state: 'Maharashtra',       lat: 19.0760, lng: 72.8777, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'pune',         name: 'Pune',           state: 'Maharashtra',       lat: 18.5204, lng: 73.8567, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'bangalore',    name: 'Bangalore',      state: 'Karnataka',         lat: 12.9716, lng: 77.5946, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'chennai',      name: 'Chennai',        state: 'Tamil Nadu',        lat: 13.0827, lng: 80.2707, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'kolkata',      name: 'Kolkata',        state: 'West Bengal',       lat: 22.5726, lng: 88.3639, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'hyderabad',    name: 'Hyderabad',      state: 'Telangana',         lat: 17.3850, lng: 78.4867, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'ahmedabad',    name: 'Ahmedabad',      state: 'Gujarat',           lat: 23.0225, lng: 72.5714, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'jaipur',       name: 'Jaipur',         state: 'Rajasthan',         lat: 26.9124, lng: 75.7873, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'lucknow',      name: 'Lucknow',        state: 'Uttar Pradesh',     lat: 26.8467, lng: 80.9462, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'kanpur',       name: 'Kanpur',         state: 'Uttar Pradesh',     lat: 26.4499, lng: 80.3319, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'patna',        name: 'Patna',          state: 'Bihar',             lat: 25.5941, lng: 85.1376, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'surat',        name: 'Surat',          state: 'Gujarat',           lat: 21.1702, lng: 72.8311, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'nagpur',       name: 'Nagpur',         state: 'Maharashtra',       lat: 21.1458, lng: 79.0882, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'indore',       name: 'Indore',         state: 'Madhya Pradesh',    lat: 22.7196, lng: 75.8577, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'bhopal',       name: 'Bhopal',         state: 'Madhya Pradesh',    lat: 23.2599, lng: 77.4126, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'visakhapatnam',name: 'Visakhapatnam',  state: 'Andhra Pradesh',    lat: 17.6868, lng: 83.2185, aqi: null, pm25: null, temp: null, humidity: null },
  { id: 'kochi',        name: 'Kochi',          state: 'Kerala',            lat: 9.9312,  lng: 76.2673, aqi: null, pm25: null, temp: null, humidity: null },
];

// -- Health impact cards (static guidance, not a measurement) -
export const DEMO_HEALTH_IMPACTS = [
  {
    group: 'General Population',
    icon: 'users',
    risk: 'low',
    riskLabel: 'Low Risk',
    guidance: 'Normal outdoor activities are generally safe. Stay hydrated in warm weather.',
    caution: false,
  },
  {
    group: 'Children',
    icon: 'baby',
    risk: 'moderate',
    riskLabel: 'Moderate Risk',
    guidance: 'Limit strenuous outdoor play during afternoon hours when ozone peaks. Watch for coughing or eye irritation.',
    caution: true,
  },
  {
    group: 'Older Adults',
    icon: 'user-check',
    risk: 'moderate',
    riskLabel: 'Moderate Risk',
    guidance: 'Reduce prolonged outdoor exertion. Keep medications accessible. Stay indoors during high pollution periods.',
    caution: true,
  },
  {
    group: 'Respiratory Conditions',
    icon: 'wind',
    risk: 'high',
    riskLabel: 'Elevated Risk',
    guidance: 'Consider staying indoors with windows closed. Keep inhalers/bronchodilators available. Avoid busy roads.',
    caution: true,
  },
  {
    group: 'Heart Conditions',
    icon: 'heart',
    risk: 'high',
    riskLabel: 'Elevated Risk',
    guidance: 'Avoid heavy outdoor exertion. Monitor for symptoms such as chest tightness or shortness of breath.',
    caution: true,
  },
  {
    group: 'Outdoor Workers',
    icon: 'hard-hat',
    risk: 'moderate',
    riskLabel: 'Moderate Risk',
    guidance: 'Consider wearing an N95 mask during extended outdoor work. Take breaks in clean-air areas when possible.',
    caution: true,
  },
];

// -- Default map center ---------------------------------------
export const DEFAULT_MAP_CENTER = { lat: 18.5204, lng: 73.8567, zoom: 12 };

// -- Settings defaults (local state only, no backend endpoint) -
export const DEFAULT_SETTINGS = {
  profile: {
    name:   'Shubham Patil',
    email:  'shubham@student.edu',
    avatar: null,
  },
  appearance: {
    theme:             'light',
    compactMode:       false,
    animationsEnabled: true,
  },
  location: {
    defaultCity: 'pune',
    autoDetect:  true,
  },
  notifications: {
    aqiAlerts:      true,
    aqiThreshold:   150,
    stationUpdates: false,
    dailySummary:   true,
    weatherAlerts:  false,
  },
  dataPreferences: {
    autoRefresh:      true,
    refreshInterval:  5,
    temperatureUnit:  'celsius',
    distanceUnit:     'km',
    pollutantUnit:    'ug/m3',
  },
};
