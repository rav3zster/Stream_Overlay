import React from 'react';
import { Tv, Film, Plus, ChevronRight, Trash2, PlusCircle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useLiveStore } from '../../store/liveStore';
import { useSessionStore } from '../../store/sessionStore';

interface LeftPanelProps {
  onOpenAddWidget: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onOpenAddWidget }) => {
  const { scenes, editingSceneId, setEditingScene } = useEditorStore();
  const { liveSceneId } = useLiveStore();
  const { createScene } = useSessionStore();

  const handleAddScene = async () => {
    const name = prompt('Scene name (e.g. "game-session"):');
    if (!name) return;
    const label = prompt('Scene label (e.g. "🎮 Game Session"):') ?? name;
    await createScene(name, label);
  };

  return (
    <div className="left-panel">
      {/* Scenes */}
      <div className="panel-header">
        <Tv size={14} color="var(--color-text-muted)" />
        <span className="panel-title">Scenes</span>
        <button
          className="btn-icon" style={{ marginLeft: 'auto', width: 24, height: 24 }}
          onClick={handleAddScene} data-tooltip="New Scene"
        >
          <Plus size={12} />
        </button>
      </div>

      <div style={{ padding: '8px 8px 0', flexShrink: 0 }}>
        <div className="scene-list">
          {scenes.map(scene => {
            const isEditing = scene.id === editingSceneId;
            const isLive = scene.id === liveSceneId;
            return (
              <div
                key={scene.id}
                className={`scene-item${isEditing ? ' active' : ''}${isLive ? ' live-indicator' : ''}`}
                onClick={() => setEditingScene(scene.id)}
              >
                <Film size={13} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {scene.label}
                </span>
                {isLive && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    LIVE
                  </span>
                )}
                <ChevronRight size={11} style={{ opacity: 0.3 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 0' }} />

      {/* Layers - delegated to LayersPanel content inline */}
      <LayersContent onOpenAddWidget={onOpenAddWidget} />
    </div>
  );
};

// ── Layers Panel (embedded in LeftPanel) ─────────────────────────────────────
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

interface LayersContentProps { onOpenAddWidget: () => void; }

const LayersContent: React.FC<LayersContentProps> = ({ onOpenAddWidget }) => {
  const {
    getDraftWidgets, selectedIds, selectWidget, updateWidget, removeWidget,
  } = useEditorStore();

  const widgets = [...getDraftWidgets()].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <>
      <div className="panel-header">
        <span className="panel-title" style={{ flex: 1 }}>Layers ({widgets.length})</span>
        <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={onOpenAddWidget} data-tooltip="Add Widget">
          <PlusCircle size={12} />
        </button>
      </div>

      <div className="panel-body" style={{ padding: '4px 8px' }}>
        {widgets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--color-text-muted)', fontSize: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
            No elements yet.<br />
            <span
              style={{ color: 'var(--color-accent)', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={onOpenAddWidget}
            >Add your first element</span>
          </div>
        ) : widgets.map(widget => {
          const isSelected = selectedIds.includes(widget.id);
          return (
            <div
              key={widget.id}
              className={`layer-item${isSelected ? ' selected' : ''}`}
              onClick={() => selectWidget(widget.id, false)}
            >
              <span className="layer-item-icon" style={{ fontSize: 12 }}>
                {WIDGET_ICONS[widget.type] ?? '⬛'}
              </span>
              <span className="layer-item-label">{widget.label}</span>
              <div className="layer-item-actions">
                {/* Visibility toggle */}
                <button
                  className="btn-icon"
                  style={{ width: 20, height: 20, fontSize: 10 }}
                  onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { visible: !widget.visible }); }}
                  data-tooltip={widget.visible ? 'Hide' : 'Show'}
                >
                  {widget.visible ? '👁' : '🙈'}
                </button>
                {/* Lock */}
                <button
                  className="btn-icon"
                  style={{ width: 20, height: 20, fontSize: 10 }}
                  onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { locked: !widget.locked }); }}
                  data-tooltip={widget.locked ? 'Unlock' : 'Lock'}
                >
                  {widget.locked ? '🔒' : '🔓'}
                </button>
                {/* Delete */}
                <button
                  className="btn-icon"
                  style={{ width: 20, height: 20, fontSize: 10, color: '#ef4444' }}
                  onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                  data-tooltip="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
