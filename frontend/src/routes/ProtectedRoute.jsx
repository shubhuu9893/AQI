/**
 * routes/ProtectedRoute.jsx
 *
 * Wraps any route that requires authentication.
 * While Firebase resolves the auth state (loading=true),
 * shows a full-screen spinner.
 * If the user is not logged in, redirects to /login.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-base, #0a0c14)',
      }}>
        <div style={{ textAlign: 'center' }}>
          {/* Spinner */}
          <div style={{
            width: 40, height: 40,
            border: '3px solid rgba(99,102,241,0.25)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ color: '#64748b', fontSize: 14 }}>Checking session…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
