import { create } from 'zustand';

// ==========================================================================
// TYPES
// ==========================================================================

export type SceneType = 'starting-soon' | 'main-stream' | 'chat-session' | 'brb' | 'ending-stream';
export type ThemeType =
  | 'cyber-synth' | 'galaxy-violet' | 'anime-bedroom' | 'lo-fi-cafe'
  | 'sakura-night' | 'neon-tokyo' | 'dark-amethyst' | 'cosmic-nebula'
  | 'vaporwave' | 'minimal-purple';

export type AlertType = 'follow' | 'subscribe' | 'donation' | 'raid' | 'host';

export interface Alert {
  id: string;
  type: AlertType;
  username: string;
  message?: string;
  amount?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  color?: string;
  badge?: 'sub' | 'mod' | 'vip';
  platform?: 'twitch' | 'youtube' | 'kick';
  timestamp: number;
}

export interface Widget {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isLocked: boolean;
  isHidden: boolean;
  customData?: Record<string, any>;
}

export interface StreamEvent {
  id: string;
  type: AlertType;
  username: string;
  detail?: string;
  timestamp: number;
}

export interface OverlaySettings {
  streamTitle: string;
  streamerName: string;
  activeGame: string;
  tickerText: string;
  socials: {
    twitch: string;
    twitter: string;
    youtube: string;
    discord: string;
  };
  avatarPosition: 'bottom-left' | 'bottom-right' | 'top-right';
  chatSize: 'small' | 'medium' | 'large';
  borderRadius: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  overlayOpacity: number;
  particleDensity: 'off' | 'low' | 'medium' | 'high';
  tickerSpeed: 'slow' | 'normal' | 'fast';
}

export interface OverlayTimer {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface MusicState {
  title: string;
  artist: string;
  albumArt: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

export interface GoalState {
  current: number;
  target: number;
}

export interface OverlayState {
  // Scene
  currentScene: SceneType;
  theme: ThemeType;

  // Timer
  timer: OverlayTimer;

  // Chat
  chatMessages: ChatMessage[];
  showChat: boolean;

  // Avatar
  showAvatar: boolean;

  // Ticker
  showTicker: boolean;

  // Music
  music: MusicState;

  // Events
  latestFollower: string;
  latestSubscriber: string;
  latestDonation: { user: string; amount: string } | null;
  recentEvents: StreamEvent[];

  // Viewer Count
  viewerCount: number;

  // Goals
  subGoal: GoalState;
  donationGoal: GoalState;
  followerGoal: GoalState;

  // Alerts
  alertQueue: Alert[];
  activeAlert: Alert | null;
  alertHistory: Alert[];

  // Settings
  settings: OverlaySettings;

  // AI messages
  aiMessages: Array<{ id: string; sender: 'user' | 'assistant'; text: string }>;

  // Scheduler
  schedule: Array<{
    id: string;
    time: string;
    scene: SceneType;
    label: string;
    isActive: boolean;
  }>;

  // Layout widgets for drag-and-drop editor
  sceneWidgets: Record<SceneType, Widget[]>;
  selectedWidgetId: string | null;
  historyStack: Record<SceneType, Widget[][]>;
  historyIndex: Record<SceneType, number>;

  // Actions
  setScene: (scene: SceneType) => void;
  setTheme: (theme: ThemeType) => void;

  // Timer actions
  addTime: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: (seconds?: number) => void;
  tickTimer: () => void;

  // Chat actions
  addChatMessage: (username: string, text: string, badge?: ChatMessage['badge'], platform?: ChatMessage['platform']) => void;
  clearChat: () => void;
  setShowChat: (show: boolean) => void;

  // Avatar
  setShowAvatar: (show: boolean) => void;

  // Ticker
  setShowTicker: (show: boolean) => void;

  // Alert actions
  triggerAlert: (type: AlertType, username: string, message?: string, amount?: string) => void;
  dismissAlert: () => void;

  // Goal actions
  updateGoal: (type: 'sub' | 'donation' | 'follower', field: 'current' | 'target', value: number) => void;

  // Settings
  updateSettings: (partial: Partial<OverlaySettings>) => void;

  // AI command
  executeAICommand: (prompt: string) => void;

