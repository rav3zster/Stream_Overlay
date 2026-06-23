import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard activeTabInitial="scenes" />} />
        <Route path="/obs" element={<OBSOverlay />} />
        <Route path="/streamdeck" element={<StreamDeck />} />
        <Route path="/scenes" element={<Dashboard activeTabInitial="scenes" />} />
        <Route path="/themes" element={<Dashboard activeTabInitial="widgets" />} />
        <Route path="/widgets" element={<Dashboard activeTabInitial="widgets" />} />
        <Route path="/goals" element={<Dashboard activeTabInitial="goals" />} />
        <Route path="/assets" element={<Dashboard activeTabInitial="assets" />} />
        <Route path="/settings" element={<Dashboard activeTabInitial="settings" />} />
        <Route path="/shop" element={<Dashboard activeTabInitial="marketplace" />} />
        <Route path="/links" element={<Dashboard activeTabInitial="integrations" />} />
        <Route path="/scheduler" element={<Dashboard activeTabInitial="scheduler" />} />
        <Route path="/marketplace" element={<Dashboard activeTabInitial="marketplace" />} />
        <Route path="/integrations" element={<Dashboard activeTabInitial="integrations" />} />
        <Route path="*" element={<Dashboard activeTabInitial="scenes" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
