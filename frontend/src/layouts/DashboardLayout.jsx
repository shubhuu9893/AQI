import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useResponsive } from '../hooks/useResponsive';

export default function DashboardLayout() {
  const routerLocation = useLocation();
  const { isMobile, isTablet } = useResponsive();

  // Sidebar collapsed state persisted
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Close mobile drawer when resizing to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  }, []);

  // On tablet always use collapsed
  const sidebarCollapsed = isTablet ? true : collapsed;

  // Compute margin-left for main content
  const sidebarWidth = isMobile
    ? 0
    : sidebarCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-width)';

  return (
    <div
      className="app-wrapper"
      style={{ '--current-sidebar': sidebarWidth }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className="main-content"
        style={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          transition: 'margin-left var(--transition-slow)',
        }}
      >
        <Navbar
          onMenuClick={() => setMobileOpen(v => !v)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main className={`page-content ${routerLocation.pathname === '/map' ? 'page-content-map' : ''}`}>
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
