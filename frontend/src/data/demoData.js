/**
 * AirHealth – Static Reference Data
 * ============================================================
 * Contains ONLY:
 *   1. getAQICategory()  – re-exported from aqiUtils for backward compat
 *   2. AQI_CATEGORIES    – reference table for the Health page
 *   3. DEMO_CITIES       – GLOBAL city list for city picker / Search
 *   4. DEMO_HEALTH_IMPACTS – static health-guidance cards
 *
 * All live measurement data comes from the FastAPI backend via
 * src/services/api.js.
 * ============================================================
 */

// Re-export from the canonical utility so existing imports keep working
export { getAQICategory, AQI_CATEGORIES } from '../utils/aqiUtils';

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

// -- Default map center (World center – NOT Pune) ----------------
export const DEFAULT_MAP_CENTER = { lat: 20, lng: 0, zoom: 3 };

// -- Global city list for the city picker / Search ---------------
// This is a curated list used for quick search. It does NOT represent
// all cities in the world – it is a representative global sample.
// AQI values here are null; real data comes from the API.
export const DEMO_CITIES = [
  // -- India --
  { id: 'delhi',            name: 'Delhi',            state: 'Delhi',             country: 'India',       lat: 28.6139, lng: 77.2090 },
  { id: 'mumbai',           name: 'Mumbai',           state: 'Maharashtra',       country: 'India',       lat: 19.0760, lng: 72.8777 },
  { id: 'pune',             name: 'Pune',             state: 'Maharashtra',       country: 'India',       lat: 18.5204, lng: 73.8567 },
  { id: 'bangalore',        name: 'Bangalore',        state: 'Karnataka',         country: 'India',       lat: 12.9716, lng: 77.5946 },
  { id: 'chennai',          name: 'Chennai',          state: 'Tamil Nadu',        country: 'India',       lat: 13.0827, lng: 80.2707 },
  { id: 'kolkata',          name: 'Kolkata',          state: 'West Bengal',       country: 'India',       lat: 22.5726, lng: 88.3639 },
  { id: 'hyderabad',        name: 'Hyderabad',        state: 'Telangana',         country: 'India',       lat: 17.3850, lng: 78.4867 },
  { id: 'ahmedabad',        name: 'Ahmedabad',        state: 'Gujarat',           country: 'India',       lat: 23.0225, lng: 72.5714 },
  { id: 'jaipur',           name: 'Jaipur',           state: 'Rajasthan',         country: 'India',       lat: 26.9124, lng: 75.7873 },
  { id: 'lucknow',          name: 'Lucknow',          state: 'Uttar Pradesh',     country: 'India',       lat: 26.8467, lng: 80.9462 },
  { id: 'kanpur',           name: 'Kanpur',           state: 'Uttar Pradesh',     country: 'India',       lat: 26.4499, lng: 80.3319 },
  { id: 'patna',            name: 'Patna',            state: 'Bihar',             country: 'India',       lat: 25.5941, lng: 85.1376 },
  { id: 'surat',            name: 'Surat',            state: 'Gujarat',           country: 'India',       lat: 21.1702, lng: 72.8311 },
  { id: 'nagpur',           name: 'Nagpur',           state: 'Maharashtra',       country: 'India',       lat: 21.1458, lng: 79.0882 },
  { id: 'indore',           name: 'Indore',           state: 'Madhya Pradesh',    country: 'India',       lat: 22.7196, lng: 75.8577 },
  { id: 'bhopal',           name: 'Bhopal',           state: 'Madhya Pradesh',    country: 'India',       lat: 23.2599, lng: 77.4126 },
  { id: 'visakhapatnam',    name: 'Visakhapatnam',    state: 'Andhra Pradesh',    country: 'India',       lat: 17.6868, lng: 83.2185 },
  { id: 'kochi',            name: 'Kochi',            state: 'Kerala',            country: 'India',       lat: 9.9312,  lng: 76.2673 },
  // -- USA --
  { id: 'new-york',         name: 'New York',         state: 'New York',          country: 'USA',         lat: 40.7128, lng: -74.0060 },
  { id: 'los-angeles',      name: 'Los Angeles',      state: 'California',        country: 'USA',         lat: 34.0522, lng: -118.2437 },
  { id: 'chicago',          name: 'Chicago',          state: 'Illinois',          country: 'USA',         lat: 41.8781, lng: -87.6298 },
  { id: 'houston',          name: 'Houston',          state: 'Texas',             country: 'USA',         lat: 29.7604, lng: -95.3698 },
  { id: 'phoenix',          name: 'Phoenix',          state: 'Arizona',           country: 'USA',         lat: 33.4484, lng: -112.0740 },
  { id: 'san-francisco',    name: 'San Francisco',    state: 'California',        country: 'USA',         lat: 37.7749, lng: -122.4194 },
  { id: 'seattle',          name: 'Seattle',          state: 'Washington',        country: 'USA',         lat: 47.6062, lng: -122.3321 },
  { id: 'denver',           name: 'Denver',           state: 'Colorado',          country: 'USA',         lat: 39.7392, lng: -104.9903 },
  { id: 'miami',            name: 'Miami',            state: 'Florida',           country: 'USA',         lat: 25.7617, lng: -80.1918 },
  { id: 'boston',           name: 'Boston',           state: 'Massachusetts',     country: 'USA',         lat: 42.3601, lng: -71.0589 },
  // -- Canada --
  { id: 'toronto',          name: 'Toronto',          state: 'Ontario',           country: 'Canada',      lat: 43.6532, lng: -79.3832 },
  { id: 'vancouver',        name: 'Vancouver',        state: 'British Columbia',  country: 'Canada',      lat: 49.2827, lng: -123.1207 },
  { id: 'montreal',         name: 'Montreal',         state: 'Quebec',            country: 'Canada',      lat: 45.5017, lng: -73.5673 },
  { id: 'calgary',          name: 'Calgary',          state: 'Alberta',           country: 'Canada',      lat: 51.0447, lng: -114.0719 },
  // -- Europe --
  { id: 'london',           name: 'London',           state: 'England',           country: 'UK',          lat: 51.5074, lng: -0.1278 },
  { id: 'paris',            name: 'Paris',            state: 'Île-de-France',     country: 'France',      lat: 48.8566, lng: 2.3522 },
  { id: 'berlin',           name: 'Berlin',           state: 'Berlin',            country: 'Germany',     lat: 52.5200, lng: 13.4050 },
  { id: 'madrid',           name: 'Madrid',           state: 'Madrid',            country: 'Spain',       lat: 40.4168, lng: -3.7038 },
  { id: 'rome',             name: 'Rome',             state: 'Lazio',             country: 'Italy',       lat: 41.9028, lng: 12.4964 },
  { id: 'amsterdam',        name: 'Amsterdam',        state: 'North Holland',     country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { id: 'brussels',         name: 'Brussels',         state: 'Brussels',          country: 'Belgium',     lat: 50.8503, lng: 4.3517 },
  { id: 'vienna',           name: 'Vienna',           state: 'Vienna',            country: 'Austria',     lat: 48.2082, lng: 16.3738 },
  { id: 'warsaw',           name: 'Warsaw',           state: 'Masovia',           country: 'Poland',      lat: 52.2297, lng: 21.0122 },
  { id: 'stockholm',        name: 'Stockholm',        state: 'Stockholm County',  country: 'Sweden',      lat: 59.3293, lng: 18.0686 },
  { id: 'oslo',             name: 'Oslo',             state: 'Oslo',              country: 'Norway',      lat: 59.9139, lng: 10.7522 },
  { id: 'copenhagen',       name: 'Copenhagen',       state: 'Capital Region',    country: 'Denmark',     lat: 55.6761, lng: 12.5683 },
  { id: 'zurich',           name: 'Zurich',           state: 'Zurich',            country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { id: 'athens',           name: 'Athens',           state: 'Attica',            country: 'Greece',      lat: 37.9838, lng: 23.7275 },
  { id: 'lisbon',           name: 'Lisbon',           state: 'Lisbon',            country: 'Portugal',    lat: 38.7223, lng: -9.1393 },
  { id: 'budapest',         name: 'Budapest',         state: 'Budapest',          country: 'Hungary',     lat: 47.4979, lng: 19.0402 },
  { id: 'prague',           name: 'Prague',           state: 'Prague',            country: 'Czech Rep.',  lat: 50.0755, lng: 14.4378 },
  // -- Asia --
  { id: 'tokyo',            name: 'Tokyo',            state: 'Tokyo',             country: 'Japan',       lat: 35.6762, lng: 139.6503 },
  { id: 'osaka',            name: 'Osaka',            state: 'Osaka',             country: 'Japan',       lat: 34.6937, lng: 135.5023 },
  { id: 'beijing',          name: 'Beijing',          state: 'Beijing',           country: 'China',       lat: 39.9042, lng: 116.4074 },
  { id: 'shanghai',         name: 'Shanghai',         state: 'Shanghai',          country: 'China',       lat: 31.2304, lng: 121.4737 },
  { id: 'guangzhou',        name: 'Guangzhou',        state: 'Guangdong',         country: 'China',       lat: 23.1291, lng: 113.2644 },
  { id: 'shenzhen',         name: 'Shenzhen',         state: 'Guangdong',         country: 'China',       lat: 22.5431, lng: 114.0579 },
  { id: 'seoul',            name: 'Seoul',            state: 'Seoul',             country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { id: 'bangkok',          name: 'Bangkok',          state: 'Bangkok',           country: 'Thailand',    lat: 13.7563, lng: 100.5018 },
  { id: 'singapore',        name: 'Singapore',        state: '',                  country: 'Singapore',   lat: 1.3521,  lng: 103.8198 },
  { id: 'kuala-lumpur',     name: 'Kuala Lumpur',     state: 'Kuala Lumpur',      country: 'Malaysia',    lat: 3.1390,  lng: 101.6869 },
  { id: 'jakarta',          name: 'Jakarta',          state: 'DKI Jakarta',       country: 'Indonesia',   lat: -6.2088, lng: 106.8456 },
  { id: 'manila',           name: 'Manila',           state: 'NCR',               country: 'Philippines', lat: 14.5995, lng: 120.9842 },
  { id: 'ho-chi-minh-city', name: 'Ho Chi Minh City', state: 'HCM City',         country: 'Vietnam',     lat: 10.8231, lng: 106.6297 },
  { id: 'hanoi',            name: 'Hanoi',            state: 'Hanoi',             country: 'Vietnam',     lat: 21.0285, lng: 105.8542 },
  { id: 'dhaka',            name: 'Dhaka',            state: 'Dhaka',             country: 'Bangladesh',  lat: 23.8103, lng: 90.4125 },
  { id: 'karachi',          name: 'Karachi',          state: 'Sindh',             country: 'Pakistan',    lat: 24.8607, lng: 67.0011 },
  { id: 'lahore',           name: 'Lahore',           state: 'Punjab',            country: 'Pakistan',    lat: 31.5204, lng: 74.3587 },
  { id: 'kathmandu',        name: 'Kathmandu',        state: 'Bagmati',           country: 'Nepal',       lat: 27.7172, lng: 85.3240 },
  { id: 'colombo',          name: 'Colombo',          state: 'Western',           country: 'Sri Lanka',   lat: 6.9271,  lng: 79.8612 },
  // -- Middle East --
  { id: 'dubai',            name: 'Dubai',            state: 'Dubai',             country: 'UAE',         lat: 25.2048, lng: 55.2708 },
  { id: 'riyadh',           name: 'Riyadh',           state: 'Riyadh',            country: 'Saudi Arabia',lat: 24.7136, lng: 46.6753 },
  { id: 'tehran',           name: 'Tehran',           state: 'Tehran',            country: 'Iran',        lat: 35.6892, lng: 51.3890 },
  { id: 'istanbul',         name: 'Istanbul',         state: 'Istanbul',          country: 'Turkey',      lat: 41.0082, lng: 28.9784 },
  { id: 'ankara',           name: 'Ankara',           state: 'Ankara',            country: 'Turkey',      lat: 39.9334, lng: 32.8597 },
  { id: 'tel-aviv',         name: 'Tel Aviv',         state: 'Tel Aviv',          country: 'Israel',      lat: 32.0853, lng: 34.7818 },
  { id: 'doha',             name: 'Doha',             state: 'Doha',              country: 'Qatar',       lat: 25.2854, lng: 51.5310 },
  { id: 'kuwait-city',      name: 'Kuwait City',      state: 'Kuwait',            country: 'Kuwait',      lat: 29.3759, lng: 47.9774 },
  { id: 'baghdad',          name: 'Baghdad',          state: 'Baghdad',           country: 'Iraq',        lat: 33.3152, lng: 44.3661 },
  // -- Africa --
  { id: 'cairo',            name: 'Cairo',            state: 'Cairo',             country: 'Egypt',       lat: 30.0444, lng: 31.2357 },
  { id: 'lagos',            name: 'Lagos',            state: 'Lagos',             country: 'Nigeria',     lat: 6.5244,  lng: 3.3792 },
  { id: 'nairobi',          name: 'Nairobi',          state: 'Nairobi',           country: 'Kenya',       lat: -1.2921, lng: 36.8219 },
  { id: 'johannesburg',     name: 'Johannesburg',     state: 'Gauteng',           country: 'South Africa',lat: -26.2041, lng: 28.0473 },
  { id: 'cape-town',        name: 'Cape Town',        state: 'Western Cape',      country: 'South Africa',lat: -33.9249, lng: 18.4241 },
  { id: 'casablanca',       name: 'Casablanca',       state: 'Casablanca-Settat', country: 'Morocco',     lat: 33.5731, lng: -7.5898 },
  { id: 'addis-ababa',      name: 'Addis Ababa',      state: 'Addis Ababa',       country: 'Ethiopia',    lat: 9.0320,  lng: 38.7421 },
  { id: 'accra',            name: 'Accra',            state: 'Greater Accra',     country: 'Ghana',       lat: 5.6037,  lng: -0.1870 },
  // -- South America --
  { id: 'sao-paulo',        name: 'São Paulo',        state: 'São Paulo',         country: 'Brazil',      lat: -23.5505, lng: -46.6333 },
  { id: 'rio-de-janeiro',   name: 'Rio de Janeiro',   state: 'Rio de Janeiro',    country: 'Brazil',      lat: -22.9068, lng: -43.1729 },
  { id: 'buenos-aires',     name: 'Buenos Aires',     state: 'Buenos Aires',      country: 'Argentina',   lat: -34.6037, lng: -58.3816 },
  { id: 'bogota',           name: 'Bogotá',           state: 'Bogotá D.C.',       country: 'Colombia',    lat: 4.7110,   lng: -74.0721 },
  { id: 'lima',             name: 'Lima',             state: 'Lima',              country: 'Peru',        lat: -12.0464, lng: -77.0428 },
  { id: 'santiago',         name: 'Santiago',         state: 'Santiago',          country: 'Chile',       lat: -33.4489, lng: -70.6693 },
  { id: 'caracas',          name: 'Caracas',          state: 'Capital District',  country: 'Venezuela',   lat: 10.4806,  lng: -66.9036 },
  { id: 'quito',            name: 'Quito',            state: 'Pichincha',         country: 'Ecuador',     lat: -0.1807,  lng: -78.4678 },
  // -- Australia / Oceania --
  { id: 'sydney',           name: 'Sydney',           state: 'New South Wales',   country: 'Australia',   lat: -33.8688, lng: 151.2093 },
  { id: 'melbourne',        name: 'Melbourne',        state: 'Victoria',          country: 'Australia',   lat: -37.8136, lng: 144.9631 },
  { id: 'brisbane',         name: 'Brisbane',         state: 'Queensland',        country: 'Australia',   lat: -27.4698, lng: 153.0251 },
  { id: 'perth',            name: 'Perth',            state: 'Western Australia', country: 'Australia',   lat: -31.9505, lng: 115.8605 },
  { id: 'auckland',         name: 'Auckland',         state: 'Auckland',          country: 'New Zealand', lat: -36.8509, lng: 174.7645 },
  // -- Russia / Central Asia --
  { id: 'moscow',           name: 'Moscow',           state: 'Moscow',            country: 'Russia',      lat: 55.7558, lng: 37.6173 },
  { id: 'saint-petersburg', name: 'St. Petersburg',   state: 'St. Petersburg',    country: 'Russia',      lat: 59.9311, lng: 30.3609 },
  { id: 'almaty',           name: 'Almaty',           state: 'Almaty',            country: 'Kazakhstan',  lat: 43.2220, lng: 76.8512 },
];

// -- Settings defaults (local state only, no backend endpoint) -
export const DEFAULT_SETTINGS = {
  profile: {
    name:   'Guest User',
    email:  '',
    avatar: null,
  },
  appearance: {
    theme:             'light',
    compactMode:       false,
    animationsEnabled: true,
  },
  location: {
    defaultCity: '',
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
