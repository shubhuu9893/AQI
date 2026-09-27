import React, { useState, useContext } from 'react';
import {
  User, Palette, MapPin, Bell, Database, Info,
  Save, ChevronRight,
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEMO_CITIES } from '../data/demoData';
import { useToast } from '../components/common/Toast';

const SECTIONS = [
  { id: 'profile',      label: 'Profile',          icon: User },
  { id: 'appearance',   label: 'Appearance',        icon: Palette },
  { id: 'location',     label: 'Location',          icon: MapPin },
  { id: 'notifications',label: 'Notifications',     icon: Bell },
  { id: 'data',         label: 'Data Preferences',  icon: Database },
  { id: 'about',        label: 'About',             icon: Info },
];

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      <label className="toggle" aria-label={label}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const addToast = useToast();
  const [settings, setSettings] = useLocalStorage('airhealth-settings', DEFAULT_SETTINGS);
  const [activeSection, setActiveSection] = useState('profile');

  const update = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const save = async () => {
    try {
      await updateSettings(settings);
      addToast('Settings saved successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast(`Failed to save settings: ${err.message ?? err}`, 'error');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <SectionCard title="Profile">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', fontWeight: 700, flexShrink: 0 }}>
                  SP
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{settings.profile?.name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{settings.profile?.email}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>Student</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label" htmlFor="s-name">Full Name</label>
                  <input id="s-name" className="input" value={settings.profile?.name ?? ''} onChange={e => update('profile', 'name', e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="s-email">Email</label>
                  <input id="s-email" type="email" className="input" value={settings.profile?.email ?? ''} onChange={e => update('profile', 'email', e.target.value)} />
                </div>
              </div>
            </div>
          </SectionCard>
        );

      case 'appearance':
        return (
          <SectionCard title="Appearance">
            <ToggleRow
              label="Dark Mode"
              description="Switch between light and dark interface"
              checked={theme === 'dark'}
              onChange={() => toggleTheme()}
            />
            <ToggleRow
              label="Compact Mode"
              description="Reduce spacing for more content density"
              checked={settings.appearance?.compactMode ?? false}
              onChange={v => update('appearance', 'compactMode', v)}
            />
            <ToggleRow
              label="Animations"
              description="Enable UI transitions and animations"
              checked={settings.appearance?.animationsEnabled ?? true}
              onChange={v => update('appearance', 'animationsEnabled', v)}
            />
          </SectionCard>
        );

      case 'location':
        return (
          <SectionCard title="Location">
            <ToggleRow
              label="Auto-detect Location"
              description="Use device GPS to detect your location"
              checked={settings.location?.autoDetect ?? true}
              onChange={v => update('location', 'autoDetect', v)}
            />
            <div style={{ paddingTop: 14 }}>
              <label className="label" htmlFor="s-city">Default City</label>
              <select
                id="s-city"
                className="select"
                value={settings.location?.defaultCity ?? 'pune'}
                onChange={e => update('location', 'defaultCity', e.target.value)}
              >
                {DEMO_CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
                ))}
              </select>
            </div>
          </SectionCard>
        );

      case 'notifications':
        return (
          <SectionCard title="Notifications">
            <ToggleRow
              label="AQI Alerts"
              description="Notify when AQI crosses your threshold"
              checked={settings.notifications?.aqiAlerts ?? true}
              onChange={v => update('notifications', 'aqiAlerts', v)}
            />
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <label className="label" htmlFor="s-threshold">AQI Alert Threshold</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  id="s-threshold"
                  type="range"
                  min={50} max={300} step={10}
                  value={settings.notifications?.aqiThreshold ?? 150}
                  onChange={e => update('notifications', 'aqiThreshold', Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
                <span style={{ minWidth: 40, textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {settings.notifications?.aqiThreshold ?? 150}
                </span>
              </div>
            </div>
            <ToggleRow
              label="Station Updates"
              description="Notify when nearby stations sync new data"
              checked={settings.notifications?.stationUpdates ?? false}
              onChange={v => update('notifications', 'stationUpdates', v)}
            />
            <ToggleRow
              label="Daily Summary"
              description="Receive a daily air quality summary"
              checked={settings.notifications?.dailySummary ?? true}
              onChange={v => update('notifications', 'dailySummary', v)}
            />
            <ToggleRow
              label="Weather Alerts"
              description="Notify for weather events affecting air quality"
              checked={settings.notifications?.weatherAlerts ?? false}
              onChange={v => update('notifications', 'weatherAlerts', v)}
            />
          </SectionCard>
        );

      case 'data':
        return (
          <SectionCard title="Data Preferences">
            <ToggleRow
              label="Auto Refresh"
              description="Automatically refresh data at set interval"
              checked={settings.dataPreferences?.autoRefresh ?? true}
              onChange={v => update('dataPreferences', 'autoRefresh', v)}
            />
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <label className="label" htmlFor="s-refresh">Refresh Interval</label>
              <select id="s-refresh" className="select" value={settings.dataPreferences?.refreshInterval ?? 5} onChange={e => update('dataPreferences', 'refreshInterval', Number(e.target.value))}>
                {[1, 2, 5, 10, 15, 30].map(n => <option key={n} value={n}>Every {n} minute{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <label className="label" htmlFor="s-temp">Temperature Unit</label>
              <select id="s-temp" className="select" value={settings.dataPreferences?.temperatureUnit ?? 'celsius'} onChange={e => update('dataPreferences', 'temperatureUnit', e.target.value)}>
                <option value="celsius">Celsius (degC)</option>
                <option value="fahrenheit">Fahrenheit (degF)</option>
              </select>
            </div>
            <div style={{ padding: '14px 0' }}>
              <label className="label" htmlFor="s-dist">Distance Unit</label>
              <select id="s-dist" className="select" value={settings.dataPreferences?.distanceUnit ?? 'km'} onChange={e => update('dataPreferences', 'distanceUnit', e.target.value)}>
                <option value="km">Kilometres (km)</option>
                <option value="miles">Miles (mi)</option>
              </select>
            </div>
          </SectionCard>
        );

      case 'about':
        return (
          <SectionCard title="About AirHealth India">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Application',   value: 'AirHealth India' },
                { label: 'Version',       value: '1.0.0 (UI Demo)' },
                { label: 'Description',   value: 'Air Pollution & Health Impact Dashboard' },
                { label: 'Data Sources',  value: 'CPCB, OpenAQ, AirVisual (API-ready)' },
                { label: 'Stack',         value: 'React 18 + Vite + FastAPI (backend-ready)' },
                { label: 'Mode',          value: 'UI Demo -- no real backend connected' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Settings</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Manage your preferences</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={save}>
          <Save size={14} /> Save Changes
        </button>
      </div>

      <div className="settings-layout" style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
        {/* Nav */}
        <div
          className="settings-nav card"
          style={{ width: 200, flexShrink: 0, padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeSection === id ? 'var(--primary-light)' : 'transparent',
                color: activeSection === id ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: activeSection === id ? 600 : 400,
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)',
              }}
              aria-current={activeSection === id ? 'page' : undefined}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {activeSection === id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
