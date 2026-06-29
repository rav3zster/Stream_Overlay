import React, { useCallback, useEffect, useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { useEditorStore, type DraftWidget } from '../../store/editorStore';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

// ─── Widget placeholder renderer (uses existing WidgetRenderer for real content) ──
const WidgetPlaceholder: React.FC<{ widget: DraftWidget }> = ({ widget }) => {
  const icons: Record<string, string> = {
    'countdown-timer': '⏱', 'chat-box': '💬', 'spotify': '🎵', 'alerts': '🔔',
    'goals': '🎯', 'event-list': '📋', 'image': '🖼', 'video': '📹', 'text': '✏️',
    'animated-text': '✨', 'scrolling-text': '📜', 'vtuber': '🎭', 'camera-frame': '📷',
    'shape': '⬛', 'glass-card': '🪟', 'neon-card': '💠', 'badge': '🏅',
    'viewer-count': '👁', 'latest-follower': '❤️', 'latest-subscriber': '⭐',
    'follower-feed': '📥', 'subscriber-feed': '🌟', 'donation-feed': '💰',
    'poll': '📊', 'schedule': '📅', 'weather': '🌤', 'clock': '🕐',
    'social-links': '🔗', 'logo': '⚡', 'header': '▬', 'footer': '▬',
    'container': '□', 'background': '🎨', 'glass-panel': '🪟', 'divider': '─',
    'particles': '✦', 'glow-effect': '💫', 'line': '─', 'lottie': '🌀',
    'gif': '🎞', 'svg': '▲', '3d-model': '💎', 'game-capture': '🎮',
  };
  const icon = icons[widget.type] ?? '⬛';
  const bg = widget.style.background || 'rgba(168,85,247,0.15)';
  const border = `${widget.style.borderSize ?? 1}px ${widget.style.borderStyle ?? 'solid'} ${widget.style.borderColor ?? 'rgba(168,85,247,0.5)'}`;
  const br = widget.style.borderRadius ?? 8;
  const glow = widget.style.glowBlur && widget.style.glowColor
    ? `0 0 ${widget.style.glowBlur}px ${widget.style.glowColor}`
    : undefined;

  return (
    <div style={{
      width: '100%', height: '100%', background: bg, border, borderRadius: br,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 4, boxShadow: glow, overflow: 'hidden',
      opacity: widget.opacity / 100,
    }}>
      <span style={{ fontSize: Math.min(widget.width, widget.height) * 0.18, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: Math.max(9, Math.min(14, widget.height * 0.1)),
        fontWeight: 600, color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '0 4px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        maxWidth: '90%',
      }}>{widget.label}</span>
    </div>
  );
};

// ─── Single Widget on Canvas ──────────────────────────────────────────────────
interface CanvasWidgetProps {
  widget: DraftWidget;
  isSelected: boolean;
  isHovered: boolean;
  zoom: number;
  onSelect: (id: string, additive: boolean) => void;
  onHover: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<DraftWidget>) => void;
  onDragEnd: () => void;
}

const CanvasWidget: React.FC<CanvasWidgetProps> = ({
  widget, isSelected, isHovered, zoom, onSelect, onHover, onUpdate, onDragEnd,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);

  if (!widget.visible) return null;

  return (
    <>
      <div
        ref={ref}
        id={`widget-${widget.id}`}
        className={`canvas-widget${isSelected ? ' selected' : ''}${isHovered && !isSelected ? ' hovered' : ''}${widget.locked ? ' locked' : ''}`}
        style={{
          left: widget.x, top: widget.y,
          width: widget.width, height: widget.height,
          transform: `rotate(${widget.rotation}deg) scale(${widget.scale})`,
          zIndex: widget.zIndex,
          transformOrigin: 'center center',
        }}
        onMouseDown={(e) => {
          if (widget.locked) return;
          e.stopPropagation();
          onSelect(widget.id, e.shiftKey || e.ctrlKey || e.metaKey);
        }}
        onMouseEnter={() => onHover(widget.id)}
        onMouseLeave={() => onHover(null)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(widget.id, false);
        }}
      >
        <WidgetPlaceholder widget={widget} />
      </div>

      {isSelected && !widget.locked && (
        <Moveable
          ref={moveableRef}
          target={ref}
          draggable={true}
          resizable={true}
          rotatable={true}
          scalable={false}
          snappable={true}
          throttleDrag={0}
          throttleResize={0}
          throttleRotate={0}
          keepRatio={false}
          renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
          rotationPosition="top"
          zoom={1 / zoom}

          onDrag={({ beforeTranslate }) => {
            onUpdate(widget.id, {
              x: Math.round(widget.x + beforeTranslate[0]),
              y: Math.round(widget.y + beforeTranslate[1]),
            });
          }}
          onDragEnd={onDragEnd}

          onResize={({ width, height, drag }) => {
            onUpdate(widget.id, {
              width: Math.max(20, Math.round(width)),
              height: Math.max(20, Math.round(height)),
              x: Math.round(widget.x + drag.beforeTranslate[0]),
              y: Math.round(widget.y + drag.beforeTranslate[1]),
            });
          }}
          onResizeEnd={onDragEnd}

          onRotate={({ beforeRotation }) => {
            onUpdate(widget.id, { rotation: Math.round(beforeRotation) });
          }}
          onRotateEnd={onDragEnd}
        />
      )}
    </>
  );
};

