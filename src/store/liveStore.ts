import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeType =
  | 'cyber-synth' | 'cyberpunk-neon' | 'synthwave' | 'retro-crt'
  | 'lo-fi-cafe' | 'lo-fi-bedroom' | 'anime-room' | 'anime-sakura'
  | 'minimal-dark' | 'minimal-white' | 'modern-white' | 'corporate-tech' | 'modern-clean'
  | 'glassmorphism' | 'neumorphism' | 'luxury-gold' | 'tokyo-night'
  | 'halloween' | 'christmas' | 'snow-season'
  | 'mclaren' | 'porsche-gulf' | 'ferrari' | 'mercedes-amg' | 'red-bull'
  | 'pure-transparent' | 'pure-black' | 'pure-white'
  | 'pastel-planets' | 'cyber-hud' | 'esports-blue'
  // Legacy themes matching themes.ts
  | 'neon-tokyo' | 'vaporwave' | 'galaxy-violet' | 'anime-bedroom' | 'minimal-purple' | 'luxury' | 'snow' | 'transparent' | 'blank-dark' | 'blank-light';

export interface LiveTimer {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface LiveState {
  // What OBS is showing RIGHT NOW
  liveSceneId: string | null;
  liveSceneName: string;
  theme: ThemeType;
  timer: LiveTimer;
  projectId: string | null;

  // Actions
  setProjectId: (id: string) => void;
  setLiveScene: (sceneId: string, sceneName: string) => void;
  setTheme: (theme: ThemeType) => void;

  // The ONLY function that pushes to OBS
  syncToOBS: (sceneId: string, sceneName: string) => Promise<void>;

  // Timer controls (these affect OBS directly)
  addTime: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: (seconds?: number) => void;
  tickTimer: () => void;

  // Subscribe to realtime updates (for the OBS renderer)
  subscribeToRealtime: () => () => void;
}

// ─── Timer write guard ─────────────────────────────────────────────────────────
// Prevents Supabase echo from overwriting a just-made local change
export let _timerLocalWriteTs = 0;
export const markTimerLocalWrite = () => { _timerLocalWriteTs = Date.now(); };

// ─── DB write helpers ─────────────────────────────────────────────────────────

async function writeTimerToDb(projectId: string, timer: LiveTimer) {
  try {
    await supabase.from('settings').update({
      timer_seconds: timer.seconds,
      timer_is_running: timer.isRunning,
      timer_is_paused: timer.isPaused,
    }).eq('project_id', projectId);
  } catch { /* silently fail */ }
}

async function writeSceneToDb(projectId: string, sceneName: string, theme: ThemeType) {
  try {
    await supabase.from('settings').update({
      current_scene: sceneName,
      theme,
    }).eq('project_id', projectId);
  } catch { /* silently fail */ }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLiveStore = create<LiveState>((set, get) => ({
  liveSceneId: null,
  liveSceneName: 'starting-soon',
  theme: 'cyber-synth',
  timer: { seconds: 600, isRunning: true, isPaused: false },
  projectId: null,

  setProjectId: (id) => set({ projectId: id }),

  setLiveScene: (sceneId, sceneName) => set({ liveSceneId: sceneId, liveSceneName: sceneName }),

  setTheme: (theme) => {
    set({ theme });
    const { projectId, liveSceneName } = get();
    if (projectId) writeSceneToDb(projectId, liveSceneName, theme);
  },

  // ─── The ONLY path to push to OBS ──────────────────────────────────────────
  syncToOBS: async (sceneId, sceneName) => {
    const { projectId, theme } = get();
    set({ liveSceneId: sceneId, liveSceneName: sceneName });
    if (projectId) await writeSceneToDb(projectId, sceneName, theme);
  },

  // ─── Timer controls ─────────────────────────────────────────────────────────
  addTime: (seconds) => {
    set(s => ({ timer: { ...s.timer, seconds: s.timer.seconds + seconds } }));
    markTimerLocalWrite();
    const { projectId, timer } = get();
    if (projectId) writeTimerToDb(projectId, timer);
  },

  pauseTimer: () => {
    set(s => ({ timer: { ...s.timer, isRunning: false, isPaused: true } }));
    markTimerLocalWrite();
    const { projectId, timer } = get();
    if (projectId) writeTimerToDb(projectId, timer);
  },

  resumeTimer: () => {
    set(s => ({ timer: { ...s.timer, isRunning: true, isPaused: false } }));
    markTimerLocalWrite();
    const { projectId, timer } = get();
    if (projectId) writeTimerToDb(projectId, timer);
  },

  resetTimer: (seconds = 600) => {
    set({ timer: { seconds, isRunning: true, isPaused: false } });
    markTimerLocalWrite();
    const { projectId, timer } = get();
    if (projectId) writeTimerToDb(projectId, timer);
  },

  tickTimer: () => {
    set(s => {
      if (!s.timer.isRunning || s.timer.isPaused || s.timer.seconds <= 0) return s;
      return { timer: { ...s.timer, seconds: Math.max(0, s.timer.seconds - 1) } };
    });
  },

  // ─── Supabase realtime subscription (used by OBS renderer) ─────────────────
  subscribeToRealtime: () => {
    const { projectId } = get();
    if (!projectId) return () => {};

    const channel = supabase
      .channel(`live-sync:${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: `project_id=eq.${projectId}` },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = payload.new as any;
          if (!d) return;

          // Scene & theme always sync
          set(s => ({
            liveSceneName: d.current_scene ?? s.liveSceneName,
            theme: d.theme ?? s.theme,
          }));

          // Timer: skip if we just wrote locally (echo guard)
          const msSince = Date.now() - _timerLocalWriteTs;
          if (msSince > 3000) {
            set({
              timer: {
                seconds: d.timer_seconds ?? get().timer.seconds,
                isRunning: d.timer_is_running ?? get().timer.isRunning,
                isPaused: d.timer_is_paused ?? get().timer.isPaused,
              },
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
}));

// ─── Global timer engine ──────────────────────────────────────────────────────

let _timerInterval: ReturnType<typeof setInterval> | null = null;

export const startLiveTimerEngine = () => {
  if (_timerInterval) return;
  _timerInterval = setInterval(() => {
    useLiveStore.getState().tickTimer();
  }, 1000);
};

export const stopLiveTimerEngine = () => {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
};
