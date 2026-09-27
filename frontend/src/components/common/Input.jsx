import React from 'react';

export default function Input({ label, id, error, className = '', ...props }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label className="label" htmlFor={inputId}>{label}</label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
