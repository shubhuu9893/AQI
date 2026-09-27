import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, onClear, placeholder = 'Search...', className = '' }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: 12,
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input ${className}`}
        style={{ paddingLeft: 36, paddingRight: value ? 36 : 12 }}
        aria-label={placeholder}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 2,
            display: 'flex',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
