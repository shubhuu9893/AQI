import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

/**
 * Reverse-geocode latitude/longitude → human-readable label using Nominatim.
 */
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!resp.ok) throw new Error('geocode failed');
    const data = await resp.json();
    const { city, state, town, village, county, country } = data.address || {};
    const name = city ?? town ?? village ?? county ?? '';
    const loc = [name, state].filter(Boolean).join(', ');
    return {
      label:   loc || `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      city:    name || '',
      state:   state || '',
      country: country || '',
    };
  } catch {
    return {
      label:   `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      city:    '',
      state:   '',
      country: '',
    };
  }
}

/**
 * Single source of truth for the selected location.
 *
 * {
 *   city:      string   – human readable city name
 *   state:     string   – state/province
 *   country:   string   – country name (derived from geocode, NOT hardcoded)
 *   lat:       number
 *   lon:       number
 *   label:     string   – display label (e.g. "London, England")
 *   source:    "initial" | "search" | "current-location" | "map-click"
 * }
 */

// World geographic centre – used only when geolocation is unavailable and no
// city has been searched. Not tied to any specific country.
const WORLD_CENTER_LAT = 20;
const WORLD_CENTER_LON = 0;

const DEFAULT_LOCATION = {
  city:    '',
  state:   '',
  country: '',
  lat:     WORLD_CENTER_LAT,
  lon:     WORLD_CENTER_LON,
  label:   'World',
  source:  'initial',
};

export const AppContext = createContext({
  location: DEFAULT_LOCATION,
  setLocation: () => {},
  setLocationFromCoords: async () => {},
  setLocationFromCity: () => {},
  isLocating: false,
  locationError: null,
  // Legacy compat (kept so existing components don't crash before migration)
  lat: WORLD_CENTER_LAT,
  lon: WORLD_CENTER_LON,
  locationLabel: 'World',
  selectedCity: '',
  setSelectedCity: () => {},
  setLat: () => {},
  setLon: () => {},
  setLabel: () => {},
});

export function AppProvider({ children }) {
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  /** Full location update – single call from anywhere */
  const setLocation = useCallback((partial) => {
    setLocationState(prev => ({ ...prev, ...partial }));
  }, []);

  /** Called when user clicks "Use Current Location" or coords are known */
  const setLocationFromCoords = useCallback(async (lat, lon, source = 'current-location') => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const geo = await reverseGeocode(lat, lon);
      setLocationState({
        city:    geo.city,
        state:   geo.state,
        country: geo.country,   // derived from Nominatim, not hardcoded
        lat,
        lon,
        label:   geo.label,
        source,
      });
    } catch {
      setLocationState(prev => ({
        ...prev,
        lat,
        lon,
        label:  'Current Location',
        source,
      }));
    } finally {
      setIsLocating(false);
    }
  }, []);

  /** Called when user picks a city from the search / city list */
  const setLocationFromCity = useCallback((cityObj) => {
    // cityObj: { id, name, state, country, lat, lng }
    setLocationState({
      city:    cityObj.name,
      state:   cityObj.state  || '',
      country: cityObj.country || '',
      lat:     cityObj.lat,
      lon:     cityObj.lng ?? cityObj.lon,
      label:   [cityObj.name, cityObj.country].filter(Boolean).join(', '),
      source:  'search',
    });
  }, []);

  // Attempt geolocation on mount (non-blocking).
  // If denied or unavailable we silently stay at World centre.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocationFromCoords(pos.coords.latitude, pos.coords.longitude, 'current-location');
      },
      () => {
        // Permission denied – keep world centre default.
      },
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }, [setLocationFromCoords]);

  // -------------------------------------------------------------------------
  // Legacy compat shims – remove gradually as components are updated
  // -------------------------------------------------------------------------
  const legacySetLat   = useCallback((lat)   => setLocation({ lat }),   [setLocation]);
  const legacySetLon   = useCallback((lon)   => setLocation({ lon }),   [setLocation]);
  const legacySetLabel = useCallback((label) => setLocation({ label }), [setLocation]);
  const legacySetCity  = useCallback((cityId) => setLocation({ city: cityId }), [setLocation]);

  return (
    <AppContext.Provider
      value={{
        location,
        setLocation,
        setLocationFromCoords,
        setLocationFromCity,
        isLocating,
        locationError,
        // Legacy compat
        lat:           location.lat,
        lon:           location.lon,
        locationLabel: location.label,
        selectedCity:  location.city?.toLowerCase() || '',
        setSelectedCity: legacySetCity,
        setLat:   legacySetLat,
        setLon:   legacySetLon,
        setLabel: legacySetLabel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/** Convenience hook */
export function useAppContext() {
  return useContext(AppContext);
}
