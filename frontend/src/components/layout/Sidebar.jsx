import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  History,
  Heart,
  BarChart3,
  Bot,
  Settings,
  Wind,
  Activity,
  ChevronLeft,
  ChevronRight,
  Wifi,
  User,
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import Tooltip from '../common/Tooltip';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { path: '/map',     label: 'Map',     icon: Map },
      { path: '/history', label: 'History', icon: History },
    ],
  },
  {
    title: 'Insights',
    items: [
      { path: '/health',     label: 'Health Impact', icon: Heart },
      { path: '/comparison', label: 'Comparison',    icon: BarChart3 },
      { path: '/ai',         label: 'AI Assistant',  icon: Bot },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();

  const isActive = path =>
    path === '/dashboard'
      ? location.pathname === '/' || location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? '' : 'hidden'}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div
          className="sidebar-brand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '20px 16px 16px',
            borderBottom: '1px solid var(--sidebar-border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wind size={20} color="white" />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#f0f9ff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                AIRHEALTH
              </div>
              <div
                className="sidebar-brand-sub"
                style={{ fontSize: 10, color: 'var(--sidebar-text)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.4 }}
              >
                India
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}
          aria-label="Sidebar navigation"
        >
          {NAV_SECTIONS.map(section => (
            <div key={section.title} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <div
                  className="sidebar-section-title"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--sidebar-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '10px 20px 4px',
                    opacity: 0.6,
                  }}
                >
                  {section.title}
                </div>
              )}

              {section.items.map(({ path, label, icon: Icon }) => {
                const active = isActive(path);
                return (
                  <Tooltip key={path} content={collapsed ? label : null} position="right">
                    <NavLink
                      to={path}
                      onClick={onMobileClose}
                      className="sidebar-nav-item"
                      aria-label={label}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: collapsed ? '12px' : '10px 16px',
                        margin: '1px 8px',
                        borderRadius: 'var(--radius-md)',
                        color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                        background: active ? 'var(--sidebar-active)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all var(--transition-fast)',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)';
                      }}
                      onMouseLeave={e => {
                        if (!active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {active && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3,
                            height: '60%',
                            background: 'var(--primary)',
                            borderRadius: '0 2px 2px 0',
                          }}
                        />
                      )}
                      <Icon
                        size={18}
                        style={{
                          flexShrink: 0,
                          color: active ? 'var(--primary)' : 'inherit',
                        }}
                      />
                      {!collapsed && (
                        <span
                          className="sidebar-label"
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: active ? 600 : 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {label}
                        </span>
                      )}
                    </NavLink>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--sidebar-border)',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Status */}
          {!collapsed && (
            <div
              className="sidebar-footer-text"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'rgba(34,197,94,0.08)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Wifi size={14} color="var(--success)" />
              <div>
                <div style={{ fontSize: 10, color: 'var(--sidebar-text)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Data Status</div>
                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Monitoring Active</div>
              </div>
            </div>
          )}

          {/* User */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <User size={16} color="white" />
            </div>
            {!collapsed && (
              <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--sidebar-text-active)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Shubham Patil
                </div>
                <div style={{ fontSize: 10, color: 'var(--sidebar-text)', opacity: 0.6 }}>Student</div>
              </div>
            )}
          </div>

          {/* Collapse toggle -- desktop only */}
          <button
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '8px',
              background: 'var(--sidebar-hover)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--sidebar-text)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
