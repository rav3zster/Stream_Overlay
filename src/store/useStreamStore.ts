import { create } from 'zustand';

// ==========================================================================
// DATA TYPES AND INTERFACES
// ==========================================================================

export type SceneType = 'starting-soon' | 'main-stream' | 'chat-session' | 'brb' | 'ending-stream';

export type ThemeType = 
  | 'cyber-synth' 
  | 'galaxy-violet' 
  | 'anime-bedroom' 
  | 'lo-fi-cafe' 
  | 'sakura-night' 
  | 'neon-tokyo' 
  | 'dark-amethyst' 
  | 'cosmic-nebula' 
  | 'vaporwave' 
  | 'minimal-purple';

export interface Widget {
  id: string;
  type: string; // 'chat' | 'vtuber' | 'game' | 'webcam' | 'music' | 'alerts' | 'socials' | 'viewer-counter' | 'event-list' | 'timer' | 'clock' | 'date' | 'water-tracker' | 'sub-goal' | 'dono-goal' | 'follow-goal';
  label: string;
  x: number; // percentage based coordinate (0-100)
  y: number; // percentage based coordinate (0-100)
  w: number; // percentage based width (0-100)
  h: number; // percentage based height (0-100)
  isLocked: boolean;
  isHidden: boolean;
  customData?: Record<string, any>;
}

export interface Alert {
  id: string;
  type: 'follow' | 'subscribe' | 'donation' | 'raid' | 'host';
  username: string;
  message?: string;
  amount?: string;
  timestamp: number;
}

export interface Song {
  title: string;
  artist: string;
  albumArt: string;
  duration: number; // in seconds
  progress: number; // in seconds
  isPlaying: boolean;
}

export interface ScheduleEvent {
  id: string;
  time: string; // e.g. "19:50" (24h format)
  scene: SceneType;
  label: string;
  isActive: boolean;
}

