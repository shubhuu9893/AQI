import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import AQIStatusBadge from '../common/AQIStatusBadge';

/**
 * Creates a simple coloured circle icon based on the station's AQI category.
 */
const createCircleIcon = color => {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};border-radius:50%;width:12px;height:12px;border:2px solid white;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export default function AQIStationMarker({ station }) {
  const icon = createCircleIcon(station.category.color);
  return (
    <Marker position={[station.lat, station.lng]} icon={icon}>
      <Popup style={{ minWidth: '120px' }}>
        <div style={{ fontSize: 'var(--text-sm)' }}>
          <strong>{station.name}</strong>
          <br />
          {station.city}
          <br />
          AQI:
          <span style={{ marginLeft: 4 }}>
            <AQIStatusBadge aqi={station.aqi} size="sm" />
          </span>
        </div>
      </Popup>
    </Marker>
  );
}