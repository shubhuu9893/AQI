import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { PageLoader } from '../components/common/LoadingSpinner';

// Lazy-loaded pages
const Dashboard     = lazy(() => import('../pages/Dashboard'));
const MapPage       = lazy(() => import('../pages/Map'));
const History       = lazy(() => import('../pages/History'));
const Health        = lazy(() => import('../pages/Health'));
const Comparison    = lazy(() => import('../pages/Comparison'));
const AIPage        = lazy(() => import('../pages/AI'));
const Settings      = lazy(() => import('../pages/Settings'));
const SearchPage    = lazy(() => import('../pages/Search'));
const StationDetails= lazy(() => import('../pages/StationDetails'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"        element={<Dashboard />} />
          <Route path="map"              element={<MapPage />} />
          <Route path="history"          element={<History />} />
          <Route path="health"           element={<Health />} />
          <Route path="comparison"       element={<Comparison />} />
          <Route path="ai"               element={<AIPage />} />
          <Route path="settings"         element={<Settings />} />
          <Route path="search"           element={<SearchPage />} />
          <Route path="station/:id"      element={<StationDetails />} />
          {/* Catch-all */}
          <Route path="*"                element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
