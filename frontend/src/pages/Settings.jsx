import React, { useState, useContext } from 'react';
import {
  User, Palette, MapPin, Bell, Database, Info,
  Save, ChevronRight, Lock, KeyRound,
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEMO_CITIES } from '../data/demoData';
import { useToast } from '../components/common/Toast';

const SECTIONS = [
  { id: 'profile',      label: 'Profile & Security', icon: User },
  { id: 'appearance',   label: 'Appearance',         icon: Palette },
  { id: 'location',     label: 'Location',           icon: MapPin },
  { id: 'notifications',label: 'Notifications',      icon: Bell },
  { id: 'data',         label: 'Data Preferences',   icon: Database },
  { id: 'about',        label: 'About',              icon: Info },
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

  const { user, isPasswordProvider, updateUserProfile, updateUserPassword } = useAuth() || {};
  const displayName = user?.displayName || settings.profile?.name || 'User';
  const displayEmail = user?.email || settings.profile?.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  // State for updating profile name
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // State for updating password (for email/password users)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const update = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileNameInput.trim()) {
      addToast('Please enter a valid name', 'error');
      return;
    }
    setProfileSaving(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile(profileNameInput.trim());
      }
      update('profile', 'name', profileNameInput.trim());
      addToast('Profile updated successfully', 'success');
      setProfileNameInput('');
    } catch (err) {
      addToast(`Profile update failed: ${err.message}`, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      if (updateUserPassword) {
        await updateUserPassword(newPassword, currentPassword);
      }
      addToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(`Password update failed: ${err.message}`, 'error');
    } finally {
      setPasswordSaving(false);
    }
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
          <>
            <SectionCard title="Profile Information">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: user?.photoURL ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: 'white', fontWeight: 700, flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    ) : initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{displayName}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{displayEmail}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', marginTop: 4, fontWeight: 500 }}>
                      {isPasswordProvider ? 'Signed in with Email & Password' : 'Signed in with Google Account'}
                    </div>
                  </div>
                </div>

                {/* Edit Display Name */}
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="label" htmlFor="s-name">Update Full Name</label>
                    <input
                      id="s-name"
                      className="input"
                      placeholder={displayName}
                      value={profileNameInput}
                      onChange={e => setProfileNameInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Registered Email</label>
                    <input className="input" value={displayEmail} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={profileSaving || !profileNameInput.trim()}
                    >
                      {profileSaving ? 'Saving…' : 'Update Profile Name'}
                    </button>
                  </div>
                </form>
              </div>
            </SectionCard>

            {/* Change Password Card - Shown when user uses email/password */}
            {isPasswordProvider ? (
              <SectionCard title="Update Password">
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Since your account was created with email and password, you can change your password below.
                  </p>
                  <div>
                    <label className="label" htmlFor="s-cur-pass">Current Password (optional)</label>
                    <input
                      id="s-cur-pass"
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="s-new-pass">New Password (min. 6 characters)</label>
                    <input
                      id="s-new-pass"
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="s-confirm-pass">Confirm New Password</label>
                    <input
                      id="s-confirm-pass"
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={passwordSaving || !newPassword}
                    >
                      <Lock size={14} style={{ marginRight: 6 }} />
                      {passwordSaving ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </SectionCard>
            ) : (
              <SectionCard title="Security & Authentication">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
                  <KeyRound size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Your account is authenticated via <strong>Google Sign-In</strong>. Passwords and two-factor authentication are securely managed through your Google Account.
                  </div>
                </div>
              </SectionCard>
            )}
          </>
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
