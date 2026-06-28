import { create } from 'zustand';
import { getThemeLayoutPreset } from '../lib/themes';
import {
  getSessionUserId,
  fetchProjectData,
  initializeDefaultProject,
  updateDbSettings,
  updateDbGoal,
  addDbWidget,
  deleteDbWidget,
  updateDbWidgetPlacementBatch,
  addDbScheduleEvent,
  deleteDbScheduleEvent,
  replaceDbSceneWidgets
} from '../lib/dbSync';


// ==========================================================================
// TYPES
// ==========================================================================

export type SceneType = 'starting-soon' | 'main-stream' | 'chat-session' | 'brb' | 'ending-stream';
export type ThemeType =
  | 'cyber-synth' | 'galaxy-violet' | 'anime-bedroom' | 'lo-fi-cafe'
  | 'sakura-night' | 'neon-tokyo' | 'dark-amethyst' | 'cosmic-nebula'
  | 'vaporwave' | 'minimal-purple'
  | 'minimal-white' | 'minimal-dark' | 'flat-ui' | 'glassmorphism' | 'neumorphism' | 'retro-crt'
  | 'halloween' | 'christmas' | 'snow' | 'corporate' | 'modern' | 'luxury'
  | 'mclaren' | 'porsche-gulf' | 'ferrari' | 'mercedes-amg' | 'red-bull'
  | 'transparent' | 'pure-black' | 'pure-white' | 'blank-dark' | 'blank-light'
  | 'cyberpunk-neon' | 'synthwave' | 'corporate-tech' | 'luxury-gold'
  | 'anime-sakura' | 'tokyo-night' | 'snow-season' | 'modern-clean'
  | 'pure-transparent' | 'lo-fi-bedroom' | 'anime-room' | 'modern-white'
  | 'pastel-planets' | 'cyber-hud' | 'esports-blue'
  | 'cyber-synth' | 'cyberpunk-neon' | 'synthwave' | 'retro-crt'
  | 'lo-fi-cafe' | 'lo-fi-bedroom' | 'anime-room' | 'anime-sakura'
  | 'minimal-dark' | 'minimal-white' | 'modern-white' | 'corporate-tech' | 'modern-clean'
  | 'glassmorphism' | 'neumorphism' | 'luxury-gold' | 'tokyo-night'
  | 'halloween' | 'christmas' | 'snow-season'
  | 'mclaren' | 'porsche-gulf' | 'ferrari' | 'mercedes-amg' | 'red-bull'
  | 'pure-transparent' | 'pure-black' | 'pure-white'
  | 'pastel-planets' | 'cyber-hud' | 'esports-blue';

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
  parentId?: string; // Grouping support
  type: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  scale: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  style: {
    borderRadius?: number;
    background?: string;
    borderSize?: number;
    borderStyle?: string;
    borderColor?: string;
    glowColor?: string;
    glowBlur?: number;
    shadowX?: number;
    shadowY?: number;
    shadowBlur?: number;
    shadowColor?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: number;
  };
  animation: {
    type: 'none' | 'fade' | 'scale' | 'slide' | 'bounce' | 'glow' | 'pulse' | 'float' | 'shake';
    duration: number;
    delay: number;
    loop: boolean;
  };
  content: {
    type: string;
    settings: Record<string, any>;
  };
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
  disableAnimations: boolean;
  activeAnimationPack: string;
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
  // Database sync state
  projectId: string | null;
  loading: boolean;
  initializeDbSession: () => Promise<void>;

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
  selectedWidgetId: string | null; // For backward compatibility
  selectedWidgetIds: string[]; // Multi-select support
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  clipboardStyle: { style: Widget['style']; animation: Widget['animation'] } | null;
  copiedWidget: Widget | null; // Full widget copy/paste support
  templates: Record<string, Widget[]>;
  historyStack: Record<SceneType, Widget[][]>;
  historyIndex: Record<SceneType, number>;

  // Widget placement actions
  updateWidget: (widgetId: string, fields: Partial<Widget>) => void;
  updateWidgets: (updates: Record<string, Partial<Widget>>) => void;
  addWidget: (type: string) => void;
  removeWidget: (widgetId: string) => void;
  duplicateWidget: (widgetId: string) => void;
  selectWidget: (widgetId: string | null) => void; // Keep for compatibility
  selectWidgets: (widgetIds: string[]) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  copyWidgetStyle: (widgetId: string) => void;
  pasteWidgetStyle: (widgetId: string) => void;
  copyWidget: (widgetId: string) => void; // Full widget copy/paste support
  pasteWidget: () => void; // Full widget copy/paste support
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelected: (direction: 'horizontal' | 'vertical') => void;
  groupSelectedWidgets: () => void;
  ungroupWidgets: (groupId: string) => void;
  saveTemplate: (name: string) => void;
  loadTemplate: (name: string) => void;
  bringToFront: (widgetId: string) => void;
  sendBackward: (widgetId: string) => void;

  // Standard scene & state actions
  setScene: (scene: SceneType) => void;
  setTheme: (theme: ThemeType) => void;
  addTime: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: (seconds?: number) => void;
  tickTimer: () => void;
  addChatMessage: (username: string, text: string, badge?: ChatMessage['badge'], platform?: ChatMessage['platform']) => void;
  clearChat: () => void;
  setShowChat: (show: boolean) => void;
  setShowAvatar: (show: boolean) => void;
  setShowTicker: (show: boolean) => void;
  triggerAlert: (type: AlertType, username: string, message?: string, amount?: string) => void;
  dismissAlert: () => void;
  updateGoal: (type: 'sub' | 'donation' | 'follower', field: 'current' | 'target', value: number) => void;
  updateSettings: (partial: Partial<OverlaySettings>) => void;
  executeAICommand: (prompt: string) => void;
  addScheduleEvent: (time: string, scene: SceneType, label: string) => void;
  removeScheduleEvent: (id: string) => void;
  checkSchedule: (currentTime: string) => void;
  broadcastState: (slice: Partial<OverlayState>) => void;
  loadFromBroadcast: (data: Partial<OverlayState>) => void;
  applyThemeLayoutPreset: () => void;

  // Music controls
  toggleMusicPlay: () => void;
  nextMusicTrack: () => void;

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
    {
      id: 'timer-soon', type: 'timer', label: 'Countdown Timer', x: 25, y: 30, w: 50, h: 25,
      rotation: 0, opacity: 100, scale: 1, zIndex: 1, visible: true, locked: false,
      style: { borderRadius: 12, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'float', duration: 6, delay: 0, loop: true },
      content: { type: 'timer', settings: { size: 'full', customLabel: 'STREAM STARTING SOON' } }
    },
    {
      id: 'music-soon', type: 'music', label: 'Now Playing Widget', x: 32, y: 65, w: 36, h: 14,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 30, background: 'rgba(0, 0, 0, 0.45)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'music', settings: { compact: true } }
    },
    {
      id: 'event-log-shared', type: 'event-list', label: 'Recent Events Log', x: 10, y: 12, w: 80, h: 10,
      rotation: 0, opacity: 100, scale: 1, zIndex: 3, visible: true, locked: true,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'event-list', settings: {} }
    }
  ],
  'main-stream': [
    {
      id: 'game-main', type: 'game', label: 'Primary Game Stream', x: 2, y: 2, w: 76, h: 86,
      rotation: 0, opacity: 100, scale: 1, zIndex: 1, visible: true, locked: true,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.2)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'game', settings: {} }
    },
    {
      id: 'vtuber-main', type: 'vtuber', label: 'VTuber Model Corner', x: 80, y: 55, w: 18, h: 32,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'float', duration: 4, delay: 0, loop: true },
      content: { type: 'vtuber', settings: {} }
    },
    {
      id: 'chat-main', type: 'chat', label: 'Chat Overlay', x: 80, y: 2, w: 18, h: 50,
      rotation: 0, opacity: 100, scale: 1, zIndex: 3, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'chat', settings: { size: 'medium' } }
    },
    {
      id: 'sub-main', type: 'sub-goal', label: 'Subscriber Progress Bar', x: 2, y: 91, w: 30, h: 6,
      rotation: 0, opacity: 100, scale: 1, zIndex: 4, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'sub-goal', settings: {} }
    },
    {
      id: 'dono-main', type: 'dono-goal', label: 'Donation Progress Bar', x: 35, y: 91, w: 30, h: 6,
      rotation: 0, opacity: 100, scale: 1, zIndex: 5, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'dono-goal', settings: {} }
    },
    {
      id: 'alerts-main', type: 'alerts', label: 'Alert Notification Box', x: 25, y: 15, w: 50, h: 20,
      rotation: 0, opacity: 100, scale: 1, zIndex: 6, visible: false, locked: true,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'scale', duration: 0.5, delay: 0, loop: false },
      content: { type: 'alerts', settings: {} }
    }
  ],
  'chat-session': [
    {
      id: 'vtuber-chatting', type: 'vtuber', label: 'Large VTuber Avatar Frame', x: 5, y: 10, w: 38, h: 76,
      rotation: 0, opacity: 100, scale: 1, zIndex: 1, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'float', duration: 5, delay: 0, loop: true },
      content: { type: 'vtuber', settings: {} }
    },
    {
      id: 'chat-chatting', type: 'chat', label: 'Live Scrolling Chat Box', x: 48, y: 20, w: 48, h: 52,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'chat', settings: { size: 'large' } }
    },
    {
      id: 'music-chatting', type: 'music', label: 'Now Playing Widget', x: 48, y: 76, w: 22, h: 12,
      rotation: 0, opacity: 100, scale: 1, zIndex: 3, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'music', settings: { compact: false } }
    },
    {
      id: 'sub-chatting', type: 'sub-goal', label: 'Sub Goal Progress Bar', x: 74, y: 76, w: 22, h: 12,
      rotation: 0, opacity: 100, scale: 1, zIndex: 4, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'sub-goal', settings: {} }
    },
    {
      id: 'event-log-shared', type: 'event-list', label: 'Recent Events Log', x: 5, y: 2, w: 90, h: 6,
      rotation: 0, opacity: 100, scale: 1, zIndex: 5, visible: true, locked: true,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'event-list', settings: {} }
    }
  ],
  'brb': [
    {
      id: 'vtuber-brb', type: 'vtuber', label: 'Resting Avatar', x: 40, y: 25, w: 20, h: 30,
      rotation: 0, opacity: 100, scale: 1, zIndex: 1, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'float', duration: 6, delay: 0, loop: true },
      content: { type: 'vtuber', settings: {} }
    },
    {
      id: 'timer-brb', type: 'timer', label: 'Return Clock', x: 30, y: 60, w: 40, h: 12,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'timer', settings: { size: 'full', customLabel: 'BE RIGHT BACK' } }
    },
    {
      id: 'chat-brb', type: 'chat', label: 'Mini Chat', x: 75, y: 10, w: 20, h: 75,
      rotation: 0, opacity: 100, scale: 1, zIndex: 3, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'chat', settings: { size: 'mini' } }
    }
  ],
  'ending-stream': [
    {
      id: 'timer-ending', type: 'timer', label: 'Goodbye Messages', x: 25, y: 35, w: 50, h: 20,
      rotation: 0, opacity: 100, scale: 1, zIndex: 1, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'timer', settings: { size: 'full', customLabel: 'STREAM ENDING' } }
    },
    {
      id: 'socials-ending', type: 'socials', label: 'Social Handles Card', x: 30, y: 60, w: 40, h: 20,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 0, padding: 4 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'socials', settings: {} }
    }
  ]
};

