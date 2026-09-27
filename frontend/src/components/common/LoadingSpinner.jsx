import React from 'react';

export default function LoadingSpinner({ size = 24, color, className = '' }) {
  const style = {
    width: size,
    height: size,
    border: `2px solid var(--border)`,
    borderTopColor: color ?? 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div role="status" aria-label="Loading" className={className} style={style} />
    </>
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 320,
      gap: 12,
      flexDirection: 'column',
      color: 'var(--text-muted)',
    }}>
      <LoadingSpinner size={36} />
      <span style={{ fontSize: 'var(--text-sm)' }}>Loading...</span>
    </div>
  );
}
