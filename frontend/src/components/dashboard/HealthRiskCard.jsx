import React from 'react';
import { Heart, AlertCircle, Users } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import { SkeletonCard } from '../common/Skeleton';

const RISK_COLORS = {
  Low:      { color: 'var(--aqi-good)',     bg: 'var(--aqi-good-bg)',     text: 'var(--aqi-good-text)' },
  Moderate: { color: 'var(--aqi-moderate)', bg: 'var(--aqi-moderate-bg)', text: 'var(--aqi-moderate-text)' },
  High:     { color: 'var(--aqi-unhealthy)',bg: 'var(--aqi-unhealthy-bg)',text: 'var(--aqi-unhealthy-text)' },
  'Very High': { color: 'var(--aqi-very-unhealthy)', bg: 'var(--aqi-very-unhealthy-bg)', text: 'var(--aqi-very-unhealthy-text)' },
};

export default function HealthRiskCard({ data, loading }) {
  if (loading) return <SkeletonCard lines={5} />;
  if (!data) return null;

  const { level, score, maxScore, sensitiveGroups, recommendation, generalPopulation } = data;
  const palette = RISK_COLORS[level] ?? RISK_COLORS['Moderate'];

  return (
    <div className="card card-pad" style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: palette.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={18} color={palette.color} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Health Risk
            </div>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: palette.color,
              }}
            >
              {level}
            </span>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Risk Score</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: palette.color, lineHeight: 1 }}>
            {score}
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-muted)' }}>/{maxScore}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar
        value={score}
        max={maxScore}
        color={palette.color}
        height={8}
        className="mb-4"
      />
      <div style={{ marginBottom: 'var(--space-4)' }} />

      {/* Sensitive groups */}
      {sensitiveGroups?.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Users size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sensitive Groups
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sensitiveGroups.map(g => (
              <span
                key={g}
                style={{
                  padding: '3px 8px',
                  background: palette.bg,
                  color: palette.text,
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div
        style={{
          background: 'var(--bg-surface-2)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          borderLeft: `3px solid ${palette.color}`,
          display: 'flex',
          gap: 8,
        }}
        role="note"
        aria-label="Health recommendation"
      >
        <AlertCircle size={14} color={palette.color} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {recommendation}
        </p>
      </div>
    </div>
  );
}