  // Scheduler
  addScheduleEvent: (time: string, scene: SceneType, label: string) => void;
  removeScheduleEvent: (id: string) => void;
  checkSchedule: (currentTime: string) => void;

  // Realtime sync
  broadcastState: (slice: Partial<OverlayState>) => void;
  loadFromBroadcast: (data: Partial<OverlayState>) => void;

  // Widget placement actions
  updateWidget: (widgetId: string, fields: Partial<Widget>) => void;
  addWidget: (type: string) => void;
  removeWidget: (widgetId: string) => void;
  duplicateWidget: (widgetId: string) => void;
  selectWidget: (widgetId: string | null) => void;

  // History stack actions
  pushHistoryState: () => void;
  undo: () => void;
  redo: () => void;
}

// ==========================================================================
// MOCK CHAT DATA
// ==========================================================================
const MOCK_USERS = ['Voidwalker3', 'Kitsune_', 'SleepyNeko', 'PixelGamer88', 'MikoLive', 'ZenLofi', 'CyberRider99', 'ArcadeElara'];
const MOCK_MSGS = [
  'Yoooo lets go!! 🔥', 'This overlay is insane 💜', 'Nice stream!', 'Hydrate streamer!!',
  'Hype hype hype!!!', 'Lurking from work 👀', 'LFG!!', 'This music goes hard',
  'W stream as always', 'GG no re', 'peepoHappy', 'Hollow Knight path of pain is real',
  'omg that was clean', 'o7 just passing through', 'vibing to the beats 🎵'
];
const MOCK_COLORS = ['#FF4DFF', '#5CFFE2', '#A855F7', '#FB923C', '#34D399', '#60A5FA', '#F472B6'];

const makeMockMessage = (): ChatMessage => ({
  id: `chat-${Date.now()}-${Math.random()}`,
  username: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
  text: MOCK_MSGS[Math.floor(Math.random() * MOCK_MSGS.length)],
  color: MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)],
  badge: Math.random() < 0.3 ? 'sub' : Math.random() < 0.1 ? 'mod' : undefined,
  platform: 'twitch',
  timestamp: Date.now(),
});

// ==========================================================================
// INITIAL CHAT MESSAGES
// ==========================================================================
const INITIAL_CHAT: ChatMessage[] = Array.from({ length: 6 }, makeMockMessage);

// ==========================================================================
// BROADCAST TO LOCALSTORAGE (cross-tab sync, Supabase-ready hook)
// ==========================================================================
const broadcast = (slice: Record<string, unknown>) => {
  try {
    localStorage.setItem('vibe_overlay_sync', JSON.stringify({ ...slice, _ts: Date.now() }));
  } catch { /* ignore */ }
};

// ==========================================================================
// DEFAULT SCHEDULE
// ==========================================================================
const DEFAULT_SCHEDULE = [
  { id: 'sch-1', time: '19:50', scene: 'starting-soon' as SceneType, label: 'Pre-stream countdown', isActive: true },
  { id: 'sch-2', time: '20:00', scene: 'chat-session' as SceneType, label: 'Intro & Just Chatting', isActive: true },
  { id: 'sch-3', time: '20:30', scene: 'main-stream' as SceneType, label: 'Gaming Session', isActive: true },
  { id: 'sch-4', time: '22:00', scene: 'brb' as SceneType, label: 'Hydration Break', isActive: true },
  { id: 'sch-5', time: '22:05', scene: 'main-stream' as SceneType, label: 'Game Session Pt.2', isActive: true },
  { id: 'sch-6', time: '23:30', scene: 'ending-stream' as SceneType, label: 'Outro & Raid', isActive: true },
];

