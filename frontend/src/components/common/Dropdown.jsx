import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alignStyle = align === 'right' ? { right: 0 } : { left: 0 };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <div onClick={() => setOpen(v => !v)} style={{ cursor: 'pointer' }}>
        {typeof trigger === 'function' ? trigger(open) : trigger}
      </div>
      {open && (
        <div
          className="dropdown-menu"
          style={{ top: 'calc(100% + 8px)', ...alignStyle }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, danger = false, icon }) {
  return (
    <button
      className={`dropdown-item ${danger ? 'dropdown-item-danger' : ''}`}
      onClick={onClick}
    >
      {icon && <span style={{ display: 'flex', opacity: 0.7 }}>{icon}</span>}
      {children}
    </button>
  );
}
