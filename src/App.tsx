import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Layers, Image, Layout, Palette, Settings, Zap, Tv,
} from 'lucide-react';
import { EditorPage } from './pages/EditorPage';
import { AssetsPage } from './pages/AssetsPage';
import { PresetsPage } from './pages/PresetsPage';
import { ThemesPage } from './pages/ThemesPage';
import { SettingsPage } from './pages/SettingsPage';
import { OBSOverlay } from './features/overlay/OBSOverlay';
import { useSessionStore } from './store/sessionStore';
import { useLiveStore } from './store/liveStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

// ─── Loading Screen ────────────────────────────────────────────────────────────
const LoadingScreen: React.FC = () => (
  <div className="loading-screen">
    <div className="loading-logo">⚡ VibeOverlay Studio</div>
    <div className="loading-spinner" />
    <div className="loading-text">Loading your project...</div>
  </div>
);

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
interface NavItem { icon: React.ReactNode; label: string; path: string; }

const NAV_ITEMS: NavItem[] = [
  { icon: <Layers size={18} />, label: 'Editor', path: '/editor' },
  { icon: <Image size={18} />, label: 'Assets', path: '/assets' },
  { icon: <Layout size={18} />, label: 'Presets', path: '/presets' },
  { icon: <Palette size={18} />, label: 'Themes', path: '/themes' },
  { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
];

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/editor')}>
        <Zap size={20} color="white" />
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path) ||
            (item.path === '/editor' && location.pathname === '/');
          return (
            <button
              key={item.path}
              className={`sidebar-btn${active ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
              data-tooltip={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* OBS indicator at bottom */}
      <div style={{ marginTop: 'auto', paddingBottom: 8 }}>
        <button
          className="sidebar-btn"
          onClick={() => window.open('/obs', '_blank')}
          data-tooltip="Open OBS Overlay"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Tv size={18} />
          <span>OBS</span>
        </button>
      </div>
    </div>
  );
};

// ─── App Shell with Session ────────────────────────────────────────────────────
const AppShell: React.FC = () => {
  const { isLoading, initSession } = useSessionStore();
  const { subscribeToRealtime } = useLiveStore();
  const location = useLocation();

  // Initialize session on boot
  useEffect(() => {
    initSession();
  }, []);

  // Subscribe to Supabase realtime after session is ready
  useEffect(() => {
    const unsubscribe = subscribeToRealtime();
    return unsubscribe;
  }, [subscribeToRealtime]);

  // OBS route is fullscreen, no sidebar
  if (location.pathname === '/obs') {
    return <OBSOverlay />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/presets" element={<PresetsPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<EditorPage />} />
        </Routes>
      </div>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        {/* OBS overlay — no shell, no sidebar */}
        <Route path="/obs" element={<OBSOverlay />} />
        {/* All other routes — go through AppShell */}
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