// ==========================================================================
// DEFAULT WIDGETS LAYOUT PRESETS
// ==========================================================================
const DEFAULT_WIDGETS: Record<SceneType, Widget[]> = {
  'starting-soon': [
    { id: 'timer-soon', type: 'timer', label: 'Countdown Timer', x: 25, y: 30, w: 50, h: 25, isLocked: false, isHidden: false },
    { id: 'music-soon', type: 'music', label: 'Now Playing Widget', x: 32, y: 65, w: 36, h: 14, isLocked: false, isHidden: false },
    { id: 'event-soon', type: 'event-list', label: 'Recent Events Log', x: 10, y: 12, w: 80, h: 10, isLocked: true, isHidden: false }
  ],
  'main-stream': [
    { id: 'game-main', type: 'game', label: 'Primary Game Stream', x: 2, y: 2, w: 76, h: 86, isLocked: true, isHidden: false },
    { id: 'vtuber-main', type: 'vtuber', label: 'VTuber Model Corner', x: 80, y: 55, w: 18, h: 32, isLocked: false, isHidden: false },
    { id: 'chat-main', type: 'chat', label: 'Chat Overlay', x: 80, y: 2, w: 18, h: 50, isLocked: false, isHidden: false },
    { id: 'sub-main', type: 'sub-goal', label: 'Subscriber Progress Bar', x: 2, y: 91, w: 30, h: 6, isLocked: false, isHidden: false },
    { id: 'dono-main', type: 'dono-goal', label: 'Donation Progress Bar', x: 35, y: 91, w: 30, h: 6, isLocked: false, isHidden: false },
    { id: 'alerts-main', type: 'alerts', label: 'Alert Notification Box', x: 25, y: 15, w: 50, h: 20, isLocked: true, isHidden: true }
  ],
  'chat-session': [
    { id: 'vtuber-chatting', type: 'vtuber', label: 'Large VTuber Avatar Frame', x: 5, y: 10, w: 38, h: 76, isLocked: false, isHidden: false },
    { id: 'chat-chatting', type: 'chat', label: 'Live Scrolling Chat Box', x: 48, y: 20, w: 48, h: 52, isLocked: false, isHidden: false },
    { id: 'music-chatting', type: 'music', label: 'Now Playing Widget', x: 48, y: 76, w: 22, h: 12, isLocked: false, isHidden: false },
    { id: 'sub-chatting', type: 'sub-goal', label: 'Sub Goal Progress Bar', x: 74, y: 76, w: 22, h: 12, isLocked: false, isHidden: false },
    { id: 'event-chatting', type: 'event-list', label: 'Recent Events Log', x: 5, y: 2, w: 90, h: 6, isLocked: true, isHidden: false }
  ],
  'brb': [
    { id: 'vtuber-brb', type: 'vtuber', label: 'Resting Avatar', x: 40, y: 25, w: 20, h: 30, isLocked: false, isHidden: false },
    { id: 'timer-brb', type: 'timer', label: 'Return Clock', x: 30, y: 60, w: 40, h: 12, isLocked: false, isHidden: false },
    { id: 'chat-brb', type: 'chat', label: 'Mini Chat', x: 75, y: 10, w: 20, h: 75, isLocked: false, isHidden: false }
  ],
  'ending-stream': [
    { id: 'timer-ending', type: 'timer', label: 'Goodbye Messages', x: 25, y: 35, w: 50, h: 20, isLocked: false, isHidden: false },
    { id: 'socials-ending', type: 'socials', label: 'Social Handles Card', x: 30, y: 60, w: 40, h: 20, isLocked: false, isHidden: false }
  ]
};