export interface MarketplaceTheme {
  id: string;
  name: string;
  author: string;
  category: 'Cozy' | 'Cyberpunk' | 'Space' | 'Anime' | 'Minimal';
  rating: number;
  installs: number;
  previewColor: string;
  isInstalled: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface StreamState {
  activeScene: SceneType;
  activeTheme: ThemeType;
  streamerName: string;
  streamTitle: string;
  activeGame: string;
  viewerCount: number;
  
  // Custom Scene Widgets definitions
  sceneWidgets: Record<SceneType, Widget[]>;
  selectedWidgetId: string | null;
  
  // Goals
  goals: {
    follower: { current: number; target: number };
    subscriber: { current: number; target: number };
    donation: { current: number; target: number };
    water: { current: number; target: number };
    exercise: { current: number; target: number };
    pushup: { current: number; target: number };
    hoursStreamed: { current: number; target: number };
  };
  
  // Alerts System
  alertQueue: Alert[];
  activeAlert: Alert | null;
  alertHistory: Alert[];
  
  // Music & Track state
  currentSong: Song;
  
  // Scheduler timeline
  schedule: ScheduleEvent[];
  
  // Marketplace mock list
  marketplaceThemes: MarketplaceTheme[];
  
  // AI Log messages
  aiMessages: AIChatMessage[];
  
  // Undo/Redo stack buffers for active scene layout
  historyStack: Record<SceneType, Widget[][]>;
  historyIndex: Record<SceneType, number>;
  
  // Actions
  setScene: (scene: SceneType) => void;
  setTheme: (theme: ThemeType) => void;
  updateMetadata: (fields: Partial<{ streamerName: string; streamTitle: string; activeGame: string; viewerCount: number }>) => void;
  
  // Widget placement actions
  updateWidget: (widgetId: string, fields: Partial<Widget>) => void;
  addWidget: (type: string) => void;
  removeWidget: (widgetId: string) => void;
  duplicateWidget: (widgetId: string) => void;
  selectWidget: (widgetId: string | null) => void;
  
  // History functions
  pushHistoryState: () => void;
  undo: () => void;
  redo: () => void;
  
  // Alert processes
  triggerAlert: (type: Alert['type'], username: string, message?: string, amount?: string) => void;
  dismissAlert: () => void;
  
  // Goals updating
  updateGoalValue: (category: keyof StreamState['goals'], action: 'increment' | 'decrement' | 'set', value?: number) => void;
  
  // Scheduler timeline
  addSchedule: (time: string, scene: SceneType, label: string) => void;
  removeSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;
  checkSchedulerTime: (currentTime: string) => void;
  
  // Marketplace actions
  installMarketplaceTheme: (themeId: string) => void;
  
  // AI chatbot instruction executor
  executeAICommand: (prompt: string) => void;
  
  // State broadcasting settings
  loadStateFromLocal: (newState: Partial<StreamState>) => void;
}

// ==========================================================================
// DEFAULT WIDGETS LAYOUT PRESETS
// ==========================================================================

const defaultWidgetsMap: Record<SceneType, Widget[]> = {
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

const defaultSchedule: ScheduleEvent[] = [
  { id: 'sch-1', time: '19:50', scene: 'starting-soon', label: 'Stream Kickoff Countdown', isActive: true },
  { id: 'sch-2', time: '20:00', scene: 'chat-session', label: 'Intro & Chat segment', isActive: true },
  { id: 'sch-3', time: '20:30', scene: 'main-stream', label: 'Gaming Gameplay Session', isActive: true },
  { id: 'sch-4', time: '22:00', scene: 'brb', label: 'Hydration Break', isActive: true },
  { id: 'sch-5', time: '22:05', scene: 'main-stream', label: 'Retro Indie Night Gameplay', isActive: true },
  { id: 'sch-6', time: '23:00', scene: 'ending-stream', label: 'Outro wrapup & Raiding', isActive: true }
];

const defaultMarketplace: MarketplaceTheme[] = [
  { id: 'mkt-1', name: 'Sakura Night', author: 'MikoDesign', category: 'Anime', rating: 4.9, installs: 1420, previewColor: '#FF80BF', isInstalled: false },
  { id: 'mkt-2', name: 'Neon Tokyo', author: 'SynthWaveMaster', category: 'Cyberpunk', rating: 4.8, installs: 3840, previewColor: '#FF0055', isInstalled: false },
  { id: 'mkt-3', name: 'Lo-fi Cafe', author: 'CozyCreator', category: 'Cozy', rating: 4.7, installs: 950, previewColor: '#ffb74d', isInstalled: false },
  { id: 'mkt-4', name: 'Vaporwave Grid', author: 'RetroWave99', category: 'Cyberpunk', rating: 4.6, installs: 2310, previewColor: '#00F5FF', isInstalled: false },
  { id: 'mkt-5', name: 'Cosmic Purple', author: 'AstralLabs', category: 'Space', rating: 4.9, installs: 1890, previewColor: '#6366F1', isInstalled: false }
];

// Broadcast function to synchronise active state values with other tabs
const broadcastStateUpdate = (stateSlice: Record<string, any>) => {
  localStorage.setItem('vibe_studio_realtime_sync', JSON.stringify({
    ...stateSlice,
    timestamp: Date.now()
  }));
};

// ==========================================================================
// GLOBAL ZUSTAND STORE CREATOR
// ==========================================================================

export const useStreamStore = create<StreamState>((set, get) => ({
  activeScene: 'starting-soon',
  activeTheme: 'cyber-synth',
  streamerName: 'Rave_VT',
  streamTitle: 'Indie Game Night: Hollow Knight Hollows!',
  activeGame: 'Hollow Knight',
  viewerCount: 142,
  
  sceneWidgets: defaultWidgetsMap,
  selectedWidgetId: null,

  goals: {
    follower: { current: 342, target: 500 },
    subscriber: { current: 84, target: 100 },
    donation: { current: 145, target: 500 },
    water: { current: 3, target: 8 },
    exercise: { current: 15, target: 60 },
    pushup: { current: 10, target: 50 },
    hoursStreamed: { current: 2, target: 5 }
  },

  alertQueue: [],
  activeAlert: null,
  alertHistory: [],

  currentSong: {
    title: 'Cozy Lavender Beats',
    artist: 'Rave Lofi Project',
    albumArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100&auto=format&fit=crop&q=60',
    duration: 180,
    progress: 42,
    isPlaying: true
  },

  schedule: defaultSchedule,
  marketplaceThemes: defaultMarketplace,
  
  aiMessages: [
    { id: 'ai-init', sender: 'assistant', text: 'Welcome to VibeOverlay AI Companion. You can type commands like "Switch to gameplay", "Hide chat", or "Set BRB for 10 minutes" to control the dashboard.', timestamp: Date.now() }
  ],

  // Initialize history variables with baseline layout states
  historyStack: {
    'starting-soon': [[...defaultWidgetsMap['starting-soon']]],
    'main-stream': [[...defaultWidgetsMap['main-stream']]],
    'chat-session': [[...defaultWidgetsMap['chat-session']]],
    'brb': [[...defaultWidgetsMap['brb']]],
    'ending-stream': [[...defaultWidgetsMap['ending-stream']]]
  },
  historyIndex: {
    'starting-soon': 0,
    'main-stream': 0,
    'chat-session': 0,
    'brb': 0,
    'ending-stream': 0
  },

  // ------------------------------------------------------------------------
  // BASIC STATE ACTIONS
  // ------------------------------------------------------------------------
  setScene: (scene) => {
    set({ activeScene: scene, selectedWidgetId: null });
    broadcastStateUpdate({ activeScene: scene });
  },

  setTheme: (theme) => {
    set({ activeTheme: theme });
    broadcastStateUpdate({ activeTheme: theme });
  },

  updateMetadata: (fields) => {
    set(state => ({
      streamerName: fields.streamerName !== undefined ? fields.streamerName : state.streamerName,
      streamTitle: fields.streamTitle !== undefined ? fields.streamTitle : state.streamTitle,
      activeGame: fields.activeGame !== undefined ? fields.activeGame : state.activeGame,
      viewerCount: fields.viewerCount !== undefined ? fields.viewerCount : state.viewerCount,
    }));
    // Broadcast all together
    const updated = {
      streamerName: fields.streamerName !== undefined ? fields.streamerName : get().streamerName,
      streamTitle: fields.streamTitle !== undefined ? fields.streamTitle : get().streamTitle,
      activeGame: fields.activeGame !== undefined ? fields.activeGame : get().activeGame,
      viewerCount: fields.viewerCount !== undefined ? fields.viewerCount : get().viewerCount,
    };
    broadcastStateUpdate(updated);
  },

  // ------------------------------------------------------------------------
  // WIDGET CONFIGURATION ACTIONS
  // ------------------------------------------------------------------------
  updateWidget: (widgetId, fields) => {
    const scene = get().activeScene;
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

    // Trigger state broadcast & update history stack
    broadcastStateUpdate({ sceneWidgets: get().sceneWidgets });
  },

  addWidget: (type) => {
    const scene = get().activeScene;
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
    broadcastStateUpdate({ sceneWidgets: get().sceneWidgets });
  },

  removeWidget: (widgetId) => {
    const scene = get().activeScene;
    const currentWidgets = get().sceneWidgets[scene];
    
    set(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [scene]: currentWidgets.filter(w => w.id !== widgetId)
      },
      selectedWidgetId: state.selectedWidgetId === widgetId ? null : state.selectedWidgetId
    }));

    get().pushHistoryState();
    broadcastStateUpdate({ sceneWidgets: get().sceneWidgets });
  },

  duplicateWidget: (widgetId) => {
    const scene = get().activeScene;
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
    broadcastStateUpdate({ sceneWidgets: get().sceneWidgets });
  },

  selectWidget: (widgetId) => {
    set({ selectedWidgetId: widgetId });
  },

  // ------------------------------------------------------------------------
  // DRAG & DROP EDITOR LAYOUT UNDO-REDO HISTORY STACK
  // ------------------------------------------------------------------------
  pushHistoryState: () => {
    const scene = get().activeScene;
    const widgets = get().sceneWidgets[scene];
    const stack = get().historyStack[scene] || [];
    const index = get().historyIndex[scene] ?? -1;

    // Prune standard futures if we made modifications on an historical node
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
    const scene = get().activeScene;
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
      broadcastStateUpdate({ sceneWidgets: get().sceneWidgets });
    }
  },

