import React, { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sun, Moon, Bell, RefreshCw, MapPin, Menu, Search,
  CheckCircle, AlertTriangle, Info, X, ChevronRight,
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { AppContext } from '../../context/AppContext';
import { getNotifications, markNotificationRead } from '../../services/api';
import { timeAgo } from '../../utils/formatters';

const PAGE_TITLES = {
  '/':           { title: 'Dashboard',    breadcrumb: ['Overview', 'Dashboard'] },
  '/dashboard':  { title: 'Dashboard',    breadcrumb: ['Overview', 'Dashboard'] },
  '/map':        { title: 'Map',          breadcrumb: ['Monitoring', 'Map'] },
  '/history':    { title: 'History',      breadcrumb: ['Monitoring', 'History'] },
  '/health':     { title: 'Health Impact',breadcrumb: ['Insights', 'Health Impact'] },
  '/comparison': { title: 'Comparison',   breadcrumb: ['Insights', 'Comparison'] },
  '/ai':         { title: 'AI Assistant', breadcrumb: ['Insights', 'AI Assistant'] },
  '/settings':   { title: 'Settings',     breadcrumb: ['System', 'Settings'] },
  '/search':     { title: 'Search',       breadcrumb: ['Search'] },
};

const NOTIF_ICONS = {
  warning: <AlertTriangle size={16} color="var(--warning)" />,
  info:    <Info size={16} color="var(--primary)" />,
  success: <CheckCircle size={16} color="var(--success)" />,
};

export default function Navbar({ onMenuClick, onRefresh, isRefreshing }) {
  const location = useLocation();
  // `navigate` is already defined earlier (line 32). Remove duplicate.
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Navigate function for keyboard shortcut and links
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef(null);

  // ---------- Context & state used for location handling ---------
  // This must be declared **before** the JSX return block.
  const { 
    locationLabel,
    setLat,
    setLon,
    setLabel,
  } = useContext(AppContext);

  const meta = PAGE_TITLES[location.pathname] ?? { title: 'AirHealth', breadcrumb: [] };
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K -> open search
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="navbar">
      {/* Left: hamburger (mobile) + title + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Mobile menu button */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{ flexShrink: 0, display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>

        <style>{`
          @media (max-width: 767px) { #mobile-menu-btn { display: flex !important; } }
        `}</style>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta.title}
          </h1>
          {meta.breadcrumb.length > 0 && (
            <nav
              className="navbar-breadcrumb"
              aria-label="Breadcrumb"
              style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}
            >
              {meta.breadcrumb.map((crumb, i) => (
                <React.Fragment key={crumb}>
                  {i > 0 && <ChevronRight size={10} color="var(--text-muted)" />}
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: i === meta.breadcrumb.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                    }}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
      </div>

       {/* Center: location selector */}

      <div
        className="navbar-location"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      background: 'var(--bg-surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-full)',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'border-color var(--transition-fast)',
    }}
    title="Change location"
  >
    <MapPin size={14} color="var(--primary)" />
    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
      {locationLabel}
    </span>
  </div>
      {/* Use current location button – only visible when not already set */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={async () => {
          try {
            const pos = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            // Update context values
            setLat(pos.coords.latitude);
            setLon(pos.coords.longitude);
            setLabel('Current location');
            // Navigate to dashboard to reload data for new coordinates
            navigate('/dashboard');
          } catch (e) {
            console.error('Geolocation error', e);
          }
        }}
        title="Use current location"
        style={{ marginLeft: 8 }}
      >
        <MapPin size={12} color="var(--primary)" />
      </button>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Search */}
        <Link
          to="/search"
          aria-label="Search (Ctrl+K)"
          className="btn btn-ghost btn-icon"
          title="Search (Ctrl+K)"
        >
          <Search size={18} />
        </Link>

        {/* Refresh */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onRefresh}
          aria-label="Refresh data"
          title="Refresh data"
          style={{ opacity: isRefreshing ? 0.5 : 1 }}
        >
          <RefreshCw size={18} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        {/* Theme toggle */}
        <button
          className="btn btn-ghost btn-icon navbar-desktop-actions"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{ display: 'flex' }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setNotifOpen(v => !v)}
            aria-label={`Notifications (${unread} unread)`}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 16,
                  height: 16,
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                {unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              className="dropdown-menu"
              style={{
                right: 0,
                top: 'calc(100% + 8px)',
                width: 340,
                maxHeight: 420,
                overflowY: 'auto',
              }}
              role="region"
              aria-label="Notifications panel"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {unread > 0 && (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '2px 6px', fontSize: 'var(--text-xs)' }}
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-icon"
                    style={{ width: 24, height: 24 }}
                    onClick={() => setNotifOpen(false)}
                    aria-label="Close notifications"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No notifications
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: n.read ? 'transparent' : 'var(--primary-light)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0 }}>{NOTIF_ICONS[n.type]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                        {timeAgo(n.time)}
                      </div>
                    </div>
                    {!n.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            fontSize: 12,
            color: 'white',
            fontWeight: 700,
          }}
          aria-label="User profile"
          role="button"
          tabIndex={0}
          title="Shubham Patil"
        >
          SP
        </div>
      </div>
    </header>
  );
}
