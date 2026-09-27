import React from 'react';

export default function Skeleton({ width = '100%', height = 16, borderRadius, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: borderRadius ?? 'var(--radius-md)' }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width="60%" height={20} />
      <Skeleton width="40%" height={40} />
      {Array.from({ length: lines - 1 }, (_, i) => (
        <Skeleton key={i} width={`${80 - i * 10}%`} height={12} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, spacing = 8 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '65%' : '100%'} height={14} />
      ))}
    </div>
  );
}
