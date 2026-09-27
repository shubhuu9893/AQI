import React from 'react';

export default function IconButton({
  children,
  label,
  size = 'md',
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type="button"
      className={`btn btn-icon ${size === 'lg' ? 'btn-icon-lg' : ''} ${className}`}
      aria-label={label}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