// ==========================================================================
// STORE INITIALIZER
// ==========================================================================
const getInitialState = () => {
  return {
    projectId: null as string | null,
    loading: true,
    copiedWidget: null as Widget | null,
    currentScene: 'starting-soon' as SceneType,
    theme: 'cyber-synth' as ThemeType,
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
    latestDonation: { user: 'Aria', amount: '$20.00' } as { user: string; amount: string } | null,
    recentEvents: [] as StreamEvent[],
    viewerCount: 142,
    subGoal: { current: 145, target: 200 },
    donationGoal: { current: 210, target: 500 },
    followerGoal: { current: 1700, target: 2000 },
    alertQueue: [] as Alert[],
    activeAlert: null as Alert | null,
    alertHistory: [] as Alert[],
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
      avatarPosition: 'bottom-right' as const,
      chatSize: 'medium' as const,
      borderRadius: 8,
      animationSpeed: 'normal' as const,
      overlayOpacity: 85,
      particleDensity: 'medium' as const,
      tickerSpeed: 'normal' as const,
      disableAnimations: false,
      activeAnimationPack: 'float',
    },
    aiMessages: [
      {
        id: 'ai-0',
        sender: 'assistant' as const,
        text: '👋 VIBE_AI online. Try: "Switch to BRB", "Add 5 minutes", "Hide chat", "Show avatar", "Switch to gameplay", "Reset timer".'
      }
    ],
    schedule: DEFAULT_SCHEDULE,
    sceneWidgets: DEFAULT_WIDGETS,
    selectedWidgetId: null as string | null,
    selectedWidgetIds: [] as string[],
    canvasZoom: 1.0,
    canvasPan: { x: 0, y: 0 },
    clipboardStyle: null as { style: Widget['style']; animation: Widget['animation'] } | null,
    templates: {} as Record<string, Widget[]>,
    historyStack: {
      'starting-soon': [[...DEFAULT_WIDGETS['starting-soon']]],
      'main-stream': [[...DEFAULT_WIDGETS['main-stream']]],
      'chat-session': [[...DEFAULT_WIDGETS['chat-session']]],
      'brb': [[...DEFAULT_WIDGETS['brb']]],
      'ending-stream': [[...DEFAULT_WIDGETS['ending-stream']]]
    } as Record<SceneType, Widget[][]>,
    historyIndex: {
      'starting-soon': 0,
      'main-stream': 0,
      'chat-session': 0,
      'brb': 0,
      'ending-stream': 0
    } as Record<SceneType, number>,
  };
};

