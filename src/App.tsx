import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditorPage } from './pages/EditorPage';
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

// ─── App Shell with Session ────────────────────────────────────────────────────
const AppShell: React.FC = () => {
  const { isLoading, initSession } = useSessionStore();
  const { subscribeToRealtime, theme } = useLiveStore();
  const location = useLocation();

  // Initialize session on boot
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Subscribe to Supabase realtime after session is ready
  useEffect(() => {
    const unsubscribe = subscribeToRealtime();
    return unsubscribe;
  }, [subscribeToRealtime]);

  // OBS route is fullscreen, no sidebar
  if (location.pathname === '/obs') {
    if (isLoading) return <div style={{ background: '#000', width: '100vw', height: '100vh' }} />;
    return <OBSOverlay />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`app-shell theme-${theme}`} style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="main-content" style={{ flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/editor" element={<EditorPage />} />
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
        {/* All routes go through AppShell to ensure session & realtime sync are active */}
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