  redo: () => {
    const scene = get().activeScene;
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
      broadcastStateUpdate({ sceneWidgets: get().sceneWidgets });
    }
  },

  // ------------------------------------------------------------------------
  // ALERT EVENT NOTIFICATION CONTROLS
  // ------------------------------------------------------------------------
  triggerAlert: (type, username, message, amount) => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      type,
      username,
      message,
      amount,
      timestamp: Date.now()
    };

    set(state => {
      const updatedQueue = [...state.alertQueue, newAlert];
      const nextActive = state.activeAlert ? state.activeAlert : updatedQueue[0];
      const filteredQueue = state.activeAlert ? updatedQueue : updatedQueue.slice(1);
      const updatedHistory = [newAlert, ...state.alertHistory].slice(0, 50);

      // Trigger automatic update of event lists inside layout variables
      const cleanState = {
        alertQueue: filteredQueue,
        activeAlert: nextActive,
        alertHistory: updatedHistory
      };
      
      return cleanState;
    });

    // Broadcast trigger
    broadcastStateUpdate({
      activeAlert: get().activeAlert,
      alertHistory: get().alertHistory
    });

    // Custom auto-increment counters inside goals categories based on triggers
    if (type === 'follow') get().updateGoalValue('follower', 'increment');
    if (type === 'subscribe') get().updateGoalValue('subscriber', 'increment');
    if (type === 'donation') {
      const donationVal = parseFloat(amount?.replace(/[^0-9.]/g, '') || '0');
      get().updateGoalValue('donation', 'increment', donationVal);
    }
  },

  dismissAlert: () => {
    set(state => {
      const nextAlert = state.alertQueue.length > 0 ? state.alertQueue[0] : null;
      const nextQueue = state.alertQueue.slice(1);
      
      return {
        activeAlert: nextAlert,
        alertQueue: nextQueue
      };
    });

    broadcastStateUpdate({
      activeAlert: get().activeAlert,
      alertQueue: get().alertQueue
    });
  },

  // ------------------------------------------------------------------------
  // STREAM GOALS CONTROLS
  // ------------------------------------------------------------------------
  updateGoalValue: (category, action, value) => {
    set(state => {
      const goal = state.goals[category];
      let currentVal = goal.current;
      
      if (action === 'increment') {
        currentVal += (value !== undefined ? value : 1);
      } else if (action === 'decrement') {
        currentVal -= (value !== undefined ? value : 1);
      } else if (action === 'set' && value !== undefined) {
        currentVal = value;
      }

      const updatedCategory = {
        ...goal,
        current: Math.max(0, currentVal)
      };

      return {
        goals: {
          ...state.goals,
          [category]: updatedCategory
        }
      };
    });

    broadcastStateUpdate({ goals: get().goals });
  },

  // ------------------------------------------------------------------------
  // TIMELINE STREAM SCHEDULER
  // ------------------------------------------------------------------------
  addSchedule: (time, scene, label) => {
    const newEvent: ScheduleEvent = {
      id: `sch-${Date.now()}`,
      time,
      scene,
      label,
      isActive: true
    };

    set(state => ({
      schedule: [...state.schedule, newEvent].sort((a, b) => a.time.localeCompare(b.time))
    }));
    broadcastStateUpdate({ schedule: get().schedule });
  },

  removeSchedule: (id) => {
    set(state => ({
      schedule: state.schedule.filter(s => s.id !== id)
    }));
    broadcastStateUpdate({ schedule: get().schedule });
  },

  toggleSchedule: (id) => {
    set(state => ({
      schedule: state.schedule.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    }));
    broadcastStateUpdate({ schedule: get().schedule });
  },

  checkSchedulerTime: (currentTime) => {
    const activeMatch = get().schedule.find(s => s.isActive && s.time === currentTime);
    if (activeMatch && get().activeScene !== activeMatch.scene) {
      get().setScene(activeMatch.scene);
      
      // Auto push alert warning that scheduler switched scene
      get().triggerAlert('host', 'System Scheduler', `Auto-transited stream scene to: ${activeMatch.label}`);
    }
  },

  // ------------------------------------------------------------------------
  // THEMES MARKETPLACE INSTALLATION
  // ------------------------------------------------------------------------
  installMarketplaceTheme: (themeId) => {
    set(state => ({
      marketplaceThemes: state.marketplaceThemes.map(t => 
        t.id === themeId ? { ...t, isInstalled: true } : t
      )
    }));

    // Find theme name and switch layout to it
    const installed = get().marketplaceThemes.find(t => t.id === themeId);
    if (installed) {
      // Map theme names to keys
      const themeKey = installed.name.toLowerCase().replace(' ', '-') as ThemeType;
      get().setTheme(themeKey);
    }
  },

  // ------------------------------------------------------------------------
  // SEMANTIC AI COMPANION COMMAND INTERPRETER
  // ------------------------------------------------------------------------
  executeAICommand: (prompt) => {
    const lowercasePrompt = prompt.toLowerCase().trim();
    
    // Construct user chat message
    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: Date.now()
    };

    let responseText = "I parsed your instruction but couldn't find a matching command. Try 'switch scene main stream', 'set brb for 5 minutes', or 'hide chat'.";
    
    // Scene triggers
    if (lowercasePrompt.includes('gameplay') || lowercasePrompt.includes('main stream')) {
      get().setScene('main-stream');
      responseText = "Understood. Switching scene layout to Main Gameplay view.";
    } 
    else if (lowercasePrompt.includes('starting soon') || lowercasePrompt.includes('countdown')) {
      get().setScene('starting-soon');
      responseText = "Switching scene to stream Starting Soon. Timer initialized.";
    } 
    else if (lowercasePrompt.includes('chatting') || lowercasePrompt.includes('just chatting')) {
      get().setScene('chat-session');
      responseText = "Moving scene layout to Just Chatting panel.";
    } 
    else if (lowercasePrompt.includes('brb') || lowercasePrompt.includes('break')) {
      get().setScene('brb');
      // Look for minutes count
      const matchMin = lowercasePrompt.match(/(\d+)\s*min/);
      if (matchMin && matchMin[1]) {
        responseText = `Sure. Changing scene layout to Be Right Back segment and initializing return timer to ${matchMin[1]} minutes.`;
      } else {
        responseText = "Switching scene layout to Be Right Back standby mode.";
      }
    } 
    else if (lowercasePrompt.includes('ending') || lowercasePrompt.includes('outro')) {
      get().setScene('ending-stream');
      responseText = "Switching to Ending Stream layout screen.";
    }
    
    // Themes triggers
    if (lowercasePrompt.includes('theme') || lowercasePrompt.includes('enable')) {
      const themesKeys: ThemeType[] = [
        'cyber-synth', 'galaxy-violet', 'anime-bedroom', 'lo-fi-cafe', 
        'sakura-night', 'neon-tokyo', 'dark-amethyst', 'cosmic-nebula', 
        'vaporwave', 'minimal-purple'
      ];
      const matchTheme = themesKeys.find(t => lowercasePrompt.includes(t.replace('-', ' ')));
      if (matchTheme) {
        get().setTheme(matchTheme);
        responseText = `Activating requested design theme: ${matchTheme.toUpperCase().replace('-', ' ')}.`;
      }
    }

    // Toggle widgets visibility
    if (lowercasePrompt.includes('hide') || lowercasePrompt.includes('show')) {
      const isHide = lowercasePrompt.includes('hide');
      const currentWidgets = get().sceneWidgets[get().activeScene];
      
      let targetType = '';
      if (lowercasePrompt.includes('chat')) targetType = 'chat';
      else if (lowercasePrompt.includes('vtuber') || lowercasePrompt.includes('avatar')) targetType = 'vtuber';
      else if (lowercasePrompt.includes('game') || lowercasePrompt.includes('gameplay')) targetType = 'game';
      else if (lowercasePrompt.includes('music') || lowercasePrompt.includes('song')) targetType = 'music';
      else if (lowercasePrompt.includes('alerts')) targetType = 'alerts';
      else if (lowercasePrompt.includes('viewer') || lowercasePrompt.includes('count')) targetType = 'viewer-counter';

      if (targetType) {
        const target = currentWidgets.find(w => w.type === targetType);
        if (target) {
          get().updateWidget(target.id, { isHidden: isHide });
          responseText = `${isHide ? 'Hiding' : 'Revealing'} ${target.label} widget on the current canvas.`;
        }
      }
    }

    // Goal modifications
    if (lowercasePrompt.includes('goal')) {
      const matchNum = lowercasePrompt.match(/(\d+)/);
      if (matchNum && matchNum[1]) {
        const targetVal = parseInt(matchNum[1]);
        if (lowercasePrompt.includes('sub')) {
          get().updateGoalValue('subscriber', 'set', targetVal);
          responseText = `Subscriber Goal updated to: ${targetVal}`;
        } else if (lowercasePrompt.includes('dono') || lowercasePrompt.includes('donation')) {
          get().updateGoalValue('donation', 'set', targetVal);
          responseText = `Donation Goal updated to: ${targetVal}`;
        }
      }
    }

    const assistantMsg: AIChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: Date.now()
    };

    set(state => ({
      aiMessages: [...state.aiMessages, userMsg, assistantMsg]
    }));
  },

  // Loader sync trigger from separate tabs
  loadStateFromLocal: (newState) => {
    set(state => ({
      ...state,
      ...newState
    }));
  }
}));
