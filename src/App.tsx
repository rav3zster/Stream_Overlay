import { useEffect } from 'react';
import { Dashboard } from './features/admin/Dashboard';
import { OBSOverlay } from './features/overlay/OBSOverlay';
import { StreamDeck } from './features/streamdeck/StreamDeck';
import { startTimerEngine, startChatDrip, startMusicEngine, useOverlayStore } from './store/overlayStore';

// Start global engines once on app boot
startTimerEngine();
startChatDrip();
startMusicEngine();

function App() {
  const loadFromBroadcast = useOverlayStore(s => s.loadFromBroadcast);
  const setScene = useOverlayStore(s => s.setScene);
  const checkSchedule = useOverlayStore(s => s.checkSchedule);

  // Cross-tab sync: listen for localStorage broadcasts from admin → OBS mode
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vibe_overlay_sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          delete data._ts;
          loadFromBroadcast(data);
        } catch { /* ignore parse errors */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadFromBroadcast]);

  // Scheduler tick: check every 30 seconds
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      checkSchedule(timeStr);
    };
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [checkSchedule]);

  // Viewer count drift simulation (±5 every 15s for realism)
  useEffect(() => {
    const t = setInterval(() => {
      useOverlayStore.setState(s => ({
        viewerCount: Math.max(1, s.viewerCount + Math.floor((Math.random() - 0.4) * 11))
      }));
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const path = window.location.pathname;

  // Routing
  if (path === '/obs') {
    return <OBSOverlay />;
  }
  if (path === '/streamdeck') {
    return <StreamDeck />;
  }
  return <Dashboard />;
}

export default App;