// ─── Alignment Guides ─────────────────────────────────────────────────────────
interface Guide { pos: number; orientation: 'horizontal' | 'vertical'; }

// ─── Main Canvas ─────────────────────────────────────────────────────────────
export const EditorCanvas: React.FC = () => {
  const {
    zoom, pan, snapEnabled, showGrid, selectedIds, hoveredId,
    getDraftWidgets, selectWidget, deselectAll, setHovered,
    updateWidget, pushHistory, setZoom, setPan,
    setIsDragging, setIsResizing,
  } = useEditorStore();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const widgets = getDraftWidgets();
  const stageW = CANVAS_W * zoom;
  const stageH = CANVAS_H * zoom;

  // ── Zoom with Ctrl+Wheel ──
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    useEditorStore.getState().setZoom(zoom + delta);
  }, [zoom]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Pan with Space+Drag ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        if (wrapperRef.current) wrapperRef.current.style.cursor = 'grab';
        isPanningRef.current = false;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (wrapperRef.current) wrapperRef.current.style.cursor = 'default';
        isPanningRef.current = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Space+drag panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      if (wrapperRef.current) wrapperRef.current.style.cursor = 'grabbing';
      return;
    }
    // Click empty → deselect
    deselectAll();
  }, [pan, deselectAll]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({ x: panStartRef.current.px + dx, y: panStartRef.current.py + dy });
    }
  }, [setPan]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    if (wrapperRef.current) wrapperRef.current.style.cursor = 'default';
  }, []);

  // ── Alignment guides during drag ──
  const computeGuides = useCallback((draggingId: string, dx: number, dy: number) => {
    if (!snapEnabled) { setGuides([]); return; }
    const dragging = widgets.find(w => w.id === draggingId);
    if (!dragging) return;
    const others = widgets.filter(w => w.id !== draggingId);
    const newGuides: Guide[] = [];

    const dCx = dragging.x + dx + dragging.width / 2;
    const dCy = dragging.y + dy + dragging.height / 2;

    others.forEach(o => {
      const oCx = o.x + o.width / 2;
      const oCy = o.y + o.height / 2;
      if (Math.abs(dCx - oCx) < 6) newGuides.push({ pos: oCx, orientation: 'vertical' });
      if (Math.abs(dCy - oCy) < 6) newGuides.push({ pos: oCy, orientation: 'horizontal' });
      if (Math.abs(dragging.x + dx - o.x) < 6) newGuides.push({ pos: o.x, orientation: 'vertical' });
      if (Math.abs(dragging.y + dy - o.y) < 6) newGuides.push({ pos: o.y, orientation: 'horizontal' });
    });

    setGuides(newGuides);
  }, [widgets, snapEnabled]);

  const handleWidgetUpdate = useCallback((id: string, updates: Partial<DraftWidget>) => {
    updateWidget(id, updates);
    if (updates.x !== undefined || updates.y !== undefined) {
      const w = widgets.find(w => w.id === id);
      if (w) computeGuides(id, (updates.x ?? w.x) - w.x, (updates.y ?? w.y) - w.y);
    }
    setIsDragging(true);
  }, [updateWidget, widgets, computeGuides, setIsDragging]);

  const handleDragEnd = useCallback(() => {
    pushHistory();
    setGuides([]);
    setIsDragging(false);
    setIsResizing(false);
  }, [pushHistory, setIsDragging, setIsResizing]);

  // Sort widgets by zIndex for rendering
  const sortedWidgets = [...widgets].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={wrapperRef}
      className="canvas-wrapper"
      style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 1920×1080 Stage */}
      <div
        className="canvas-stage"
        style={{ width: stageW, height: stageH, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {/* Grid */}
        {showGrid && <div className="canvas-grid" style={{ backgroundSize: `${96}px ${54}px` }} />}

        {/* Alignment guides */}
        {guides.map((g, i) => (
          <div
            key={i}
            className={`guide-line ${g.orientation}`}
            style={g.orientation === 'horizontal' ? { top: g.pos } : { left: g.pos }}
          />
        ))}

        {/* Widgets */}
        {sortedWidgets.map(widget => (
          <CanvasWidget
            key={widget.id}
            widget={widget}
            isSelected={selectedIds.includes(widget.id)}
            isHovered={hoveredId === widget.id}
            zoom={zoom}
            onSelect={selectWidget}
            onHover={setHovered}
            onUpdate={handleWidgetUpdate}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Zoom label */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(14,11,30,0.9)', border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 600,
        color: 'rgba(196,181,253,0.8)', pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace',
      }}>
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};
