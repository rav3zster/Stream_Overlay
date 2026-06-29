import React, { useEffect, useRef } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { useEditorStore } from '../../store/editorStore';

// ─── Minimal OBS Overlay ─────────────────────────────────────────────────────
// This component renders at /obs and is loaded as a Browser Source in OBS.
// It reads ONLY from liveStore (what OBS should see right now).
// It never reads from editorStore (draft state).
//
// Scene widgets are rendered from editorStore.scenes matching the liveSceneName,
// since that's where the widget data lives. Only the scene identity (name) comes
// from liveStore.

const pad = (n: number) => String(n).padStart(2, '0');

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

// ─── Per-widget renderer (simplified for OBS display) ────────────────────────
const WidgetDisplay: React.FC<{ widget: any }> = ({ widget }) => {
  const timer = useLiveStore(s => s.timer);

  if (!widget.visible) return null;

  const glow = widget.style?.glowBlur && widget.style?.glowColor
    ? `0 0 ${widget.style.glowBlur}px ${widget.style.glowColor}`
    : undefined;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: widget.x,
    top: widget.y,
    width: widget.width,
    height: widget.height,
    transform: `rotate(${widget.rotation ?? 0}deg) scale(${widget.scale ?? 1})`,
    transformOrigin: 'center center',
    zIndex: widget.zIndex ?? 1,
    borderRadius: widget.style?.borderRadius ?? 0,
    background: widget.style?.background ?? 'transparent',
    border: widget.style?.borderSize
      ? `${widget.style.borderSize}px ${widget.style.borderStyle ?? 'solid'} ${widget.style.borderColor ?? 'transparent'}`
      : 'none',
    boxShadow: glow,
    opacity: (widget.opacity ?? 100) / 100,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: widget.style?.padding ?? 0,
  };

  const textStyle: React.CSSProperties = {
    fontFamily: widget.style?.fontFamily ?? 'Inter, sans-serif',
    fontSize: widget.style?.fontSize ?? 16,
    fontWeight: widget.style?.fontWeight ?? '600',
    color: widget.style?.fontColor ?? '#ffffff',
    textAlign: widget.style?.textAlign ?? 'center',
    letterSpacing: widget.style?.letterSpacing ?? 0,
    width: '100%',
  };

  // Countdown timer
  if (widget.type === 'countdown-timer') {
    return (
      <div style={baseStyle}>
        <div style={{ textAlign: 'center' }}>
          {widget.content?.settings?.label && (
            <div style={{ ...textStyle, fontSize: (widget.style?.fontSize ?? 72) * 0.22, opacity: 0.7, marginBottom: 4 }}>
              {widget.content.settings.label}
            </div>
          )}
          <div style={{ ...textStyle, lineHeight: 1 }}>
            {formatTime(timer.seconds)}
          </div>
        </div>
      </div>
    );
  }

  // Text widgets
  if (['text', 'animated-text', 'typing-text', 'scrolling-text'].includes(widget.type)) {
    return (
      <div style={baseStyle}>
        <div style={textStyle}>{widget.content?.settings?.text ?? widget.label}</div>
      </div>
    );
  }

  // Default — just render the styled box (for layout/decorative)
  return <div style={baseStyle} />;
};

// ─── OBS Overlay Root ─────────────────────────────────────────────────────────
export const OBSOverlay: React.FC = () => {
  const { liveSceneName, theme } = useLiveStore();
  const { scenes } = useEditorStore();

  // Find the live scene's widgets from editorStore
  const liveScene = scenes.find(s => s.name === liveSceneName);
  const widgets = liveScene?.widgets ?? [];
  const sortedWidgets = [...widgets].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Widgets */}
      {sortedWidgets.map(widget => (
        <WidgetDisplay key={widget.id} widget={widget} />
      ))}
    </div>
  );
};
