import React from 'react';

export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`tabs ${className}`} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          className={`tab-btn ${active === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.icon && <span style={{ marginRight: 4 }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
