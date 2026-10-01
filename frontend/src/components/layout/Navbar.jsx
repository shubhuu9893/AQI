import React, { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sun, Moon, Bell, RefreshCw, MapPin, Menu, Search,
  CheckCircle, AlertTriangle, Info, X, ChevronRight, Navigation,
  LogOut, User,
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/api';
import { timeAgo } from '../../utils/formatters';

const PAGE_TITLES = {
  '/':           { title: 'Dashboard',     breadcrumb: ['Overview', 'Dashboard'] },
  '/dashboard':  { title: 'Dashboard',     breadcrumb: ['Overview', 'Dashboard'] },
  '/map':        { title: 'Map',           breadcrumb: ['Monitoring', 'Map'] },
  '/history':    { title: 'History',       breadcrumb: ['Monitoring', 'History'] },
  '/health':     { title: 'Health Impact', breadcrumb: ['Insights', 'Health Impact'] },
  '/comparison': { title: 'Comparison',    breadcrumb: ['Insights', 'Comparison'] },
  '/ai':         { title: 'AI Assistant',  breadcrumb: ['Insights', 'AI Assistant'] },
  '/settings':   { title: 'Settings',      breadcrumb: ['System', 'Settings'] },
  '/search':     { title: 'Search',        breadcrumb: ['Search'] },
};

const NOTIF_ICONS = {
  warning: <AlertTriangle size={16} color="var(--warning)" />,
  info:    <Info size={16} color="var(--primary)" />,
  success: <CheckCircle size={16} color="var(--success)" />,
};

export default function Navbar({ onMenuClick, onRefresh, isRefreshing }) {
  const routerLocation = useLocation();
  const navigate       = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Unified location context
  const { location: appLocation, setLocationFromCoords, isLocating } = useContext(AppContext);

  // Auth
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [locError,      setLocError]      = useState(null);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const notifRef    = useRef(null);
  const userMenuRef = useRef(null);

  const meta   = PAGE_TITLES[routerLocation.pathname] ?? { title: 'AirHealth', breadcrumb: [] };
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    getNotifications().then(backendNotifs => {
      const list = [...backendNotifs];

      // Check if user is newly registered or needs welcome notification
      if (user) {
        const welcomeKey = `airhealth_welcome_seen_${user.uid || user.email}`;
        const hasSeenWelcome = localStorage.getItem(welcomeKey);

        if (!hasSeenWelcome) {
          const welcomeNotif = {
            id:      'welcome_' + Date.now(),
            type:    'success',
            title:   `Welcome to AirHealth, ${user.displayName || user.email?.split('@')[0] || 'User'}!`,
            message: 'Your account is active. Explore live global AQI, AI air assistant, and set health risk preferences in Settings.',
            time:    new Date().toISOString(),
            read:    false,
          };
          list.unshift(welcomeNotif);
          localStorage.setItem(welcomeKey, 'true');
        }
      }

      setNotifications(list);
    });
  }, [user]);

  // Keyboard shortcut Ctrl+K → search
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

  // Close user menu dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const handleCurrentLocation = () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setLocationFromCoords(pos.coords.latitude, pos.coords.longitude, 'current-location');
        navigate('/dashboard');
      },
      (err) => {
        setLocError(err.code === 1
          ? 'Location permission denied'
          : 'Unable to determine location');
        // Clear error after 4s
        setTimeout(() => setLocError(null), 4000);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <header className="navbar">
      {/* Left: hamburger (mobile) + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
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
          <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meta.title}
          </h1>
          {meta.breadcrumb.length > 0 && (
            <nav className="navbar-breadcrumb" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {meta.breadcrumb.map((crumb, i) => (
                <React.Fragment key={crumb}>
                  {i > 0 && <ChevronRight size={10} color="var(--text-muted)" />}
                  <span style={{ fontSize: 'var(--text-xs)', color: i === meta.breadcrumb.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Center: current location pill */}
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
          maxWidth: 220,
        }}
        onClick={() => navigate('/search')}
        title="Change location"
      >
        <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {appLocation.label || 'Select location'}
        </span>
      </div>

      {/* Current location button */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          title={isLocating ? 'Detecting location…' : 'Use current location'}
          aria-label="Use current location"
          style={{ opacity: isLocating ? 0.6 : 1 }}
        >
          <Navigation size={18} color={isLocating ? 'var(--primary)' : undefined} />
        </button>
        {locError && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 220,
            padding: '8px 12px',
            background: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: 'var(--danger-dark)',
            zIndex: 'var(--z-modal)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {locError}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Search */}
        <Link to="/search" aria-label="Search (Ctrl+K)" className="btn btn-ghost btn-icon" title="Search (Ctrl+K)">
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
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 16, height: 16,
                background: 'var(--danger)', color: 'white', borderRadius: '50%',
                fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center',
                justifyContent: 'center', lineHeight: 1,
              }} aria-hidden="true">
                {unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="dropdown-menu" style={{ right: 0, top: 'calc(100% + 8px)', width: 340, maxHeight: 420, overflowY: 'auto' }} role="region" aria-label="Notifications panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Notifications</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {unread > 0 && (
                    <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 'var(--text-xs)' }} onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                  <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24 }} onClick={() => setNotifOpen(false)} aria-label="Close notifications">
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
                      display: 'flex', gap: 12, padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: n.read ? 'transparent' : 'var(--primary-light)',
                      cursor: 'pointer', transition: 'background var(--transition-fast)',
                    }}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0 }}>{NOTIF_ICONS[n.type] ?? NOTIF_ICONS.info}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.time)}</div>
                    </div>
                    {!n.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                ))
              )}\n            </div>
          )}
        </div>

        {/* User avatar + dropdown */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            aria-label="User menu"
            aria-haspopup="true"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: user?.photoURL ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: '2px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            ) : (
              <span style={{ fontSize: 12, color: 'white', fontWeight: 700 }}>
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() ?? 'U'}
              </span>
            )}
          </button>

          {userMenuOpen && (
            <div
              className="dropdown-menu"
              style={{ right: 0, top: 'calc(100% + 8px)', width: 240, padding: 0 }}
            >
              {/* User info */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: user?.photoURL ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {user?.photoURL
                      ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                      : <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{user?.displayName?.slice(0, 2).toUpperCase() ?? 'U'}</span>
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.displayName || 'User'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div style={{ padding: '6px 0' }}>
                <button
                  onClick={async () => { setUserMenuOpen(false); await logout(); navigate('/login'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)',
                    textAlign: 'left', transition: 'background 0.1s, color 0.1s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
