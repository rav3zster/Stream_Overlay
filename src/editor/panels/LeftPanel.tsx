import React, { useState, useMemo, useCallback } from 'react';
import {
  Tv, Layers, PlusCircle, FolderOpen, Sparkles, Palette, Settings,
  Search, Trash2, Eye, EyeOff, Lock, Unlock, Upload,
  ChevronRight, ChevronDown, Check, FolderPlus, Radio,
  Play, Pause, RotateCcw, Copy
} from 'lucide-react';
import { useEditorStore, type DraftWidget, type WidgetType } from '../../store/editorStore';
import { useLiveStore, type ThemeType } from '../../store/liveStore';
import { useSessionStore } from '../../store/sessionStore';
import { CANVAS_W, CANVAS_H } from '../canvas/EditorCanvas';

// ─── Types & Mock data for sidebar panels ──────────────────────────────────────

type SidebarTab = 'scenes' | 'layers' | 'widgets' | 'assets' | 'presets' | 'themes' | 'settings';

interface WidgetDef {
  type: WidgetType;
  label: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultStyle?: Partial<DraftWidget['style']>;
}

const WIDGET_CATALOG: Record<string, WidgetDef[]> = {
  Layout: [
    { type: 'header', label: 'Header', icon: '▬', defaultWidth: 1920, defaultHeight: 80, defaultStyle: { background: 'rgba(14,8,26,0.9)', borderSize: 0, padding: 16 } },
    { type: 'footer', label: 'Footer', icon: '▬', defaultWidth: 1920, defaultHeight: 60, defaultStyle: { background: 'rgba(14,8,26,0.9)', borderSize: 0, padding: 12 } },
    { type: 'sidebar', label: 'Sidebar', icon: '▏', defaultWidth: 320, defaultHeight: 1080, defaultStyle: { background: 'rgba(14,8,26,0.8)', borderSize: 0, padding: 16 } },
    { type: 'container', label: 'Container', icon: '□', defaultWidth: 400, defaultHeight: 300, defaultStyle: { background: 'rgba(14,8,26,0.5)', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)', borderRadius: 12 } },
    { type: 'background', label: 'Background', icon: '🎨', defaultWidth: 1920, defaultHeight: 1080, defaultStyle: { background: 'linear-gradient(135deg,#0e0b1e,#1a1538)', borderSize: 0 } },
    { type: 'glass-panel', label: 'Glass Panel', icon: '🪟', defaultWidth: 400, defaultHeight: 280, defaultStyle: { background: 'rgba(255,255,255,0.05)', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, glassEffect: true } },
    { type: 'divider', label: 'Divider', icon: '─', defaultWidth: 400, defaultHeight: 2, defaultStyle: { background: 'rgba(168,85,247,0.4)', borderSize: 0 } },
    { type: 'spacer', label: 'Spacer', icon: '⬜', defaultWidth: 100, defaultHeight: 100, defaultStyle: { background: 'transparent', borderSize: 0 } },
  ],
  Text: [
    { type: 'text', label: 'Simple Text', icon: '✏️', defaultWidth: 300, defaultHeight: 60, defaultStyle: { background: 'transparent', borderSize: 0, fontSize: 28, fontColor: '#ffffff', textAlign: 'center' } },
    { type: 'animated-text', label: 'Animated Text', icon: '✨', defaultWidth: 400, defaultHeight: 80, defaultStyle: { background: 'transparent', borderSize: 0, fontSize: 36, fontColor: '#a855f7', textAlign: 'center' } },
    { type: 'scrolling-text', label: 'Scrolling Text', icon: '📜', defaultWidth: 1920, defaultHeight: 48, defaultStyle: { background: 'rgba(14,8,26,0.8)', borderSize: 0, fontSize: 18, fontColor: '#5cffe2', padding: 12 } },
    { type: 'typing-text', label: 'Typing Text', icon: '⌨️', defaultWidth: 400, defaultHeight: 60, defaultStyle: { background: 'transparent', borderSize: 0, fontSize: 28, fontColor: '#ffffff', textAlign: 'center' } },
    { type: 'now-playing-text', label: 'Now Playing', icon: '🎵', defaultWidth: 350, defaultHeight: 60, defaultStyle: { background: 'rgba(14,8,26,0.7)', borderRadius: 8, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'latest-follower', label: 'Latest Follower', icon: '❤️', defaultWidth: 300, defaultHeight: 56, defaultStyle: { background: 'rgba(14,8,26,0.7)', borderRadius: 8, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'latest-subscriber', label: 'Latest Subscriber', icon: '⭐', defaultWidth: 300, defaultHeight: 56, defaultStyle: { background: 'rgba(14,8,26,0.7)', borderRadius: 8, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'latest-donation', label: 'Latest Donation', icon: '💰', defaultWidth: 300, defaultHeight: 56, defaultStyle: { background: 'rgba(14,8,26,0.7)', borderRadius: 8, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'viewer-count', label: 'Viewer Count', icon: '👁', defaultWidth: 160, defaultHeight: 60, defaultStyle: { background: 'rgba(14,8,26,0.7)', borderRadius: 8, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'countdown-timer', label: 'Countdown Timer', icon: '⏱', defaultWidth: 500, defaultHeight: 140, defaultStyle: { background: 'rgba(14,8,26,0.8)', borderRadius: 12, padding: 20, borderSize: 1, borderStyle: 'solid', borderColor: '#a855f7', glowColor: '#ff4dff', glowBlur: 20, fontSize: 72, fontColor: '#5cffe2', textAlign: 'center' } },
    { type: 'clock', label: 'Clock', icon: '🕐', defaultWidth: 200, defaultHeight: 60, defaultStyle: { background: 'transparent', borderSize: 0, fontSize: 32, fontColor: '#ffffff', textAlign: 'center' } },
    { type: 'goal-counter', label: 'Goal Counter', icon: '🎯', defaultWidth: 300, defaultHeight: 80, defaultStyle: { background: 'rgba(14,8,26,0.7)', borderRadius: 8, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'social-links', label: 'Social Links', icon: '🔗', defaultWidth: 280, defaultHeight: 48, defaultStyle: { background: 'transparent', borderSize: 0 } },
  ],
  Media: [
    { type: 'image', label: 'Image', icon: '🖼', defaultWidth: 300, defaultHeight: 200, defaultStyle: { borderRadius: 8, background: 'rgba(168,85,247,0.1)', borderSize: 1, borderStyle: 'dashed', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'gif', label: 'GIF', icon: '🎞', defaultWidth: 300, defaultHeight: 200, defaultStyle: { borderRadius: 8, background: 'rgba(168,85,247,0.1)', borderSize: 1, borderStyle: 'dashed', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'video', label: 'Video', icon: '📹', defaultWidth: 480, defaultHeight: 270, defaultStyle: { borderRadius: 8, background: '#000' } },
    { type: 'lottie', label: 'Lottie', icon: '🌀', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'svg', label: 'SVG', icon: '▲', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'logo', label: 'Logo', icon: '⚡', defaultWidth: 160, defaultHeight: 80, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'avatar-frame', label: 'Avatar Frame', icon: '🧑', defaultWidth: 160, defaultHeight: 160, defaultStyle: { borderRadius: 80, borderSize: 3, borderStyle: 'solid', borderColor: '#a855f7', glowColor: '#a855f7', glowBlur: 16 } },
    { type: 'camera-frame', label: 'Camera Frame', icon: '📷', defaultWidth: 400, defaultHeight: 300, defaultStyle: { borderRadius: 8, borderSize: 2, borderStyle: 'solid', borderColor: '#a855f7', glowColor: '#ff4dff', glowBlur: 12 } },
    { type: 'game-capture', label: 'Game Capture', icon: '🎮', defaultWidth: 800, defaultHeight: 450, defaultStyle: { borderRadius: 8, background: '#000', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'vtuber', label: 'VTuber Layer', icon: '🎭', defaultWidth: 400, defaultHeight: 600, defaultStyle: { background: 'transparent', borderSize: 0 } },
  ],
  'Stream': [
    { type: 'chat-box', label: 'Chat Box', icon: '💬', defaultWidth: 340, defaultHeight: 600, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'donation-feed', label: 'Donation Feed', icon: '💸', defaultWidth: 340, defaultHeight: 400, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'follower-feed', label: 'Follower Feed', icon: '💝', defaultWidth: 340, defaultHeight: 300, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'event-list', label: 'Event List', icon: '📋', defaultWidth: 340, defaultHeight: 400, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'spotify', label: 'Spotify', icon: '🎵', defaultWidth: 360, defaultHeight: 90, defaultStyle: { background: 'rgba(0,0,0,0.5)', borderRadius: 45, padding: 16, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'alerts', label: 'Alert Box', icon: '🔔', defaultWidth: 600, defaultHeight: 200, defaultStyle: { background: 'transparent', borderSize: 0 } },
  ],
  Decorative: [
    { type: 'shape', label: 'Shape', icon: '⬛', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'rgba(168,85,247,0.3)', borderRadius: 0, borderSize: 0 } },
    { type: 'neon-card', label: 'Neon Card', icon: '💠', defaultWidth: 320, defaultHeight: 180, defaultStyle: { background: 'rgba(14,8,26,0.8)', borderRadius: 12, borderSize: 1, borderStyle: 'solid', borderColor: '#ff4dff', glowColor: '#ff4dff', glowBlur: 24 } },
    { type: 'glass-card', label: 'Glass Card', icon: '🪟', defaultWidth: 320, defaultHeight: 180, defaultStyle: { background: 'rgba(255,255,255,0.04)', borderRadius: 16, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.12)', glassEffect: true } },
    { type: 'glow-effect', label: 'Glow Effect', icon: '💫', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'radial-gradient(circle,rgba(168,85,247,0.4) 0%,transparent 70%)', borderSize: 0 } },
    { type: 'particles', label: 'Particles', icon: '✦', defaultWidth: 600, defaultHeight: 400, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'line', label: 'Line', icon: '─', defaultWidth: 400, defaultHeight: 2, defaultStyle: { background: 'rgba(168,85,247,0.5)', borderSize: 0, glowColor: '#a855f7', glowBlur: 8 } },
    { type: 'badge', label: 'Badge', icon: '🏅', defaultWidth: 140, defaultHeight: 40, defaultStyle: { background: 'rgba(168,85,247,0.2)', borderRadius: 99, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.5)', fontSize: 13, fontColor: '#a855f7', textAlign: 'center', padding: 8 } },
  ],
};

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'gif' | 'video' | 'lottie' | 'svg' | 'logo';
  url: string;
  size: number;
}

const MOCK_ASSETS: Asset[] = [
  { id: 'asset-1', name: 'overlay_bg.png', type: 'image', url: '', size: 248000 },
  { id: 'asset-2', name: 'alert_wave.gif', type: 'gif', url: '', size: 1200000 },
  { id: 'asset-3', name: 'subscribe.mp4', type: 'video', url: '', size: 4500000 },
  { id: 'asset-4', name: 'logo_white.svg', type: 'svg', url: '', size: 12000 },
];

interface PresetWidgetDef {
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: Record<string, any>;
  content?: Record<string, any>;
}

interface PresetDef {
  id: string;
  name: string;
  category: string;
  colors: string[];
  desc: string;
  widgets: PresetWidgetDef[];
}

const PRESETS: PresetDef[] = [
  {
    id: 'cyber-synth-starting',
    name: 'Cyber Synth (Starting Soon)',
    category: 'Starting Soon',
    colors: ['#07050f', '#ff4dff', '#5cffe2'],
    desc: 'Neon grid theme with countdown timer, clock, and scrolling ticker',
    widgets: [
      {
        type: 'background',
        label: 'Cyber BG',
        x: 0, y: 0, width: 1920, height: 1080,
        style: { background: 'linear-gradient(135deg, #07050f 0%, #140526 100%)', borderSize: 0 }
      },
      {
        type: 'glass-panel',
        label: 'Frosted Glass Center',
        x: 560, y: 340, width: 800, height: 400,
        style: { background: 'rgba(20,10,38,0.7)', borderRadius: 24, borderSize: 2, borderColor: '#ff4dff', glowColor: '#ff4dff', glowBlur: 20, glassEffect: true }
      },
      {
        type: 'countdown-timer',
        label: 'Starting Countdown',
        x: 610, y: 440, width: 700, height: 180,
        style: { background: 'transparent', borderSize: 0, fontSize: 84, fontColor: '#5cffe2', glowColor: '#5cffe2', glowBlur: 16, fontFamily: 'Space Grotesk' },
        content: { type: 'countdown-timer', settings: { duration: 600, label: 'STARTING IN' } }
      },
      {
        type: 'text',
        label: 'Header Status Text',
        x: 760, y: 380, width: 400, height: 50,
        style: { background: 'transparent', borderSize: 0, fontSize: 24, fontColor: '#ffffff', fontFamily: 'Space Grotesk', fontWeight: '800', textAlign: 'center' },
        content: { type: 'text', settings: { text: 'STREAM STARTING SOON' } }
      },
      {
        type: 'clock',
        label: 'Local Clock Widget',
        x: 1620, y: 40, width: 260, height: 60,
        style: { background: 'rgba(14,8,26,0.8)', borderRadius: 12, borderSize: 1, borderColor: '#5cffe2', fontSize: 20, fontColor: '#ffffff', padding: 12 },
        content: { type: 'clock', settings: {} }
      },
      {
        type: 'scrolling-text',
        label: 'Footer Scrolling Ticker',
        x: 0, y: 1020, width: 1920, height: 60,
        style: { background: 'rgba(7,5,15,0.95)', borderSize: 0, fontSize: 18, fontColor: '#5cffe2', padding: 16, borderStyle: 'solid', borderColor: '#ff4dff' },
        content: { type: 'scrolling-text', settings: { text: '⚡ WELCOME TO THE STREAM! • BE COZY AND COMPLY WITH CHAT RULES • FOLLOW TO PARTICIPATE IN GIVAWAYS • NOW PLAYING: CHILL SYNTHWAVE MIX ⚡' } }
      }
    ]
  },
  {
    id: 'cozy-just-chatting',
    name: 'Cozy Just Chatting',
    category: 'Just Chatting',
    colors: ['#2e1f2f', '#f9a8d4', '#c084fc'],
    desc: 'Soft pink/purple theme with webcam box and live chat stream',
    widgets: [
      {
        type: 'background',
        label: 'Cozy Ambient BG',
        x: 0, y: 0, width: 1920, height: 1080,
        style: { background: 'linear-gradient(135deg, #1b0e1a 0%, #2f1934 100%)', borderSize: 0 }
      },
      {
        type: 'camera-frame',
        label: 'Webcam Border Frame',
        x: 80, y: 140, width: 1120, height: 630,
        style: { borderRadius: 16, borderSize: 4, borderColor: '#ff80b5', glowColor: '#ff80b5', glowBlur: 16 }
      },
      {
        type: 'chat-box',
        label: 'Chat Box Frame',
        x: 1260, y: 140, width: 580, height: 800,
        style: { background: 'rgba(27,14,26,0.8)', borderRadius: 16, borderSize: 1, borderColor: '#c084fc', padding: 16 }
      },
      {
        type: 'spotify',
        label: 'Cozy Music Feed',
        x: 80, y: 810, width: 420, height: 100,
        style: { background: 'rgba(255,255,255,0.05)', borderRadius: 50, padding: 16, borderSize: 1, borderColor: 'rgba(255,255,255,0.1)' }
      },
      {
        type: 'social-links',
        label: 'Streamer Social Handles',
        x: 540, y: 840, width: 660, height: 60,
        style: { background: 'transparent', borderSize: 0 }
      }
    ]
  },
  {
    id: 'esports-gameplay',
    name: 'Esports Tournament HUD',
    category: 'Gameplay',
    colors: ['#020617', '#3b82f6', '#ef4444'],
    desc: 'High contrast esports hud with game frames and new sub feeds',
    widgets: [
      {
        type: 'header',
        label: 'Tournament Bar HUD',
        x: 0, y: 0, width: 1920, height: 50,
        style: { background: '#020617', borderSize: 0, padding: 12 }
      },
      {
        type: 'text',
        label: 'Championship Header Title',
        x: 100, y: 10, width: 600, height: 30,
        style: { background: 'transparent', borderSize: 0, fontSize: 16, fontColor: '#3b82f6', fontWeight: '900', fontFamily: 'Space Grotesk' },
        content: { type: 'text', settings: { text: 'ESPORTS CHAMPIONSHIP LIVE' } }
      },
      {
        type: 'camera-frame',
        label: 'Esports Web Cam Frame',
        x: 1540, y: 70, width: 340, height: 255,
        style: { borderRadius: 4, borderSize: 2, borderColor: '#ef4444' }
      },
      {
        type: 'latest-follower',
        label: 'Recent Follower Ticker',
        x: 40, y: 980, width: 320, height: 60,
        style: { background: '#020617', borderRadius: 6, padding: 12, borderSize: 1, borderColor: '#3b82f6' }
      },
      {
        type: 'latest-subscriber',
        label: 'Recent Subscriber Ticker',
        x: 380, y: 980, width: 320, height: 60,
        style: { background: '#020617', borderRadius: 6, padding: 12, borderSize: 1, borderColor: '#3b82f6' }
      }
    ]
  }
];

const THEMES = [
  { id: 'cyber-synth', name: 'Cyber Synth', category: 'Dark', colors: ['#07050f', '#ff4dff', '#5cffe2'], desc: 'Magenta & cyan neon' },
  { id: 'glassmorphism', name: 'Glassmorphism', category: 'Premium', colors: ['#1a1035', '#a855f7', '#ec4899'], desc: 'Backdrop frosted glass' },
  { id: 'minimal-dark', name: 'Minimal Dark', category: 'Minimal', colors: ['#111111', '#888888', '#ffffff'], desc: 'Clean absolute grey scale' },
  { id: 'mclaren', name: 'McLaren Racing', category: 'Racing', colors: ['#0f0f0f', '#ff6600', '#00a19c'], desc: 'Papaya racing orange' },
  { id: 'porsche-gulf', name: 'Porsche Gulf', category: 'Racing', colors: ['#1a3a6e', '#f5831f', '#87ceeb'], desc: 'Iconic light blue & orange' },
];

const WIDGET_ICONS: Record<string, string> = {
  'countdown-timer': '⏱', 'chat-box': '💬', 'spotify': '🎵', 'alerts': '🔔',
  'goals': '🎯', 'event-list': '📋', 'image': '🖼', 'video': '📹', 'text': '✏️',
  'animated-text': '✨', 'scrolling-text': '📜', 'vtuber': '🎭', 'camera-frame': '📷',
  'shape': '⬛', 'glass-card': '🪟', 'neon-card': '💠', 'badge': '🏅',
  'viewer-count': '👁', 'clock': '🕐', 'container': '□', 'background': '🎨',
  'glass-panel': '🪟', 'particles': '✦', 'logo': '⚡', 'header': '▬',
  'latest-follower': '❤️', 'latest-subscriber': '⭐', 'donation-feed': '💰',
  'weather': '🌤', 'poll': '📊', 'social-links': '🔗', 'gif': '🎞',
};

// Helper function to build fresh DraftWidget values
const createWidgetObject = (def: WidgetDef, x?: number, y?: number): DraftWidget => {
  const { getDraftWidgets } = useEditorStore.getState();
  const widgets = getDraftWidgets();
  const maxZ = widgets.reduce((mx, w) => Math.max(mx, w.zIndex), 0);
  const id = `widget-${crypto.randomUUID()}`;

  return {
    id,
    type: def.type,
    label: def.label,
    x: x ?? Math.round((CANVAS_W - def.defaultWidth) / 2),
    y: y ?? Math.round((CANVAS_H - def.defaultHeight) / 2),
    width: def.defaultWidth,
    height: def.defaultHeight,
    w: def.defaultWidth,
    h: def.defaultHeight,
    rotation: 0,
    opacity: 100,
    scale: 1,
    zIndex: maxZ + 1,
    visible: true,
    locked: false,
    style: {
      borderRadius: 8,
      background: 'rgba(14,8,26,0.8)',
      borderSize: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(168,85,247,0.4)',
      padding: 12,
      textAlign: 'center',
      ...(def.defaultStyle ?? {}),
    },
    animation: { type: 'none', duration: 1, delay: 0, loop: false },
    content: { type: def.type, settings: {} },
  };
};

export const LeftPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('scenes');

  const { scenes, editingSceneId, setEditingScene } = useEditorStore();
  const { createScene, deleteScene } = useSessionStore();
  const { theme: activeTheme, setTheme } = useLiveStore();

  const handleAddScene = async () => {
    const name = prompt('Scene name (e.g. "gameplay"):');
    if (!name) return;
    const label = prompt('Scene label (e.g. "🎮 Gameplay"):') ?? name;
    await createScene(name, label);
  };

  const handleTabClick = (tab: SidebarTab) => {
    setActiveTab(prev => prev === tab ? 'scenes' : tab); // scenes is default fallback
  };

  return (
    <div style={{ display: 'flex', height: '100%', borderRight: '1px solid var(--color-border)', flexShrink: 0 }}>
      {/* 1. Left Vertical Nav Icons Column */}
      <div style={{
        width: 60,
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
        gap: 16,
        borderRight: '1px solid var(--color-border)',
        zIndex: 5
      }}>
        {/* Logo */}
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)', marginBottom: 8, color: '#fff'
        }}>
          ⚡
        </div>

        {/* Tab triggers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', alignItems: 'center' }}>
          {(['scenes', 'layers', 'widgets', 'assets', 'presets', 'themes', 'settings'] as SidebarTab[]).map(tab => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                data-tooltip={label}
                className="sidebar-btn"
                style={{
                  width: 44, height: 44, borderRadius: 8,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(168,85,247,0.15)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-text-3)',
                  border: `1px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                  cursor: 'pointer', gap: 3
                }}
              >
                {tab === 'scenes' && <Tv size={16} />}
                {tab === 'layers' && <Layers size={16} />}
                {tab === 'widgets' && <PlusCircle size={16} />}
                {tab === 'assets' && <FolderOpen size={16} />}
                {tab === 'presets' && <Sparkles size={16} />}
                {tab === 'themes' && <Palette size={16} />}
                {tab === 'settings' && <Settings size={16} />}
                <span style={{ fontSize: 8, fontWeight: 700 }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* OBS Output Link at the bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, width: '100%', alignItems: 'center', paddingBottom: 8 }}>
          <div style={{ width: 32, height: 1, background: 'var(--color-border)', marginBottom: 4 }} />
          <button
            onClick={() => window.open('/obs', '_blank')}
            data-tooltip="Open OBS Output"
            className="sidebar-btn"
            style={{
              width: 44, height: 44, borderRadius: 8,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer', gap: 3
            }}
          >
            <Tv size={16} />
            <span style={{ fontSize: 8, fontWeight: 700 }}>Output</span>
          </button>
        </div>
      </div>

      {/* 2. Expanded Navigation Panel */}
      <div className="left-panel" style={{ width: 260, borderRight: 'none', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'scenes' && (
          <ScenesTabContent scenes={scenes} editingSceneId={editingSceneId} setEditingScene={setEditingScene} onAddScene={handleAddScene} onDeleteScene={deleteScene} />
        )}
        {activeTab === 'layers' && (
          <LayersTabContent />
        )}
        {activeTab === 'widgets' && (
          <WidgetsTabContent />
        )}
        {activeTab === 'assets' && (
          <AssetsTabContent />
        )}
        {activeTab === 'presets' && (
          <PresetsTabContent />
        )}
        {activeTab === 'themes' && (
          <ThemesTabContent activeTheme={activeTheme} setTheme={setTheme} />
        )}
        {activeTab === 'settings' && (
          <SettingsTabContent />
        )}
      </div>
    </div>
  );
};

// ─── Sub-Tab: Scenes List ──────────────────────────────────────────────────────

interface ScenesTabProps {
  scenes: any[];
  editingSceneId: string | null;
  setEditingScene: (id: string) => void;
  onAddScene: () => void;
  onDeleteScene: (id: string) => void;
}

const ScenesTabContent: React.FC<ScenesTabProps> = ({ scenes, editingSceneId, setEditingScene, onAddScene, onDeleteScene }) => {
  const { liveSceneId } = useLiveStore();
  return (
    <>
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center' }}>
        <span className="panel-title" style={{ flex: 1 }}>Scenes</span>
        <button className="btn-icon" onClick={onAddScene} style={{ width: 24, height: 24 }} data-tooltip="New Scene">
          <FolderPlus size={13} />
        </button>
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {scenes.map(s => {
          const isActive = s.id === editingSceneId;
          const isLive = s.id === liveSceneId;
          return (
            <div
              key={s.id}
              onClick={() => setEditingScene(s.id)}
              className={`scene-item${isActive ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', position: 'relative' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span className="truncate" style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: '#fff' }}>{s.label}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isLive && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: 8, fontWeight: 900, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em' }}>
                    LIVE
                  </span>
                )}
                {scenes.length > 1 && (
                  <button
                    className="btn-icon text-red-500"
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete scene "${s.label}"?`)) onDeleteScene(s.id); }}
                    style={{ width: 22, height: 22 }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Sub-Tab: Layers List ──────────────────────────────────────────────────────

const LayersTabContent: React.FC = () => {
  const { getDraftWidgets, selectedIds, selectWidget, updateWidget, removeWidget } = useEditorStore();
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const widgets = useMemo(() => {
    return [...getDraftWidgets()].sort((a, b) => b.zIndex - a.zIndex);
  }, [getDraftWidgets]);

  const filtered = useMemo(() => {
    return widgets.filter(w => w.label.toLowerCase().includes(search.toLowerCase()));
  }, [widgets, search]);

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Group calculations
  const groupedData = useMemo(() => {
    const rootItems: (DraftWidget | { isGroup: true; groupId: string; widgets: DraftWidget[] })[] = [];
    const processedGroups = new Set<string>();

    filtered.forEach(w => {
      if (w.groupId) {
        if (!processedGroups.has(w.groupId)) {
          processedGroups.add(w.groupId);
          const groupWidgets = filtered.filter(item => item.groupId === w.groupId);
          rootItems.push({
            isGroup: true,
            groupId: w.groupId,
            widgets: groupWidgets
          });
        }
      } else {
        rootItems.push(w);
      }
    });

    return rootItems;
  }, [filtered]);

  return (
    <>
      <div className="panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, height: 'auto', padding: '12px' }}>
        <span className="panel-title">Layers</span>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            placeholder="Search layers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 24, fontSize: 11 }}
          />
        </div>
      </div>

      <div className="panel-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {groupedData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: 11 }}>No layers found</div>
        ) : groupedData.map((item, index) => {
          if ('isGroup' in item) {
            const gId = item.groupId;
            const isCollapsed = collapsedGroups[gId] ?? false;
            const allLocked = item.widgets.every(w => w.locked);
            const allVisible = item.widgets.some(w => w.visible);

            return (
              <div key={gId} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Group Row header */}
                <div
                  className="layer-item"
                  style={{ fontWeight: 700, background: 'var(--color-surface-2)', padding: '6px 8px' }}
                  onClick={() => selectWidget(item.widgets[0]?.id, false)}
                >
                  <button
                    className="btn-icon" style={{ width: 16, height: 16, padding: 0 }}
                    onClick={(e) => { e.stopPropagation(); toggleGroupCollapse(gId); }}
                  >
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <span style={{ fontSize: 11, color: '#fff', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    📁 Group ({item.widgets.length})
                  </span>
                  <div className="layer-item-actions">
                    <button
                      className="btn-icon" style={{ width: 20, height: 20 }}
                      onClick={(e) => { e.stopPropagation(); item.widgets.forEach(w => updateWidget(w.id, { visible: !allVisible })); }}
                    >
                      {allVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                    </button>
                    <button
                      className="btn-icon" style={{ width: 20, height: 20 }}
                      onClick={(e) => { e.stopPropagation(); item.widgets.forEach(w => updateWidget(w.id, { locked: !allLocked })); }}
                    >
                      {allLocked ? <Lock size={10} /> : <Unlock size={10} />}
                    </button>
                  </div>
                </div>

                {/* Group children */}
                {!isCollapsed && (
                  <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', borderLeft: '1px dashed var(--color-border)', marginLeft: 8 }}>
                    {item.widgets.map(widget => {
                      const isSelected = selectedIds.includes(widget.id);
                      return (
                        <LayerRow
                          key={widget.id}
                          widget={widget}
                          isSelected={isSelected}
                          onSelect={selectWidget}
                          onUpdate={updateWidget}
                          onRemove={removeWidget}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            const isSelected = selectedIds.includes(item.id);
            return (
              <LayerRow
                key={item.id}
                widget={item}
                isSelected={isSelected}
                onSelect={selectWidget}
                onUpdate={updateWidget}
                onRemove={removeWidget}
              />
            );
          }
        })}
      </div>
    </>
  );
};

interface LayerRowProps {
  widget: DraftWidget;
  isSelected: boolean;
  onSelect: (id: string, add: boolean) => void;
  onUpdate: (id: string, updates: Partial<DraftWidget>) => void;
  onRemove: (id: string) => void;
}

const LayerRow: React.FC<LayerRowProps> = ({ widget, isSelected, onSelect, onUpdate, onRemove }) => {
  return (
    <div
      className={`layer-item${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(widget.id, false)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 4 }}
    >
      <span style={{ fontSize: 11 }}>{WIDGET_ICONS[widget.type] ?? '⬛'}</span>
      <span className="layer-item-label" style={{ flex: 1, fontSize: 11 }}>{widget.label}</span>
      <div className="layer-item-actions">
        <button
          className="btn-icon" style={{ width: 18, height: 18 }}
          onClick={(e) => { e.stopPropagation(); onUpdate(widget.id, { visible: !widget.visible }); }}
        >
          {widget.visible ? <Eye size={10} /> : <EyeOff size={10} />}
        </button>
        <button
          className="btn-icon" style={{ width: 18, height: 18 }}
          onClick={(e) => { e.stopPropagation(); onUpdate(widget.id, { locked: !widget.locked }); }}
        >
          {widget.locked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
        <button
          className="btn-icon text-red-500" style={{ width: 18, height: 18 }}
          onClick={(e) => { e.stopPropagation(); onRemove(widget.id); }}
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
};

// ─── Sub-Tab: Widget Library ──────────────────────────────────────────────────

const WidgetsTabContent: React.FC = () => {
  const { addWidget, editingSceneId } = useEditorStore();
  const [search, setSearch] = useState('');

  const handleAddWidget = (def: WidgetDef) => {
    if (!editingSceneId) return;
    const newWidget = createWidgetObject(def);
    addWidget(newWidget);
  };

  const categories = Object.keys(WIDGET_CATALOG);

  return (
    <>
      <div className="panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, height: 'auto', padding: '12px' }}>
        <span className="panel-title">Widget Library</span>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            placeholder="Search widgets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 24, fontSize: 11 }}
          />
        </div>
      </div>

      <div className="panel-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.map(cat => {
          const items = WIDGET_CATALOG[cat].filter(w => w.label.toLowerCase().includes(search.toLowerCase()));
          if (items.length === 0) return null;
          return (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                {cat}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {items.map(def => (
                  <div
                    key={def.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/react-flow', JSON.stringify({ source: 'widget', payload: def }));
                    }}
                    onClick={() => handleAddWidget(def)}
                    className="widget-card"
                    style={{
                      padding: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 4, cursor: 'grab', transition: 'all var(--transition-base)'
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{def.icon}</span>
                    <span style={{ fontSize: 9, color: 'var(--color-text-2)', textAlign: 'center', fontWeight: 600 }}>{def.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Sub-Tab: Asset Manager ────────────────────────────────────────────────────

const AssetsTabContent: React.FC = () => {
  const { addWidget, editingSceneId } = useEditorStore();
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newAssets = Array.from(e.target.files).map((f, i) => {
      const type: Asset['type'] = f.type.includes('image') ? 'image' : f.type.includes('gif') ? 'gif' : 'video';
      return {
        id: `uploaded-${Date.now()}-${i}`,
        name: f.name,
        type,
        url: URL.createObjectURL(f),
        size: f.size
      };
    });
    setAssets(prev => [...newAssets, ...prev]);
  };

  const handleAddAsset = (asset: Asset) => {
    if (!editingSceneId) return;
    const def: WidgetDef = {
      type: asset.type === 'gif' ? 'gif' : asset.type === 'video' ? 'video' : 'image',
      label: asset.name,
      icon: '🖼',
      defaultWidth: 400,
      defaultHeight: 250,
      defaultStyle: { background: 'transparent' }
    };
    const newWidget = createWidgetObject(def);
    newWidget.content = {
      type: def.type,
      settings: { url: asset.url }
    };
    addWidget(newWidget);
  };

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">Assets</span>
      </div>
      <div className="panel-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Upload box */}
        <div
          className={`upload-zone${isDragOver ? ' drag-over' : ''}`}
          style={{ padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '2px dashed var(--color-border)', cursor: 'pointer' }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => {
            e.preventDefault(); setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const file = e.dataTransfer.files[0];
              const type: Asset['type'] = file.type.includes('image') ? 'image' : 'video';
              const newAsset: Asset = { id: `drop-${Date.now()}`, name: file.name, type, url: URL.createObjectURL(file), size: file.size };
              setAssets(prev => [newAsset, ...prev]);
            }
          }}
          onClick={() => document.getElementById('asset-file-picker')?.click()}
        >
          <Upload size={20} color="var(--color-text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-2)' }}>Upload File</span>
          <span style={{ fontSize: 8, color: 'var(--color-text-muted)' }}>Drag files here</span>
          <input id="asset-file-picker" type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>

        {/* Assets List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {assets.map(asset => (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/react-flow', JSON.stringify({ source: 'asset', payload: asset }));
              }}
              onClick={() => handleAddAsset(asset)}
              className="asset-card"
              style={{
                background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                cursor: 'grab'
              }}
            >
              <div style={{ height: 60, background: 'var(--color-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {asset.type === 'image' && '🖼'}
                {asset.type === 'gif' && '🎞'}
                {asset.type === 'video' && '📹'}
                {asset.type === 'svg' && '▲'}
              </div>
              <div style={{ padding: 4, fontSize: 9, color: 'var(--color-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {asset.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ─── Sub-Tab: Presets ─────────────────────────────────────────────────────────

const PresetsTabContent: React.FC = () => {
  const { editingSceneId } = useEditorStore();

  const handleUsePreset = (preset: PresetDef) => {
    if (!editingSceneId) return;
    if (!confirm(`Apply layout template "${preset.name}" to this scene? This will replace all existing widgets.`)) return;

    useEditorStore.getState().pushHistory();

    const newWidgets = preset.widgets.map((pWidget, idx) => {
      const id = `widget-${crypto.randomUUID()}`;
      return {
        id,
        type: pWidget.type as WidgetType,
        label: pWidget.label,
        x: pWidget.x,
        y: pWidget.y,
        width: pWidget.width,
        height: pWidget.height,
        w: pWidget.width,
        h: pWidget.height,
        rotation: 0,
        opacity: 100,
        scale: 1,
        zIndex: idx + 1,
        visible: true,
        locked: false,
        style: {
          borderRadius: 8,
          background: 'rgba(14,8,26,0.8)',
          borderSize: 1,
          borderStyle: 'solid',
          borderColor: 'rgba(168,85,247,0.4)',
          padding: 12,
          textAlign: 'center',
          ...(pWidget.style ?? {}),
        } as any,
        animation: { type: 'none', duration: 1, delay: 0, loop: false } as any,
        content: pWidget.content ?? { type: pWidget.type, settings: {} },
      } as any;
    });

    useEditorStore.setState(s => ({
      scenes: s.scenes.map(sc => sc.id === editingSceneId ? { ...sc, widgets: newWidgets } : sc),
      selectedIds: [],
    }));
  };

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">Presets</span>
      </div>
      <div className="panel-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PRESETS.map(preset => (
          <div
            key={preset.id}
            className="preset-card"
            style={{
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 8
            }}
          >
            <div style={{
              height: 50, borderRadius: 4,
              background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 60%, ${preset.colors[2]} 100%)`
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preset.name}</span>
                <span style={{ fontSize: 8, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preset.desc}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, flexShrink: 0, marginLeft: 8 }}
                onClick={() => handleUsePreset(preset)}
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ─── Sub-Tab: Themes list ──────────────────────────────────────────────────────

interface ThemesTabProps {
  activeTheme: ThemeType;
  setTheme: (t: ThemeType) => void;
}

const ThemesTabContent: React.FC<ThemesTabProps> = ({ activeTheme, setTheme }) => {
  return (
    <>
      <div className="panel-header">
        <span className="panel-title">Themes</span>
      </div>
      <div className="panel-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {THEMES.map(t => {
          const isActive = activeTheme === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setTheme(t.id as ThemeType)}
              className={`theme-card${isActive ? ' active' : ''}`}
              style={{
                background: 'var(--color-surface-2)', border: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                borderRadius: 8, padding: 8, display: 'flex', gap: 8, cursor: 'pointer', alignItems: 'center'
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]}, ${t.colors[2]})`
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{t.name}</span>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</span>
              </div>
              {isActive && <Check size={12} color="var(--color-accent)" style={{ flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Sub-Tab: Channel Settings ─────────────────────────────────────────────────

const SettingsTabContent: React.FC = () => {
  const [streamerName, setStreamerName] = useState('Rave_VT');
  const [streamTitle, setStreamTitle] = useState('Indie Game Night');
  const [activeGame, setActiveGame] = useState('Hollow Knight');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const obsUrl = `${window.location.origin}/obs`;

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">Settings</span>
      </div>
      <div className="panel-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stream Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="input-group">
            <span className="input-group-label" style={{ fontSize: 9 }}>Streamer Name</span>
            <input className="input" style={{ fontSize: 11, padding: '4px 8px' }} value={streamerName} onChange={e => setStreamerName(e.target.value)} />
          </div>
          <div className="input-group">
            <span className="input-group-label" style={{ fontSize: 9 }}>Stream Title</span>
            <input className="input" style={{ fontSize: 11, padding: '4px 8px' }} value={streamTitle} onChange={e => setStreamTitle(e.target.value)} />
          </div>
          <div className="input-group">
            <span className="input-group-label" style={{ fontSize: 9 }}>Active Game</span>
            <input className="input" style={{ fontSize: 11, padding: '4px 8px' }} value={activeGame} onChange={e => setActiveGame(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: 11, height: 28, marginTop: 4 }}>
            {saved ? 'Saved!' : 'Save Stream Info'}
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />

        {/* OBS Setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>OBS Setup</span>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Copy link as Browser Source in OBS:</span>
          <div style={{
            background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
            borderRadius: 6, padding: 6, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4
          }}>
            <code className="truncate" style={{ fontSize: 8, color: 'var(--color-cyan)', flex: 1, fontFamily: 'monospace' }}>{obsUrl}</code>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 9, padding: '2px 6px', height: 20 }}
              onClick={() => { navigator.clipboard.writeText(obsUrl); alert('OBS link copied to clipboard!'); }}
              data-tooltip="Copy OBS Link"
            >
              <Copy size={9} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 9, padding: '2px 6px', height: 20 }}
              onClick={() => window.open('/obs', '_blank')}
              data-tooltip="Open OBS Output"
            >
              <Tv size={9} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
