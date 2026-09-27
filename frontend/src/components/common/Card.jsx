import React from 'react';

export default function Card({ children, className = '', padding = true, hover = false, onClick, style }) {
  return (
    <div
      className={`card ${padding ? 'card-pad' : ''} ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick(e) : undefined}
    >
      {children}
    </div>
  );
}
