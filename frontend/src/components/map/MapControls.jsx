import React from 'react';
import { useMap } from 'react-leaflet';

/**
 * MapControls – floating control buttons on the right side of the map.
 * Includes: World view, Current Location, Zoom In, Zoom Out.
 *
 * Props:
 *   onCurrentLocation() – called when user clicks current location
 *   isLocating          – boolean, shows spinner when true
 */
export default function MapControls({ onCurrentLocation, isLocating }) {
  const map = useMap();

  function resetWorldView() {
    map.fitWorld({ padding: [20, 20] });
  }

  function zoomIn()  { map.zoomIn(); }
  function zoomOut() { map.zoomOut(); }

  const btnStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          36,
    height:         36,
    background:     'rgba(10,12,20,0.88)',
    backdropFilter: 'blur(8px)',
    border:         '1px solid rgba(255,255,255,0.14)',
    borderRadius:   8,
    color:          '#e2e8f0',
    cursor:         'pointer',
    fontSize:       18,
    fontWeight:     700,
    transition:     'background 0.15s, border-color 0.15s',
    lineHeight:     1,
    userSelect:     'none',
  };

  return (
    <div
      style={{
        position:      'absolute',
        right:         16,
        bottom:        100,
        zIndex:        1000,
        display:       'flex',
        flexDirection: 'column',
        gap:           6,
        pointerEvents: 'all',
      }}
    >
      {/* World/Global view */}
      <button
        style={{ ...btnStyle, fontSize: 14 }}
        onClick={resetWorldView}
        title="Global view"
        aria-label="Reset to world view"
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,40,60,0.95)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,12,20,0.88)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
      >
        {/* Globe icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </button>

      {/* Current location */}
      <button
        style={{ ...btnStyle, fontSize: 16 }}
        onClick={onCurrentLocation}
        disabled={isLocating}
        title={isLocating ? 'Detecting location…' : 'Use current location'}
        aria-label="Use current location"
        onMouseEnter={e => { if (!isLocating) { e.currentTarget.style.background = 'rgba(30,40,60,0.95)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,12,20,0.88)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
      >
        {isLocating ? '⟳' : '◎'}
      </button>

      {/* Separator */}
      <div style={{ height: 4 }} />

      {/* Zoom in */}
      <button
        style={{ ...btnStyle, fontSize: 22, fontWeight: 300 }}
        onClick={zoomIn}
        title="Zoom in"
        aria-label="Zoom in"
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,40,60,0.95)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,12,20,0.88)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
      >
        +
      </button>

      {/* Zoom out */}
      <button
        style={{ ...btnStyle, fontSize: 22, fontWeight: 300 }}
        onClick={zoomOut}
        title="Zoom out"
        aria-label="Zoom out"
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,40,60,0.95)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,12,20,0.88)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
      >
        −
      </button>
    </div>
  );
}
