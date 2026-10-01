import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCities } from '../../services/api';

/**
 * MapSearchBar – floating search bar embedded in the map page.
 * Searches the global city list + Nominatim for worldwide city lookup.
 *
 * Props:
 *   onCitySelect(cityObj) – called when user selects a city
 *   placeholder           – input placeholder text
 */
export default function MapSearchBar({ onCitySelect, placeholder = 'Search city, country…' }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);
  const wrapRef     = useRef(null);

  // Debounced search
  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const cities = await getCities(q);
      setResults(cities.slice(0, 10));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => search(query.trim()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectCity(city) {
    setQuery('');
    setOpen(false);
    setResults([]);
    if (onCitySelect) onCitySelect(city);
  }

  return (
    <div
      ref={wrapRef}
      style={{
        position:  'absolute',
        top:       16,
        left:      '50%',
        transform: 'translateX(-50%)',
        zIndex:    1000,
        width:     'min(420px, calc(100vw - 64px))',
        pointerEvents: 'all',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Input */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        background: 'rgba(10,12,20,0.92)',
        backdropFilter: 'blur(12px)',
        border:     '1px solid rgba(255,255,255,0.15)',
        borderRadius: open && results.length > 0 ? '10px 10px 0 0' : 10,
        boxShadow:  '0 4px 24px rgba(0,0,0,0.5)',
        overflow:   'hidden',
        transition: 'border-radius 0.15s',
      }}>
        {/* Search icon */}
        <div style={{ paddingLeft: 14, color: '#64748b', fontSize: 16, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={{
            flex:       1,
            padding:    '12px 10px',
            background: 'transparent',
            border:     'none',
            outline:    'none',
            color:      '#e2e8f0',
            fontSize:   14,
            fontFamily: 'inherit',
          }}
          aria-label="Search for a city or country"
          autoComplete="off"
          spellCheck={false}
        />
        {/* Clear / Loading */}
        {loading && (
          <div style={{ paddingRight: 12, color: '#64748b', fontSize: 12 }}>…</div>
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            style={{ paddingRight: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 18, display: 'flex', alignItems: 'center' }}
            aria-label="Clear search"
          >×</button>
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div style={{
          background:    'rgba(10,12,20,0.96)',
          backdropFilter: 'blur(12px)',
          border:        '1px solid rgba(255,255,255,0.12)',
          borderTop:     'none',
          borderRadius:  '0 0 10px 10px',
          boxShadow:     '0 8px 24px rgba(0,0,0,0.5)',
          maxHeight:     320,
          overflowY:     'auto',
        }}>
          {results.map((city, i) => {
            const sub = [city.state, city.country].filter(Boolean).join(', ');
            return (
              <button
                key={city.id ?? i}
                onClick={() => selectCity(city)}
                style={{
                  width:       '100%',
                  display:     'flex',
                  alignItems:  'center',
                  gap:         10,
                  padding:     '10px 14px',
                  background:  'transparent',
                  border:      'none',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor:      'pointer',
                  textAlign:   'left',
                  transition:  'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#475569' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{city.name}</div>
                  {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{sub}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div style={{
          background:    'rgba(10,12,20,0.96)',
          backdropFilter: 'blur(12px)',
          border:        '1px solid rgba(255,255,255,0.12)',
          borderTop:     'none',
          borderRadius:  '0 0 10px 10px',
          padding:       '14px',
          fontSize:      12,
          color:         '#64748b',
          textAlign:     'center',
        }}>
          No cities found for "{query}"
        </div>
      )}
    </div>
  );
}
