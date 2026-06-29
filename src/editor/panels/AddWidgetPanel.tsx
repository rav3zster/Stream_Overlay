import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { useEditorStore, type DraftWidget, type WidgetType } from '../../store/editorStore';
import { CANVAS_W, CANVAS_H } from '../canvas/EditorCanvas';

// ─── Widget catalog ───────────────────────────────────────────────────────────

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
    { type: 'lottie', label: 'Lottie Animation', icon: '🌀', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'svg', label: 'SVG', icon: '▲', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'logo', label: 'Logo', icon: '⚡', defaultWidth: 160, defaultHeight: 80, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'avatar-frame', label: 'Avatar Frame', icon: '🧑', defaultWidth: 160, defaultHeight: 160, defaultStyle: { borderRadius: 80, borderSize: 3, borderStyle: 'solid', borderColor: '#a855f7', glowColor: '#a855f7', glowBlur: 16 } },
    { type: 'camera-frame', label: 'Camera Frame', icon: '📷', defaultWidth: 400, defaultHeight: 300, defaultStyle: { borderRadius: 8, borderSize: 2, borderStyle: 'solid', borderColor: '#a855f7', glowColor: '#ff4dff', glowBlur: 12 } },
    { type: 'game-capture', label: 'Game Capture', icon: '🎮', defaultWidth: 800, defaultHeight: 450, defaultStyle: { borderRadius: 8, background: '#000', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'vtuber', label: 'VTuber Layer', icon: '🎭', defaultWidth: 400, defaultHeight: 600, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: '3d-model', label: '3D Model', icon: '💎', defaultWidth: 400, defaultHeight: 400, defaultStyle: { background: 'transparent', borderSize: 0 } },
  ],
  'Stream Widgets': [
    { type: 'chat-box', label: 'Chat Box', icon: '💬', defaultWidth: 340, defaultHeight: 600, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'donation-feed', label: 'Donation Feed', icon: '💸', defaultWidth: 340, defaultHeight: 400, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'follower-feed', label: 'Follower Feed', icon: '💝', defaultWidth: 340, defaultHeight: 300, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'subscriber-feed', label: 'Subscriber Feed', icon: '🌟', defaultWidth: 340, defaultHeight: 300, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'event-list', label: 'Event List', icon: '📋', defaultWidth: 340, defaultHeight: 400, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'spotify', label: 'Spotify / Now Playing', icon: '🎵', defaultWidth: 360, defaultHeight: 90, defaultStyle: { background: 'rgba(0,0,0,0.5)', borderRadius: 45, padding: 16, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'alerts', label: 'Alert Box', icon: '🔔', defaultWidth: 600, defaultHeight: 200, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'poll', label: 'Poll', icon: '📊', defaultWidth: 400, defaultHeight: 280, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 16, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'goals', label: 'Goals', icon: '🏆', defaultWidth: 360, defaultHeight: 200, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 16, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'schedule', label: 'Schedule', icon: '📅', defaultWidth: 360, defaultHeight: 300, defaultStyle: { background: 'rgba(14,8,26,0.85)', borderRadius: 12, padding: 16, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
    { type: 'weather', label: 'Weather', icon: '🌤', defaultWidth: 220, defaultHeight: 100, defaultStyle: { background: 'rgba(14,8,26,0.7)', borderRadius: 12, padding: 12, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.3)' } },
  ],
  Decorative: [
    { type: 'shape', label: 'Shape', icon: '⬛', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'rgba(168,85,247,0.3)', borderRadius: 0, borderSize: 0 } },
    { type: 'neon-card', label: 'Neon Card', icon: '💠', defaultWidth: 320, defaultHeight: 180, defaultStyle: { background: 'rgba(14,8,26,0.8)', borderRadius: 12, borderSize: 1, borderStyle: 'solid', borderColor: '#ff4dff', glowColor: '#ff4dff', glowBlur: 24 } },
    { type: 'glass-card', label: 'Glass Card', icon: '🪟', defaultWidth: 320, defaultHeight: 180, defaultStyle: { background: 'rgba(255,255,255,0.04)', borderRadius: 16, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.12)', glassEffect: true } },
    { type: 'glow-effect', label: 'Glow Effect', icon: '💫', defaultWidth: 200, defaultHeight: 200, defaultStyle: { background: 'radial-gradient(circle,rgba(168,85,247,0.4) 0%,transparent 70%)', borderSize: 0 } },
    { type: 'particles', label: 'Particles', icon: '✦', defaultWidth: 600, defaultHeight: 400, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'line', label: 'Line', icon: '─', defaultWidth: 400, defaultHeight: 2, defaultStyle: { background: 'rgba(168,85,247,0.5)', borderSize: 0, glowColor: '#a855f7', glowBlur: 8 } },
    { type: 'badge', label: 'Badge', icon: '🏅', defaultWidth: 140, defaultHeight: 40, defaultStyle: { background: 'rgba(168,85,247,0.2)', borderRadius: 99, borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.5)', fontSize: 13, fontColor: '#a855f7', textAlign: 'center', padding: 8 } },
    { type: 'corner-decoration', label: 'Corner Decoration', icon: '◤', defaultWidth: 120, defaultHeight: 120, defaultStyle: { background: 'transparent', borderSize: 0 } },
    { type: 'light-rays', label: 'Light Rays', icon: '☀', defaultWidth: 800, defaultHeight: 800, defaultStyle: { background: 'transparent', borderSize: 0 } },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

interface AddWidgetPanelProps {
  onClose: () => void;
  initialCategory?: string;
}

export const AddWidgetPanel: React.FC<AddWidgetPanelProps> = ({ onClose, initialCategory = 'Layout' }) => {
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const { addWidget, editingSceneId } = useEditorStore();

  const categories = Object.keys(WIDGET_CATALOG);

  const displayWidgets = useMemo(() => {
    const base = search
      ? Object.values(WIDGET_CATALOG).flat().filter(w => w.label.toLowerCase().includes(search.toLowerCase()))
      : WIDGET_CATALOG[category] ?? [];
    return base;
  }, [category, search]);

  const handleAdd = (def: WidgetDef) => {
    if (!editingSceneId) return;

    const { getDraftWidgets } = useEditorStore.getState();
    const widgets = getDraftWidgets();
    const maxZ = widgets.reduce((mx, w) => Math.max(mx, w.zIndex), 0);
    const id = `widget-${crypto.randomUUID()}`;

    const newWidget: DraftWidget = {
      id,
      type: def.type,
      label: def.label,
      x: Math.round((CANVAS_W - def.defaultWidth) / 2),
      y: Math.round((CANVAS_H - def.defaultHeight) / 2),
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
        borderRadius: 8, background: 'rgba(14,8,26,0.8)',
        borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(168,85,247,0.4)',
        padding: 12, textAlign: 'center', ...(def.defaultStyle ?? {}),
      },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: def.type, settings: {} },
    };

    addWidget(newWidget);
    onClose();
  };

  return (
    <div className="widget-panel-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="widget-panel">
        {/* Header */}
        <div className="panel-header" style={{ padding: '12px 16px' }}>
          <span style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 16, fontWeight: 700 }}>Add Element</span>
          <div style={{ flex: 1, marginLeft: 12, marginRight: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="input"
                placeholder="Search elements..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 28 }}
                autoFocus
              />
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Category tabs */}
        {!search && (
          <div className="widget-categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`widget-category-btn${category === cat ? ' active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Widget grid */}
        <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {displayWidgets.map(def => (
            <div key={def.type} className="widget-card" onClick={() => handleAdd(def)}>
              <div className="widget-card-icon">{def.icon}</div>
              <span className="widget-card-name">{def.label}</span>
            </div>
          ))}
          {displayWidgets.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
              No elements found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