// ==========================================================================
// STORE
// ==========================================================================
export const useOverlayStore = create<OverlayState>((set, get) => ({
  ...getInitialState(),

  // ─── Database Sync Session Initializer ──────────────────────────────────
  initializeDbSession: async () => {
    set({ loading: true });
    try {
      const userId = await getSessionUserId();
      let data = await fetchProjectData(userId);
      if (!data) {
        const defaultState = getInitialState();
        data = await initializeDefaultProject(userId, defaultState);
      }
      
      set({
        projectId: data.projectId,
        theme: data.theme,
        currentScene: data.currentScene,
        settings: data.settings,
        subGoal: data.subGoal,
        donationGoal: data.donationGoal,
        followerGoal: data.followerGoal,
        sceneWidgets: data.sceneWidgets,
        schedule: data.schedule,
        loading: false
      });
      
      // Hydrate history stack with loaded state
      set(state => ({
        historyStack: {
          'starting-soon': [[...(state.sceneWidgets['starting-soon'] || [])]],
          'main-stream': [[...(state.sceneWidgets['main-stream'] || [])]],
          'chat-session': [[...(state.sceneWidgets['chat-session'] || [])]],
          'brb': [[...(state.sceneWidgets['brb'] || [])]],
          'ending-stream': [[...(state.sceneWidgets['ending-stream'] || [])]]
        },
        historyIndex: {
          'starting-soon': 0,
          'main-stream': 0,
          'chat-session': 0,
          'brb': 0,
          'ending-stream': 0
        }
      }));
    } catch (e) {
      console.error('Failed to initialize Supabase session, using fallback local settings:', e);
      set({ loading: false });
    }
  },

  // ─── Scene & Theme ───────────────────────────────────────────────────────
  setScene: (scene: SceneType) => {
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
    
    const { projectId, theme } = get();
    if (projectId) {
      updateDbSettings(projectId, {}, scene, theme);
    }
  },

  setTheme: (theme: ThemeType) => {
    // 1. Save history state to allow undoing theme changes
    get().pushHistoryState();

    // 2. Set the theme
    set({ theme });

    // 3. Load default layout presets for the current scene in the new theme
    const scene = get().currentScene;
    const presets = getThemeLayoutPreset(theme, scene);

    if (presets && presets.length > 0) {
      set(state => {
        const currentWidgets = [...(state.sceneWidgets[scene] || [])];
        const nextSceneWidgets = { ...state.sceneWidgets };

        const updatedWidgets: Widget[] = [];
        const templateWidgetsLeft = [...presets];

        // Map template widgets onto existing widgets of the same type to prevent content loss
        currentWidgets.forEach(w => {
          const matchIndex = templateWidgetsLeft.findIndex(t => t.type === w.type);
          if (matchIndex !== -1) {
            const template = templateWidgetsLeft[matchIndex];
            templateWidgetsLeft.splice(matchIndex, 1);

            updatedWidgets.push({
              ...w,
              x: template.x ?? w.x,
              y: template.y ?? w.y,
              w: template.w ?? w.w,
              h: template.h ?? w.h,
              rotation: template.rotation ?? w.rotation,
              opacity: template.opacity ?? w.opacity,
              scale: template.scale ?? w.scale,
              zIndex: template.zIndex ?? w.zIndex,
              visible: template.visible ?? w.visible,
              style: {
                ...w.style,
                ...template.style
              },
              animation: {
                ...w.animation,
                ...template.animation,
                type: (template.animation?.type || w.animation?.type || 'none') as any
              },
              content: {
                ...w.content,
                settings: {
                  ...w.content?.settings,
                  ...template.content?.settings
                }
              }
            });
          } else {
            updatedWidgets.push(w);
          }
        });

        // Add any missing template widgets
        templateWidgetsLeft.forEach((template, i) => {
          const newId = `${template.type}-${Date.now()}-${i}`;
          updatedWidgets.push({
            id: newId,
            type: template.type!,
            label: template.label || `New ${template.type!.toUpperCase()} widget`,
            x: template.x ?? 30,
            y: template.y ?? 30,
            w: template.w ?? 20,
            h: template.h ?? 15,
            rotation: template.rotation ?? 0,
            opacity: template.opacity ?? 100,
            scale: template.scale ?? 1.0,
            zIndex: template.zIndex ?? (updatedWidgets.length + 1),
            visible: template.visible ?? true,
            locked: template.locked ?? false,
            style: {
              borderRadius: 8,
              background: 'rgba(14, 8, 26, 0.8)',
              borderSize: 1,
              borderStyle: 'solid',
              borderColor: '#A855F7',
              glowBlur: 0,
              padding: 4,
              ...template.style
            },
            animation: {
              type: (template.animation?.type || 'none') as any,
              duration: template.animation?.duration || 1,
              delay: template.animation?.delay || 0,
              loop: template.animation?.loop || false
            },
            content: {
              type: template.type!,
              settings: {
                customLabel: '',
                customText: '',
                ...template.content?.settings
              }
            }
          });
        });

        nextSceneWidgets[scene] = updatedWidgets;

        // Sync replacements to DB
        const { projectId } = get();
        if (projectId) {
          replaceDbSceneWidgets(projectId, scene, updatedWidgets);
        }

        return { sceneWidgets: nextSceneWidgets };
      });
    }

    const { projectId, currentScene } = get();
    if (projectId) {
      updateDbSettings(projectId, {}, currentScene, theme);
    }
  },

  applyThemeLayoutPreset: () => {
    const theme = get().theme;
    const scene = get().currentScene;
    const presets = getThemeLayoutPreset(theme, scene);
    if (!presets || presets.length === 0) return;

    get().pushHistoryState();

    set(state => {
      const nextSceneWidgets = { ...state.sceneWidgets };
      const newWidgets = presets.map((template, i) => ({
        id: `${template.type}-${Date.now()}-${i}`,
        type: template.type!,
        label: template.label || `New ${template.type!.toUpperCase()} widget`,
        x: template.x ?? 30,
        y: template.y ?? 30,
        w: template.w ?? 20,
        h: template.h ?? 15,
        rotation: template.rotation ?? 0,
        opacity: template.opacity ?? 100,
        scale: template.scale ?? 1.0,
        zIndex: template.zIndex ?? (i + 1),
        visible: template.visible ?? true,
        locked: template.locked ?? false,
        style: {
          borderRadius: 8,
          background: 'rgba(14, 8, 26, 0.8)',
          borderSize: 1,
          borderStyle: 'solid',
          borderColor: '#A855F7',
          glowBlur: 0,
          padding: 4,
          ...template.style
        },
        animation: {
          type: (template.animation?.type || 'none') as any,
          duration: template.animation?.duration || 1,
          delay: template.animation?.delay || 0,
          loop: template.animation?.loop || false
        },
        content: {
          type: template.type!,
          settings: {
            customLabel: '',
            customText: '',
            ...template.content?.settings
          }
        }
      }));

      nextSceneWidgets[scene] = newWidgets;

      const { projectId } = get();
      if (projectId) {
        replaceDbSceneWidgets(projectId, scene, newWidgets);
      }

      return { sceneWidgets: nextSceneWidgets };
    });
  },


  // ─── Timer ───────────────────────────────────────────────────────────────
  addTime: (seconds: number) => {
    set(s => ({ timer: { ...s.timer, seconds: s.timer.seconds + seconds } }));
    get().broadcastState({ timer: get().timer });
  },

  pauseTimer: () => {
    set(s => ({ timer: { ...s.timer, isRunning: false, isPaused: true } }));
    get().broadcastState({ timer: get().timer });
  },

  resumeTimer: () => {
    set(s => ({ timer: { ...s.timer, isRunning: true, isPaused: false } }));
    get().broadcastState({ timer: get().timer });
  },

  resetTimer: (seconds: number = 600) => {
    set({ timer: { seconds, isRunning: true, isPaused: false } });
    get().broadcastState({ timer: get().timer });
  },

  tickTimer: () => {
    const { timer } = get();
    if (!timer.isRunning || timer.isPaused || timer.seconds <= 0) return;
    set(s => ({ timer: { ...s.timer, seconds: Math.max(0, s.timer.seconds - 1) } }));
  },

  // ─── Chat ─────────────────────────────────────────────────────────────────
  addChatMessage: (username: string, text: string, badge?: ChatMessage['badge'], platform?: ChatMessage['platform']) => {
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
    get().broadcastState({ chatMessages: get().chatMessages });
  },

  clearChat: () => { set({ chatMessages: [] }); },

  setShowChat: (show: boolean) => {
    set({ showChat: show });
    get().broadcastState({ showChat: show });
  },

  // ─── Avatar & Ticker ──────────────────────────────────────────────────────
  setShowAvatar: (show: boolean) => {
    set({ showAvatar: show });
    get().broadcastState({ showAvatar: show });
  },

  setShowTicker: (show: boolean) => {
    set({ showTicker: show });
    get().broadcastState({ showTicker: show });
  },

  // ─── Alerts ───────────────────────────────────────────────────────────────
  triggerAlert: (type: AlertType, username: string, message?: string, amount?: string) => {
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
    get().broadcastState({ alertHistory: get().alertHistory, activeAlert: get().activeAlert });
  },

  dismissAlert: () => {
    set(s => {
      const [next, ...rest] = s.alertQueue;
      return { activeAlert: next ?? null, alertQueue: rest };
    });
  },

  // ─── Goals ────────────────────────────────────────────────────────────────
  updateGoal: (type: 'sub' | 'donation' | 'follower', field: 'current' | 'target', value: number) => {
    if (type === 'sub') {
      set(s => ({ subGoal: { ...s.subGoal, [field]: value } }));
    } else if (type === 'donation') {
      set(s => ({ donationGoal: { ...s.donationGoal, [field]: value } }));
    } else {
      set(s => ({ followerGoal: { ...s.followerGoal, [field]: value } }));
    }
    
    const { projectId, subGoal, donationGoal, followerGoal } = get();
    if (projectId) {
      if (type === 'sub') {
        const nextCur = field === 'current' ? value : subGoal.current;
        const nextTarg = field === 'target' ? value : subGoal.target;
        updateDbGoal(projectId, 'sub', nextCur, nextTarg);
      } else if (type === 'donation') {
        const nextCur = field === 'current' ? value : donationGoal.current;
        const nextTarg = field === 'target' ? value : donationGoal.target;
        updateDbGoal(projectId, 'donation', nextCur, nextTarg);
      } else {
        const nextCur = field === 'current' ? value : followerGoal.current;
        const nextTarg = field === 'target' ? value : followerGoal.target;
        updateDbGoal(projectId, 'follower', nextCur, nextTarg);
      }
    }
    
    get().broadcastState({ subGoal: get().subGoal, donationGoal: get().donationGoal, followerGoal: get().followerGoal });
  },

  // ─── Settings ─────────────────────────────────────────────────────────────
  updateSettings: (partial: Partial<OverlaySettings>) => {
    set(s => ({ settings: { ...s.settings, ...partial } }));
    
    const { projectId, currentScene, theme } = get();
    if (projectId) {
      updateDbSettings(projectId, partial, currentScene, theme);
    }

    get().broadcastState({ settings: get().settings });
  },

  // ─── AI Companion ─────────────────────────────────────────────────────────
  executeAICommand: (prompt: string) => {
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
  addScheduleEvent: async (time: string, scene: SceneType, label: string) => {
    const { projectId } = get();
    let dbId = `sch-${Date.now()}`;
    if (projectId) {
      const addedId = await addDbScheduleEvent(projectId, time, scene, label);
      if (addedId) dbId = addedId;
    }
    const event = { id: dbId, time, scene, label, isActive: true };
    set(s => ({
      schedule: [...s.schedule, event].sort((a, b) => a.time.localeCompare(b.time))
    }));
  },

  removeScheduleEvent: (id: string) => {
    set(s => ({ schedule: s.schedule.filter(e => e.id !== id) }));
    const { projectId } = get();
    if (projectId && !id.startsWith('sch-')) {
      deleteDbScheduleEvent(id);
    }
  },

  checkSchedule: (currentTime: string) => {
    const match = get().schedule.find(e => e.isActive && e.time === currentTime);
    if (match && get().currentScene !== match.scene) {
      get().setScene(match.scene);
    }
  },

  // ─── Realtime ─────────────────────────────────────────────────────────────
  broadcastState: (slice: Partial<OverlayState>) => {
    // Real-time synchronization is handled via Supabase Realtime subscriptions
  },

  loadFromBroadcast: (data: Partial<OverlayState>) => {
    set(s => ({ ...s, ...data }));
  },

  // ─── Widget Placement Actions ─────────────────────────────────────────────
  updateWidget: (widgetId, fields) => {
    const currentScene = get().currentScene;
    
    // Split fields into global and local
    const globalFields: Partial<Widget> = {};
    const localFields: Partial<Widget> = {};
    const localKeys = ['x', 'y', 'w', 'h', 'rotation', 'opacity', 'scale', 'zIndex', 'visible', 'locked', 'parentId'];
    
    Object.entries(fields).forEach(([key, val]) => {
      if (localKeys.includes(key)) {
        (localFields as any)[key] = val;
      } else {
        (globalFields as any)[key] = val;
      }
    });

    set(state => {
      const nextSceneWidgets = { ...state.sceneWidgets };
      
      Object.keys(nextSceneWidgets).forEach(s => {
        const sceneKey = s as SceneType;
        nextSceneWidgets[sceneKey] = nextSceneWidgets[sceneKey].map(w => {
          if (w.id === widgetId) {
            const updates = sceneKey === currentScene 
              ? { ...globalFields, ...localFields } 
              : globalFields;
            return { ...w, ...updates };
          }
          return w;
        });
      });
      
      return { sceneWidgets: nextSceneWidgets };
    });
  },

  updateWidgets: (updates) => {
    const currentScene = get().currentScene;
    const localKeys = ['x', 'y', 'w', 'h', 'rotation', 'opacity', 'scale', 'zIndex', 'visible', 'locked', 'parentId'];

    set(state => {
      const nextSceneWidgets = { ...state.sceneWidgets };
      
      Object.keys(nextSceneWidgets).forEach(s => {
        const sceneKey = s as SceneType;
        nextSceneWidgets[sceneKey] = nextSceneWidgets[sceneKey].map(w => {
          const widgetUpdates = updates[w.id];
          if (widgetUpdates) {
            const globalFields: Partial<Widget> = {};
            const localFields: Partial<Widget> = {};
            
            Object.entries(widgetUpdates).forEach(([key, val]) => {
              if (localKeys.includes(key)) {
                (localFields as any)[key] = val;
              } else {
                (globalFields as any)[key] = val;
              }
            });
            
            const finalUpdates = sceneKey === currentScene
              ? { ...globalFields, ...localFields }
              : globalFields;
              
            return { ...w, ...finalUpdates };
          }
          return w;
        });
      });
      
      return { sceneWidgets: nextSceneWidgets };
    });
  },

  addWidget: (type) => {
    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene];
    const newId = `widget-${type}-${Date.now()}`;
    const newWidget: Widget = {
      id: newId,
      type,
      label: `New ${type.toUpperCase()} widget`,
      x: 35,
      y: 35,
      w: 20,
      h: 15,
      rotation: 0,
      opacity: 100,
      scale: 1.0,
      zIndex: currentWidgets.length + 1,
      visible: true,
      locked: false,
      style: {
        borderRadius: 8,
        background: 'rgba(14, 8, 26, 0.8)',
        borderSize: 1,
        borderStyle: 'solid',
        borderColor: '#A855F7',
        glowColor: '#FF4DFF',
        glowBlur: 0,
        padding: 4
      },
      animation: {
        type: 'none',
        duration: 1,
        delay: 0,
        loop: false
      },
      content: {
        type,
        settings: {
          customLabel: '',
          customText: ''
        }
      }
    };

    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: [...currentWidgets, newWidget]
      },
      selectedWidgetIds: [newId],
      selectedWidgetId: newId
    }));

    const { projectId } = get();
    if (projectId) {
      addDbWidget(projectId, scene, newWidget);
    }

    get().pushHistoryState();
  },

  removeWidget: (widgetId) => {
    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene];
    
    set(state => {
      const selectedWidgetIds = state.selectedWidgetIds.filter(id => id !== widgetId);
      return {
        sceneWidgets: {
          ...state.sceneWidgets,
          [scene]: currentWidgets.filter(w => w.id !== widgetId)
        },
        selectedWidgetIds,
        selectedWidgetId: selectedWidgetIds[0] || null
      };
    });

    const { projectId } = get();
    if (projectId) {
      deleteDbWidget(widgetId);
    }

    get().pushHistoryState();
  },

  duplicateWidget: (widgetId) => {
    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene];
    const target = currentWidgets.find(w => w.id === widgetId);
    if (!target) return;

    const dupId = `widget-${target.type}-${Date.now()}`;
    const duplicate: Widget = {
      ...JSON.parse(JSON.stringify(target)),
      id: dupId,
      label: `${target.label} (Copy)`,
      x: Math.min(target.x + 4, 80),
      y: Math.min(target.y + 4, 80),
      locked: false,
      zIndex: currentWidgets.length + 1
    };

    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: [...currentWidgets, duplicate]
      },
      selectedWidgetIds: [dupId],
      selectedWidgetId: dupId
    }));

    const { projectId } = get();
    if (projectId) {
      addDbWidget(projectId, scene, duplicate);
    }

    get().pushHistoryState();
  },

  selectWidget: (widgetId) => {
    set({
      selectedWidgetId: widgetId,
      selectedWidgetIds: widgetId ? [widgetId] : []
    });
  },

  selectWidgets: (widgetIds) => {
    set({
      selectedWidgetIds: widgetIds,
      selectedWidgetId: widgetIds[0] || null
    });
  },

  setCanvasZoom: (zoom) => {
    set({ canvasZoom: Math.max(0.2, Math.min(zoom, 4)) });
  },

  setCanvasPan: (pan) => {
    set({ canvasPan: pan });
  },

  copyWidgetStyle: (widgetId) => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const target = widgets.find(w => w.id === widgetId);
    if (target) {
      set({
        clipboardStyle: {
          style: JSON.parse(JSON.stringify(target.style)),
          animation: JSON.parse(JSON.stringify(target.animation))
        }
      });
    }
  },

  pasteWidgetStyle: (widgetId) => {
    const clipboard = get().clipboardStyle;
    if (!clipboard) return;

    set(state => {
      const nextSceneWidgets = { ...state.sceneWidgets };
      Object.keys(nextSceneWidgets).forEach(s => {
        const sceneKey = s as SceneType;
        nextSceneWidgets[sceneKey] = nextSceneWidgets[sceneKey].map(w => 
          w.id === widgetId
            ? {
                ...w,
                style: JSON.parse(JSON.stringify(clipboard.style)),
                animation: JSON.parse(JSON.stringify(clipboard.animation))
              }
            : w
        );
      });
      return { sceneWidgets: nextSceneWidgets };
    });

    get().pushHistoryState();
  },

  copyWidget: (widgetId) => {
    const scene = get().currentScene;
    const target = get().sceneWidgets[scene]?.find(w => w.id === widgetId);
    if (target) {
      set({ copiedWidget: JSON.parse(JSON.stringify(target)) });
    }
  },

  pasteWidget: () => {
    const copied = get().copiedWidget;
    if (!copied) return;

    const scene = get().currentScene;
    const currentWidgets = get().sceneWidgets[scene] || [];
    const newId = `widget-${copied.type}-${Date.now()}`;
    
    const pastedWidget: Widget = {
      ...JSON.parse(JSON.stringify(copied)),
      id: newId,
      label: `${copied.label} (Pasted)`,
      x: Math.min(copied.x + 4, 80),
      y: Math.min(copied.y + 4, 80),
      locked: false,
      zIndex: currentWidgets.length + 1
    };

    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: [...currentWidgets, pastedWidget]
      },
      selectedWidgetIds: [newId],
      selectedWidgetId: newId
    }));

    const { projectId } = get();
    if (projectId) {
      addDbWidget(projectId, scene, pastedWidget);
    }

    get().pushHistoryState();
  },

  alignSelected: (alignment) => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const selectedIds = get().selectedWidgetIds;
    if (selectedIds.length <= 1) return;

    const selectedWidgets = widgets.filter(w => selectedIds.includes(w.id));
    
    // Compute bounds
    const minX = Math.min(...selectedWidgets.map(w => w.x));
    const maxX = Math.max(...selectedWidgets.map(w => w.x + w.w));
    const minY = Math.min(...selectedWidgets.map(w => w.y));
    const maxY = Math.max(...selectedWidgets.map(w => w.y + w.h));
    
    const updates: Record<string, Partial<Widget>> = {};

    selectedWidgets.forEach(w => {
      if (alignment === 'left') {
        updates[w.id] = { x: minX };
      } else if (alignment === 'right') {
        updates[w.id] = { x: maxX - w.w };
      } else if (alignment === 'center') {
        const center = minX + (maxX - minX) / 2;
        updates[w.id] = { x: center - w.w / 2 };
      } else if (alignment === 'top') {
        updates[w.id] = { y: minY };
      } else if (alignment === 'bottom') {
        updates[w.id] = { y: maxY - w.h };
      } else if (alignment === 'middle') {
        const middle = minY + (maxY - minY) / 2;
        updates[w.id] = { y: middle - w.h / 2 };
      }
    });

    get().updateWidgets(updates);
    get().pushHistoryState();
  },

  distributeSelected: (direction) => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const selectedIds = get().selectedWidgetIds;
    if (selectedIds.length <= 2) return;

    const selectedWidgets = widgets.filter(w => selectedIds.includes(w.id));
    const updates: Record<string, Partial<Widget>> = {};

    if (direction === 'horizontal') {
      const sorted = [...selectedWidgets].sort((a, b) => a.x - b.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalWidthOfWidgets = sorted.reduce((sum, w) => sum + w.w, 0);
      const totalSpan = last.x + last.w - first.x;
      const remainingSpace = totalSpan - totalWidthOfWidgets;
      const gap = remainingSpace / (sorted.length - 1);

      let currentX = first.x;
      sorted.forEach((w, index) => {
        if (index > 0 && index < sorted.length - 1) {
          updates[w.id] = { x: currentX };
        }
        currentX += w.w + gap;
      });
    } else {
      const sorted = [...selectedWidgets].sort((a, b) => a.y - b.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalHeightOfWidgets = sorted.reduce((sum, w) => sum + w.h, 0);
      const totalSpan = last.y + last.h - first.y;
      const remainingSpace = totalSpan - totalHeightOfWidgets;
      const gap = remainingSpace / (sorted.length - 1);

      let currentY = first.y;
      sorted.forEach((w, index) => {
        if (index > 0 && index < sorted.length - 1) {
          updates[w.id] = { y: currentY };
        }
        currentY += w.h + gap;
      });
    }

    get().updateWidgets(updates);
    get().pushHistoryState();
  },

  groupSelectedWidgets: () => {
    const scene = get().currentScene;
    const selectedIds = get().selectedWidgetIds;
    if (selectedIds.length <= 1) return;

    const groupId = `group-${Date.now()}`;
    const updates: Record<string, Partial<Widget>> = {};
    selectedIds.forEach(id => {
      updates[id] = { parentId: groupId };
    });

    get().updateWidgets(updates);
    get().pushHistoryState();
  },

  ungroupWidgets: (groupId) => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const updates: Record<string, Partial<Widget>> = {};
    
    widgets.forEach(w => {
      if (w.parentId === groupId) {
        updates[w.id] = { parentId: undefined };
      }
    });

    get().updateWidgets(updates);
    get().pushHistoryState();
  },

  saveTemplate: (name) => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    set(state => ({
      templates: {
        ...state.templates,
        [name]: JSON.parse(JSON.stringify(widgets))
      }
    }));
  },

  loadTemplate: (name) => {
    const templateWidgets = get().templates[name];
    if (!templateWidgets) return;

    const scene = get().currentScene;
    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: JSON.parse(JSON.stringify(templateWidgets))
      },
      selectedWidgetIds: [],
      selectedWidgetId: null
    }));

    const { projectId } = get();
    if (projectId) {
      replaceDbSceneWidgets(projectId, scene, templateWidgets);
    }

    get().pushHistoryState();
  },

  bringToFront: (widgetId) => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const maxZ = Math.max(...widgets.map(w => w.zIndex || 0), 0);
    get().updateWidget(widgetId, { zIndex: maxZ + 1 });
  },

  sendBackward: (widgetId) => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const target = widgets.find(w => w.id === widgetId);
    if (!target) return;
    const currentZ = target.zIndex || 1;
    get().updateWidget(widgetId, { zIndex: Math.max(1, currentZ - 1) });
  },

  // ─── Drag & Drop Editor History Stack ─────────────────────────────────────
  pushHistoryState: () => {
    const scene = get().currentScene;
    const widgets = get().sceneWidgets[scene];
    const stack = get().historyStack[scene] || [];
    const index = get().historyIndex[scene] ?? -1;

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

    // Sync current widgets state to Supabase on history push (e.g. mouse dragup / align completed)
    const { projectId } = get();
    if (projectId) {
      const updates = widgets.map(w => ({ id: w.id, fields: w }));
      updateDbWidgetPlacementBatch(updates);
    }
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

      const { projectId } = get();
      if (projectId) {
        replaceDbSceneWidgets(projectId, scene, prevWidgets);
      }
      get().broadcastState({ sceneWidgets: get().sceneWidgets });
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

      const { projectId } = get();
      if (projectId) {
        replaceDbSceneWidgets(projectId, scene, nextWidgets);
      }
      get().broadcastState({ sceneWidgets: get().sceneWidgets });
    }
  },

  toggleMusicPlay: () => {
    set(s => {
      const nextPlaying = !s.music.isPlaying;
      const updated = { music: { ...s.music, isPlaying: nextPlaying } };
      get().broadcastState(updated);
      return updated;
    });
  },

  nextMusicTrack: () => {
    const songs = [
      { title: 'After Dark', artist: 'Mr. Kitty', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=60', duration: 224 },
      { title: 'Nightcall', artist: 'Kavinsky', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=60', duration: 258 },
      { title: 'Resonance', artist: 'HOME', albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=100&auto=format&fit=crop&q=60', duration: 212 },
      { title: 'Midnight City', artist: 'M83', albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60', duration: 243 }
    ];
    set(s => {
      const currentIdx = songs.findIndex(x => x.title === s.music.title);
      const nextIdx = (currentIdx + 1) % songs.length;
      const nextSong = songs[nextIdx];
      const updated = {
        music: {
          ...s.music,
          title: nextSong.title,
          artist: nextSong.artist,
          albumArt: nextSong.albumArt,
          duration: nextSong.duration,
          progress: 0,
          isPlaying: true
        }
      };
      get().broadcastState(updated);
      return updated;
    });
  }
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
