import React, { createContext, useState, useEffect } from 'react';

/**
 * Reverse‑geocode latitude/longitude into a human readable label using the
 * public Nominatim API. The function is intentionally lightweight and does not
 * handle caching; for production you may want to add rate‑limit handling or an
 * internal cache.
 */
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('geocode failed');
    const data = await resp.json();
    const { city, state, town } = data.address || {};
    const name = city ?? town ?? '';
    const loc = [name, state].filter(Boolean).join(', ');
    return loc || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
}

// Pune as fallback
// Default coordinates (fallback). These are used until the user grants geolocation or selects a city.
// We keep Pune as the original default to preserve existing behaviour, but all logic now
// references the context values so the application can shift seamlessly when the
// user navigates away from the hard‑coded city.
const DEFAULT_LAT = 18.5204;
const DEFAULT_LON = 73.8567;

export const AppContext = createContext({
  lat: DEFAULT_LAT,
  lon: DEFAULT_LON,
  locationLabel: 'Pune, Maharashtra',
  selectedCity: 'pune',
  setSelectedCity: () => {},
  // Added setters for latitude/longitude and label to allow components
  // such as Navbar or SearchPage to update the context when a user
  // selects a city manually or chooses to use their current location.
  setLat: () => {},
  setLon: () => {},
  setLabel: () => {},
});

export function AppProvider({ children }) {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lon, setLon] = useState(DEFAULT_LON);
  const [locationLabel, setLabel] = useState('India');
  const [selectedCity, setSelectedCity] = useState('pune');

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLon(longitude);
        // Fetch a human‑readable label for the coordinates
        reverseGeocode(latitude, longitude).then(setLabel).catch(() => setLabel('Current location'));
      },
      () => {
        // Permission denied or unavailable -- stay on Pune default
      },
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        lat,
        lon,
        locationLabel,
        selectedCity,
        setSelectedCity,
        setLat,
        setLon,
        setLabel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