// ==========================================================================
// STORE
// ==========================================================================
export const useOverlayStore = create<OverlayState>((set, get) => ({
  currentScene: 'starting-soon',
  theme: 'cyber-synth',

  timer: { seconds: 600, isRunning: true, isPaused: false },

  chatMessages: INITIAL_CHAT,
  showChat: true,

  showAvatar: true,
  showTicker: true,

  music: {
    title: 'After Dark',
    artist: 'Mr. Kitty',
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=60',
    isPlaying: true,
    progress: 42,
    duration: 224,
  },

  latestFollower: 'Yukari_Chan',
  latestSubscriber: 'GamerDave',
  latestDonation: { user: 'Aria', amount: '$20.00' },
  recentEvents: [],
  viewerCount: 142,

  subGoal: { current: 145, target: 200 },
  donationGoal: { current: 210, target: 500 },
  followerGoal: { current: 1700, target: 2000 },

  alertQueue: [],
  activeAlert: null,
  alertHistory: [],

  settings: {
    streamTitle: 'Indie Game Night: Hollow Knight Hollows!',
    streamerName: 'Rave_VT',
    activeGame: 'Hollow Knight',
    tickerText: '✨ Welcome to the stream! Keep chat positive. ✨ !discord to join the community! ✨ Subs unlock exclusive emotes & badges! ✨ Schedule: Mon/Wed/Fri 8PM EST.',
    socials: {
      twitch: '/rave_vtuber',
      twitter: '@RaveVT',
      youtube: 'RaveVT',
      discord: 'rave.gg/discord',
    },
    avatarPosition: 'bottom-right',
    chatSize: 'medium',
    borderRadius: 8,
    animationSpeed: 'normal',
    overlayOpacity: 85,
    particleDensity: 'medium',
    tickerSpeed: 'normal',
  },

  aiMessages: [
    {
      id: 'ai-0',
      sender: 'assistant',
      text: '👋 VIBE_AI online. Try: "Switch to BRB", "Add 5 minutes", "Hide chat", "Show avatar", "Switch to gameplay", "Reset timer".'
    }
  ],

  schedule: DEFAULT_SCHEDULE,

  // Layout editor initial states
  sceneWidgets: DEFAULT_WIDGETS,
  selectedWidgetId: null,
  historyStack: {
    'starting-soon': [[...DEFAULT_WIDGETS['starting-soon']]],
    'main-stream': [[...DEFAULT_WIDGETS['main-stream']]],
    'chat-session': [[...DEFAULT_WIDGETS['chat-session']]],
    'brb': [[...DEFAULT_WIDGETS['brb']]],
    'ending-stream': [[...DEFAULT_WIDGETS['ending-stream']]]
  },
  historyIndex: {
    'starting-soon': 0,
    'main-stream': 0,
    'chat-session': 0,
    'brb': 0,
    'ending-stream': 0
  },

  // ─── Scene & Theme ───────────────────────────────────────────────────────
  setScene: (scene) => {
    const prevScene = get().currentScene;
    
    // Timer Persistence behavior:
    let updatedTimer = { ...get().timer };
    if (prevScene === 'starting-soon' && scene !== 'starting-soon') {
      // Leaving Starting Soon -> pause timer, preserve remaining time
      updatedTimer = { ...updatedTimer, isRunning: false, isPaused: true };
    } else if (prevScene !== 'starting-soon' && scene === 'starting-soon') {
      // Returning to Starting Soon -> resume from previous value
      if (updatedTimer.seconds > 0) {
        updatedTimer = { ...updatedTimer, isRunning: true, isPaused: false };
      }
    }
    
    set({ currentScene: scene, timer: updatedTimer });
    broadcast({ currentScene: scene, timer: updatedTimer });
  },

  setTheme: (theme) => {
    set({ theme });
    broadcast({ theme });
  },

  // ─── Timer ───────────────────────────────────────────────────────────────
  addTime: (seconds) => {
    set(s => ({ timer: { ...s.timer, seconds: s.timer.seconds + seconds } }));
    broadcast({ timer: get().timer });
  },

  pauseTimer: () => {
    set(s => ({ timer: { ...s.timer, isRunning: false, isPaused: true } }));
    broadcast({ timer: get().timer });
  },

  resumeTimer: () => {
    set(s => ({ timer: { ...s.timer, isRunning: true, isPaused: false } }));
    broadcast({ timer: get().timer });
  },

  resetTimer: (seconds = 600) => {
    set({ timer: { seconds, isRunning: true, isPaused: false } });
    broadcast({ timer: get().timer });
  },

  tickTimer: () => {
    const { timer } = get();
    if (!timer.isRunning || timer.isPaused || timer.seconds <= 0) return;
    set(s => ({ timer: { ...s.timer, seconds: Math.max(0, s.timer.seconds - 1) } }));
  },

  // ─── Chat ─────────────────────────────────────────────────────────────────
  addChatMessage: (username, text, badge, platform) => {
    const msg: ChatMessage = {
      id: `chat-${Date.now()}`,
      username,
      text,
      badge,
      platform: platform ?? 'twitch',
      color: MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)],
      timestamp: Date.now(),
    };
    set(s => ({ chatMessages: [...s.chatMessages.slice(-30), msg] }));
    broadcast({ chatMessages: get().chatMessages });
  },

  clearChat: () => { set({ chatMessages: [] }); },

  setShowChat: (show) => {
    set({ showChat: show });
    broadcast({ showChat: show });
  },

  // ─── Avatar & Ticker ──────────────────────────────────────────────────────
  setShowAvatar: (show) => {
    set({ showAvatar: show });
    broadcast({ showAvatar: show });
  },

  setShowTicker: (show) => {
    set({ showTicker: show });
    broadcast({ showTicker: show });
  },

  // ─── Alerts ───────────────────────────────────────────────────────────────
  triggerAlert: (type, username, message, amount) => {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      type, username, message, amount,
      timestamp: Date.now(),
    };
    set(s => {
      const updatedHistory = [alert, ...s.alertHistory].slice(0, 50);
      // Update latest events
      const newEvents: StreamEvent[] = [
        { id: alert.id, type, username, detail: amount || message, timestamp: Date.now() },
        ...s.recentEvents
      ].slice(0, 20);

      const updates: Partial<OverlayState> = {
        alertHistory: updatedHistory,
        recentEvents: newEvents,
      };
      if (!s.activeAlert) {
        updates.activeAlert = alert;
        updates.alertQueue = [...s.alertQueue];
      } else {
        updates.alertQueue = [...s.alertQueue, alert];
      }

      // Update latest trackers
      if (type === 'follow') {
        updates.latestFollower = username;
        updates.followerGoal = { ...s.followerGoal, current: s.followerGoal.current + 1 };
      } else if (type === 'subscribe') {
        updates.latestSubscriber = username;
        updates.subGoal = { ...s.subGoal, current: s.subGoal.current + 1 };
      } else if (type === 'donation' && amount) {
        updates.latestDonation = { user: username, amount };
        const parsed = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
        updates.donationGoal = { ...s.donationGoal, current: Math.round(s.donationGoal.current + parsed) };
      }

      return updates as Partial<OverlayState>;
    });
    broadcast({ alertHistory: get().alertHistory, activeAlert: get().activeAlert });
  },

  dismissAlert: () => {
    set(s => {
      const [next, ...rest] = s.alertQueue;
      return { activeAlert: next ?? null, alertQueue: rest };
    });
  },

  // ─── Goals ────────────────────────────────────────────────────────────────
  updateGoal: (type, field, value) => {
    if (type === 'sub') {
      set(s => ({ subGoal: { ...s.subGoal, [field]: value } }));
    } else if (type === 'donation') {
      set(s => ({ donationGoal: { ...s.donationGoal, [field]: value } }));
    } else {
      set(s => ({ followerGoal: { ...s.followerGoal, [field]: value } }));
    }
    broadcast({ subGoal: get().subGoal, donationGoal: get().donationGoal, followerGoal: get().followerGoal });
  },

  // ─── Settings ─────────────────────────────────────────────────────────────
  updateSettings: (partial) => {
    set(s => ({ settings: { ...s.settings, ...partial } }));
    broadcast({ settings: get().settings });
  },

  // ─── AI Companion ─────────────────────────────────────────────────────────
  executeAICommand: (prompt) => {
    const p = prompt.toLowerCase().trim();
    let response = "I didn't understand that. Try: 'switch to BRB', 'add 5 minutes', 'hide chat', 'show avatar'.";

    // Scene switching
    if (p.includes('starting') || p.includes('soon') || p.includes('countdown')) {
      get().setScene('starting-soon');
      response = '⌛ Switching to Starting Soon scene.';
    } else if (p.includes('brb') || p.includes('break') || p.includes('right back')) {
      get().setScene('brb');
      response = '☕ Switching to BRB scene.';
    } else if (p.includes('chat') && (p.includes('session') || p.includes('chatting') || p.includes('just'))) {
      get().setScene('chat-session');
      response = '💬 Switching to Chat Session scene.';
    } else if (p.includes('game') || p.includes('main') || p.includes('stream') || p.includes('play')) {
      get().setScene('main-stream');
      response = '🎮 Switching to Main Stream / Gameplay scene.';
    } else if (p.includes('ending') || p.includes('outro') || p.includes('goodbye')) {
      get().setScene('ending-stream');
      response = '👋 Switching to Ending Stream scene.';
    }

    // Timer controls
    else if (p.includes('add') && p.includes('1') && p.includes('min')) {
      get().addTime(60);
      response = '⏱️ Added 1 minute to timer.';
    } else if (p.includes('add') && p.includes('5') && (p.includes('min') || p.includes('minute'))) {
      get().addTime(300);
      response = '⏱️ Added 5 minutes to timer.';
    } else if (p.includes('add') && p.includes('10') && p.includes('min')) {
      get().addTime(600);
      response = '⏱️ Added 10 minutes to timer.';
    } else if (p.includes('pause') && p.includes('timer')) {
      get().pauseTimer();
      response = '⏸️ Timer paused.';
    } else if (p.includes('resume') && p.includes('timer')) {
      get().resumeTimer();
      response = '▶️ Timer resumed.';
    } else if (p.includes('reset') && p.includes('timer')) {
      get().resetTimer();
      response = '🔄 Timer reset to 10:00.';
    }

    // Visibility toggles
    else if (p.includes('hide') && p.includes('chat')) {
      get().setShowChat(false);
      response = '🙈 Chat hidden on overlay.';
    } else if (p.includes('show') && p.includes('chat')) {
      get().setShowChat(true);
      response = '💬 Chat now visible on overlay.';
    } else if (p.includes('hide') && p.includes('avatar')) {
      get().setShowAvatar(false);
      response = '🙈 Avatar hidden on overlay.';
    } else if (p.includes('show') && p.includes('avatar')) {
      get().setShowAvatar(true);
      response = '😊 Avatar now visible on overlay.';
    } else if (p.includes('hide') && p.includes('ticker')) {
      get().setShowTicker(false);
      response = '🔇 Ticker hidden.';
    } else if (p.includes('show') && p.includes('ticker')) {
      get().setShowTicker(true);
      response = '📢 Ticker now visible.';
    }

    // Viewer count
    else if ((p.includes('set') || p.includes('update')) && p.includes('viewer')) {
      const match = p.match(/\d+/);
      if (match) {
        set({ viewerCount: parseInt(match[0]) });
        response = `👥 Viewer count set to ${match[0]}.`;
      }
    }

    const userMsg = { id: `u-${Date.now()}`, sender: 'user' as const, text: prompt };
    const aiMsg = { id: `a-${Date.now()}`, sender: 'assistant' as const, text: response };
    set(s => ({ aiMessages: [...s.aiMessages.slice(-30), userMsg, aiMsg] }));
  },

  // ─── Scheduler ────────────────────────────────────────────────────────────
  addScheduleEvent: (time, scene, label) => {
    const event = { id: `sch-${Date.now()}`, time, scene, label, isActive: true };
    set(s => ({
      schedule: [...s.schedule, event].sort((a, b) => a.time.localeCompare(b.time))
    }));
  },

  removeScheduleEvent: (id) => {
    set(s => ({ schedule: s.schedule.filter(e => e.id !== id) }));
  },

  checkSchedule: (currentTime) => {
    const match = get().schedule.find(e => e.isActive && e.time === currentTime);
    if (match && get().currentScene !== match.scene) {
      get().setScene(match.scene);
    }
  },

  // ─── Realtime ─────────────────────────────────────────────────────────────
  broadcastState: (slice) => {
    broadcast(slice as Record<string, unknown>);
  },

  loadFromBroadcast: (data) => {
    set(s => ({ ...s, ...data }));
  },

  // ─── Widget Placement Actions ─────────────────────────────────────────────
  updateWidget: (widgetId, fields) => {
    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene];
    const updatedWidgets = currentWidgets.map(w => 
      w.id === widgetId ? { ...w, ...fields } : w
    );

    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: updatedWidgets
      }
    }));

    broadcast({ sceneWidgets: get().sceneWidgets });
  },

  addWidget: (type) => {
    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene];
    const newId = `${type}-${Date.now()}`;
    const newWidget: Widget = {
      id: newId,
      type,
      label: `New ${type.toUpperCase()} widget`,
      x: 35,
      y: 35,
      w: 20,
      h: 15,
      isLocked: false,
      isHidden: false
    };

    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: [...currentWidgets, newWidget]
      },
      selectedWidgetId: newId
    }));

    get().pushHistoryState();
    broadcast({ sceneWidgets: get().sceneWidgets });
  },

  removeWidget: (widgetId) => {
    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene];
    
    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: currentWidgets.filter(w => w.id !== widgetId)
      },
      selectedWidgetId: state.selectedWidgetId === widgetId ? null : state.selectedWidgetId
    }));

    get().pushHistoryState();
    broadcast({ sceneWidgets: get().sceneWidgets });
  },

  duplicateWidget: (widgetId) => {
    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene];
    const target = currentWidgets.find(w => w.id === widgetId);
    if (!target) return;

    const dupId = `${target.type}-${Date.now()}`;
    const duplicate: Widget = {
      ...target,
      id: dupId,
      label: `${target.label} (Copy)`,
      x: Math.min(target.x + 4, 80),
      y: Math.min(target.y + 4, 80),
      isLocked: false
    };

    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: [...currentWidgets, duplicate]
      },
      selectedWidgetId: dupId
    }));

    get().pushHistoryState();
    broadcast({ sceneWidgets: get().sceneWidgets });
  },

  selectWidget: (widgetId) => {
    set({ selectedWidgetId: widgetId });
  },

  // ─── Drag & Drop Editor History Stack ─────────────────────────────────────
  pushHistoryState: () => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const stack = get().historyStack[scene] || [];
    const index = get().historyIndex[scene] ?? -1;

    // Prune standard futures if we made modifications on a historical node
    const activeStack = stack.slice(0, index + 1);
    
    set(state => ({
      historyStack: {
        ...state.historyStack,
        [scene]: [...activeStack, JSON.parse(JSON.stringify(widgets))]
      },
      historyIndex: {
        ...state.historyIndex,
        [scene]: index + 1
      }
    }));
  },

  undo: () => {
    const scene = get().currentScene;
    const stack = get().historyStack[scene];
    const index = get().historyIndex[scene];

    if (index > 0) {
      const prevWidgets = stack[index - 1];
      set(state => ({
        sceneWidgets: {
          ...state.sceneWidgets,
          [scene]: JSON.parse(JSON.stringify(prevWidgets))
        },
        historyIndex: {
          ...state.historyIndex,
          [scene]: index - 1
        }
      }));
      broadcast({ sceneWidgets: get().sceneWidgets });
    }
  },

  redo: () => {
    const scene = get().currentScene;
    const stack = get().historyStack[scene];
    const index = get().historyIndex[scene];

    if (index < stack.length - 1) {
      const nextWidgets = stack[index + 1];
      set(state => ({
        sceneWidgets: {
          ...state.sceneWidgets,
          [scene]: JSON.parse(JSON.stringify(nextWidgets))
        },
        historyIndex: {
          ...state.historyIndex,
          [scene]: index + 1
        }
      }));
      broadcast({ sceneWidgets: get().sceneWidgets });
    }
  },
}));

