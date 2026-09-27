import React from 'react';

export default function Select({ label, id, options = [], error, className = '', ...props }) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label className="label" htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        className={`select ${className}`}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  );
}
