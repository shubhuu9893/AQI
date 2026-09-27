import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, History, Heart, MoreHorizontal, BarChart3, Bot, Settings } from 'lucide-react';
import Modal from '../common/Modal';

const MAIN_ITEMS = [
  { path: '/dashboard',  label: 'Home',    icon: LayoutDashboard },
  { path: '/map',        label: 'Map',     icon: Map },
  { path: '/history',    label: 'History', icon: History },
  { path: '/health',     label: 'Health',  icon: Heart },
];

const MORE_ITEMS = [
  { path: '/comparison', label: 'Comparison',   icon: BarChart3 },
  { path: '/ai',         label: 'AI Assistant', icon: Bot },
  { path: '/settings',   label: 'Settings',     icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = path =>
    path === '/dashboard'
      ? location.pathname === '/' || location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  const moreActive = MORE_ITEMS.some(i => isActive(i.path));

  return (
    <>
      <nav className="bottom-nav" aria-label="Bottom navigation">
        <div className="bottom-nav-items">
          {MAIN_ITEMS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              className={`bottom-nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={isActive(path) ? 'page' : undefined}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}

          <button
            className={`bottom-nav-item ${moreActive ? 'active' : ''}`}
            onClick={() => setMoreOpen(true)}
            aria-label="More options"
            aria-haspopup="dialog"
          >
            <MoreHorizontal size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

      <Modal isOpen={moreOpen} onClose={() => setMoreOpen(false)} title="More" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MORE_ITEMS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setMoreOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive(path) ? 'var(--primary-light)' : 'transparent',
                color: isActive(path) ? 'var(--primary)' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-base)',
                fontWeight: isActive(path) ? 600 : 400,
                width: '100%',
                textAlign: 'left',
                transition: 'background var(--transition-fast)',
              }}
            >
              <Icon size={22} color={isActive(path) ? 'var(--primary)' : 'var(--text-secondary)'} />
              {label}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
