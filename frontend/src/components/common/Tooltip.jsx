import React from 'react';

export default function Tooltip({ children, content, position = 'top' }) {
  if (!content) return children;

  const posStyle = {
    top:    { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top:    'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    left:   { right:  'calc(100% + 6px)', top: '50%',  transform: 'translateY(-50%)' },
    right:  { left:   'calc(100% + 6px)', top: '50%',  transform: 'translateY(-50%)' },
  }[position];

  return (
    <div className="tooltip-wrapper">
      {children}
      <div
        className="tooltip-content"
        role="tooltip"
        style={{ ...posStyle, position: 'absolute' }}
      >
        {content}
      </div>
    </div>
  );
}
