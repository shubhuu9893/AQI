import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Activity } from 'lucide-react';
import AQIStatusBadge from '../common/AQIStatusBadge';
import { SkeletonCard } from '../common/Skeleton';
import { formatDistance } from '../../utils/formatters';

export default function NearbyStations({ stations, loading }) {
  const navigate = useNavigate();

  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
            Monitoring
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Nearby Stations
          </h3>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/map')}
          style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}
        >
          View map
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {stations?.map((station, idx) => (
            <button
              key={station.id}
              onClick={() => navigate(`/station/${station.id}`)}
              aria-label={`View details for ${station.name}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background var(--transition-fast)',
                borderBottom: idx < (stations.length - 1) ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Status dot */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: station.category?.color
                    ? `${station.category.color}18`
                    : 'var(--bg-surface-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <Activity size={16} color={station.category?.color ?? 'var(--text-muted)'} />
              </div>

              {/* Name + location */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {station.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MapPin size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {formatDistance(station.distance)}
                  </span>
                </div>
              </div>

              {/* AQI + badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: station.category?.color ?? 'var(--text-primary)', lineHeight: 1 }}>
                  {station.aqi}
                </span>
                <AQIStatusBadge aqi={station.aqi} size="xs" />
              </div>

              <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
