/**
 * pages/Auth.jsx – Login / Sign-up page
 *
 * Features:
 *  - Email + password login and signup (toggle)
 *  - Google Sign-In (popup)
 *  - Friendly Firebase error messages
 *  - Dark glassmorphic design matching the app theme
 *  - Redirects to /dashboard on success
 *  - Already-logged-in users are redirected away immediately
 */

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Firebase error → human-readable message ──────────────────
const FIREBASE_ERRORS = {
  'auth/user-not-found':        'No account found with this email.',
  'auth/wrong-password':        'Incorrect password. Please try again.',
  'auth/invalid-credential':    'Invalid email or password.',
  'auth/email-already-in-use':  'An account with this email already exists.',
  'auth/weak-password':         'Password must be at least 6 characters.',
  'auth/invalid-email':         'Please enter a valid email address.',
  'auth/too-many-requests':     'Too many attempts. Please wait a moment.',
  'auth/popup-closed-by-user':  'Google sign-in was cancelled.',
  'auth/network-request-failed':'Network error. Check your connection.',
};

function friendlyError(err) {
  if (!err) return null;
  return FIREBASE_ERRORS[err.code] ?? (err.message || 'Something went wrong. Try again.');
}

// ── Minimal SVG icons ─────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

// ── Input component ───────────────────────────────────────────
function AuthInput({ label, type, value, onChange, placeholder, rightElement }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
          style={{
            width: '100%',
            padding: '11px 14px',
            paddingRight: rightElement ? 42 : 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.15s',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();

  const [mode,        setMode]        = useState('login'); // 'login' | 'signup'
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [name,        setName]        = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoad,  setGoogleLoad]  = useState(false);
  const [error,       setError]       = useState(null);

  // Already logged in → go straight to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const isSignup = mode === 'signup';

  function clearForm() {
    setEmail(''); setPassword(''); setName(''); setError(null);
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'signup' : 'login');
    clearForm();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await signupWithEmail(email, password, name.trim());
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoad(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(friendlyError(err));
      }
    } finally {
      setGoogleLoad(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0c14',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px 16px',
    }}>
      {/* Background gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 420,
        background: 'rgba(15,18,30,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '36px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Logo + Heading */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 12,
            marginBottom: 16,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            {/* Wind / AQI icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
            </svg>
          </div>
          <h1 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>
            AirHealth
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            {isSignup ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          disabled={loading || googleLoad}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '11px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 14,
            fontWeight: 600,
            cursor: loading || googleLoad ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
            marginBottom: 20,
            fontFamily: 'inherit',
            opacity: loading || googleLoad ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!loading && !googleLoad) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          {googleLoad ? (
            <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <GoogleIcon />
          )}
          {googleLoad ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Name field (signup only) */}
          {isSignup && (
            <AuthInput
              label="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
            />
          )}

          <AuthInput
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <AuthInput
            label="Password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={isSignup ? 'Minimum 6 characters' : '••••••••'}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0 }}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPwd} />
              </button>
            }
          />

          {/* Error message */}
          {error && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              color: '#fca5a5',
              fontSize: 13,
              marginBottom: 16,
              lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoad || !email || !password}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || googleLoad || !email || !password ? 'not-allowed' : 'pointer',
              opacity: loading || googleLoad || !email || !password ? 0.65 : 1,
              transition: 'opacity 0.15s, transform 0.1s',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={e => { if (!loading && !googleLoad) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading && (
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            )}
            {loading ? 'Please wait…' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b', margin: '20px 0 0' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}
