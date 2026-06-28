import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './features/admin/Dashboard';
import { OBSOverlay } from './features/overlay/OBSOverlay';
import { StreamDeck } from './features/streamdeck/StreamDeck';
import { startTimerEngine, startChatDrip, startMusicEngine, useOverlayStore } from './store/overlayStore';
import { supabase } from './lib/supabase';
import { fetchProjectData, getSessionUserId } from './lib/dbSync';

// Start global engines once on app boot
startTimerEngine();
startChatDrip();
startMusicEngine();

function App() {
  const projectId = useOverlayStore(s => s.projectId);
  const loading = useOverlayStore(s => s.loading);
  const initializeDbSession = useOverlayStore(s => s.initializeDbSession);
  const loadFromBroadcast = useOverlayStore(s => s.loadFromBroadcast);
  const checkSchedule = useOverlayStore(s => s.checkSchedule);

  // Initialize DB on boot
  useEffect(() => {
    initializeDbSession();
  }, [initializeDbSession]);

  // Realtime Supabase Subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-sync:${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: `project_id=eq.${projectId}` },
        (payload) => {
          const newSettings = payload.new as any;
          if (!newSettings) return;
          useOverlayStore.setState({
            theme: newSettings.theme,
            currentScene: newSettings.current_scene,
            settings: {
              ...useOverlayStore.getState().settings,
              streamTitle: newSettings.stream_title,
              streamerName: newSettings.streamer_name,
              activeGame: newSettings.active_game,
              tickerText: newSettings.ticker_text || '',
              borderRadius: newSettings.border_radius,
              animationSpeed: newSettings.animation_speed,
              overlayOpacity: newSettings.overlay_opacity,
              particleDensity: newSettings.particle_density,
              tickerSpeed: newSettings.ticker_speed,
              disableAnimations: newSettings.socials?.disableAnimations || false,
              activeAnimationPack: newSettings.socials?.activeAnimationPack || 'float',
              socials: {
                twitch: newSettings.socials?.twitch || '',
                twitter: newSettings.socials?.twitter || '',
                youtube: newSettings.socials?.youtube || '',
                discord: newSettings.socials?.discord || '',
              }
            }
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `project_id=eq.${projectId}` },
        (payload) => {
          const newGoal = payload.new as any;
          if (!newGoal) return;
          const type = newGoal.goal_type;
          if (type === 'sub') {
            useOverlayStore.setState({ subGoal: { current: newGoal.current_value, target: newGoal.target_value } });
          } else if (type === 'donation') {
            useOverlayStore.setState({ donationGoal: { current: newGoal.current_value, target: newGoal.target_value } });
          } else if (type === 'follower') {
            useOverlayStore.setState({ followerGoal: { current: newGoal.current_value, target: newGoal.target_value } });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scene_widgets' },
        async () => {
          const userId = await getSessionUserId();
          const data = await fetchProjectData(userId);
          if (data) {
            useOverlayStore.setState({ sceneWidgets: data.sceneWidgets });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'widgets' },
        async () => {
          const userId = await getSessionUserId();
          const data = await fetchProjectData(userId);
          if (data) {
            useOverlayStore.setState({ sceneWidgets: data.sceneWidgets });
          }
        }
      )
      .on('broadcast', { event: 'state-sync' }, ({ payload }) => {
        loadFromBroadcast(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, loadFromBroadcast]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050F] flex flex-col items-center justify-center font-sans text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-purple-900/20 to-transparent pointer-events-none" />
        <div className="z-10 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase">
            VibeOverlay Studio
          </h2>
          <p className="text-gray-400 text-sm animate-pulse">Initializing Supabase Realtime Engine...</p>
        </div>
      </div>
    );
  }

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