// ==========================================================================
// TIMER TICK ENGINE — runs globally outside components
// ==========================================================================
let timerInterval: ReturnType<typeof setInterval> | null = null;

export const startTimerEngine = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    useOverlayStore.getState().tickTimer();
  }, 1000);
};

export const stopTimerEngine = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// ==========================================================================
// CHAT DRIP ENGINE — auto-feeds mock messages every ~4s
// ==========================================================================
let chatDripInterval: ReturnType<typeof setInterval> | null = null;

export const startChatDrip = () => {
  if (chatDripInterval) return;
  // Initial delay 3s then every 4-7s
  const drip = () => {
    const msg = makeMockMessage();
    useOverlayStore.setState(s => ({
      chatMessages: [...s.chatMessages.slice(-30), msg]
    }));
    chatDripInterval = setTimeout(drip, 3500 + Math.random() * 3500) as unknown as ReturnType<typeof setInterval>;
  };
  chatDripInterval = setTimeout(drip, 3000) as unknown as ReturnType<typeof setInterval>;
};

export const stopChatDrip = () => {
  if (chatDripInterval) {
    clearTimeout(chatDripInterval as unknown as ReturnType<typeof setTimeout>);
    chatDripInterval = null;
  }
};

// ==========================================================================
// MUSIC PROGRESS ENGINE — advances music progress bar
// ==========================================================================
let musicInterval: ReturnType<typeof setInterval> | null = null;

export const startMusicEngine = () => {
  if (musicInterval) return;
  musicInterval = setInterval(() => {
    useOverlayStore.setState(s => {
      const { music } = s;
      if (!music.isPlaying) return s;
      const next = music.progress >= music.duration ? 0 : music.progress + 1;
      return { music: { ...music, progress: next } };
    });
  }, 1000);
};
