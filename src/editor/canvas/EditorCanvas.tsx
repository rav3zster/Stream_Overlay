import React, { useCallback, useEffect, useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { useEditorStore, type DraftWidget } from '../../store/editorStore';
import { WidgetRenderer } from '../../widgets/WidgetRenderer';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

// Helper to check if two bounding rectangles overlap
const overlaps = (
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
) => {
  return !(
    r1.x + r1.w < r2.x ||
    r2.x + r2.w < r1.x ||
    r1.y + r1.h < r2.y ||
    r2.y + r2.h < r1.y
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
          left: widget.x,
          top: widget.y,
          width: widget.width ?? widget.w ?? 100,
          height: widget.height ?? widget.h ?? 100,
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
        <WidgetRenderer widget={widget} isEditor={true} />
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
          keepRatio={false}
          renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
          rotationPosition="top"
          zoom={1 / zoom}

          // Initializing start coordinates prevents offset jumps during dragging
          onDragStart={({ set }) => {
            set([widget.x, widget.y]);
          }}
          onDrag={({ beforeTranslate }) => {
            onUpdate(widget.id, {
              x: Math.round(beforeTranslate[0]),
              y: Math.round(beforeTranslate[1]),
            });
          }}
          onDragEnd={onDragEnd}

          // Initializing size & start coordinates prevents jumps during resizing
          onResizeStart={({ setOrigin, dragStart }) => {
            setOrigin(['%', '%']);
            if (dragStart) dragStart.set([widget.x, widget.y]);
          }}
          onResize={({ width, height, drag }) => {
            onUpdate(widget.id, {
              width: Math.max(10, Math.round(width)),
              height: Math.max(10, Math.round(height)),
              x: Math.round(drag.beforeTranslate[0]),
              y: Math.round(drag.beforeTranslate[1]),
            });
          }}
          onResizeEnd={onDragEnd}

          // Initializing rotation prevents jumping to zero angle
          onRotateStart={({ set }) => {
            set(widget.rotation);
          }}
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
    getDraftWidgets, selectWidget, selectWidgets, deselectAll, setHovered,
    updateWidget, pushHistory, setPan,
    setIsDragging, setIsResizing,
  } = useEditorStore();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  


  const [guides, setGuides] = useState<Guide[]>([]);
  const isPanningRef = useRef(false);
  const isSpacePressedRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  // Rubber-band selection state
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  // Developer Debug Mode state
  const [debugMode, setDebugMode] = useState(false);
  const [mousePos, setMousePos] = useState({ sx: 0, sy: 0, cx: 0, cy: 0 });

  const widgets = getDraftWidgets();

  // Toggle debug overlay with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        setDebugMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  // ── Pan with Space+Drag ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        isSpacePressedRef.current = true;
        if (wrapperRef.current) wrapperRef.current.style.cursor = 'grab';
        isPanningRef.current = false;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        if (wrapperRef.current) wrapperRef.current.style.cursor = 'default';
        isPanningRef.current = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.altKey || isSpacePressedRef.current))) {
      // Panning mode
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      if (wrapperRef.current) wrapperRef.current.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) {
      // Start rubber-band selection
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left) / zoom;
      const canvasY = (e.clientY - rect.top) / zoom;
      setSelectionStart({ x: canvasX, y: canvasY });
      setSelectionEnd({ x: canvasX, y: canvasY });
      deselectAll();
    }
  }, [pan, zoom, deselectAll]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const canvasX = Math.round((e.clientX - rect.left) / zoom);
    const canvasY = Math.round((e.clientY - rect.top) / zoom);

    // Track mouse coordinates for Developer debug overlay
    setMousePos({ sx: e.clientX, sy: e.clientY, cx: canvasX, cy: canvasY });

    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({ x: panStartRef.current.px + dx, y: panStartRef.current.py + dy });
      return;
    }

    if (selectionStart) {
      setSelectionEnd({ x: canvasX, y: canvasY });
    }
  }, [selectionStart, setPan, zoom]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    if (wrapperRef.current) wrapperRef.current.style.cursor = 'default';

    if (selectionStart && selectionEnd) {
      const x = Math.min(selectionStart.x, selectionEnd.x);
      const y = Math.min(selectionStart.y, selectionEnd.y);
      const w = Math.abs(selectionStart.x - selectionEnd.x);
      const h = Math.abs(selectionStart.y - selectionEnd.y);

      // Select widgets inside the selection rectangle if dragging was significant
      if (w > 4 || h > 4) {
        const intersected = widgets.filter(widget => {
          return overlaps(
            { x: widget.x, y: widget.y, w: widget.width ?? widget.w ?? 100, h: widget.height ?? widget.h ?? 100 },
            { x, y, w, h }
          );
        });
        selectWidgets(intersected.map(w => w.id));
      }
    }

    setSelectionStart(null);
    setSelectionEnd(null);
  }, [selectionStart, selectionEnd, widgets, selectWidgets]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const stage = stageRef.current;
    const editingSceneId = useEditorStore.getState().editingSceneId;
    if (!stage || !editingSceneId) return;

    try {
      const dataStr = e.dataTransfer.getData('application/react-flow');
      if (!dataStr) return;
      const parsed = JSON.parse(dataStr);
      
      const rect = stage.getBoundingClientRect();
      const dropX = Math.round((e.clientX - rect.left) / zoom);
      const dropY = Math.round((e.clientY - rect.top) / zoom);

      if (parsed.source === 'widget') {
        const def = parsed.payload;
        const maxZ = widgets.reduce((mx, w) => Math.max(mx, w.zIndex), 0);
        const id = `widget-${crypto.randomUUID()}`;
        const newWidget: DraftWidget = {
          id,
          type: def.type,
          label: def.label,
          x: dropX - Math.round(def.defaultWidth / 2),
          y: dropY - Math.round(def.defaultHeight / 2),
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
          content: { type: def.type, settings: {} }
        };
        useEditorStore.getState().addWidget(newWidget);
      } else if (parsed.source === 'asset') {
        const asset = parsed.payload;
        const type = asset.type === 'gif' ? 'gif' : asset.type === 'video' ? 'video' : 'image';
        const maxZ = widgets.reduce((mx, w) => Math.max(mx, w.zIndex), 0);
        const id = `widget-${crypto.randomUUID()}`;
        const newWidget: DraftWidget = {
          id,
          type,
          label: asset.name,
          x: dropX - 200,
          y: dropY - 125,
          width: 400,
          height: 250,
          w: 400,
          h: 250,
          rotation: 0,
          opacity: 100,
          scale: 1,
          zIndex: maxZ + 1,
          visible: true,
          locked: false,
          style: {
            borderRadius: 8, background: 'transparent',
            borderSize: 1, borderStyle: 'dashed', borderColor: 'rgba(168,85,247,0.4)',
            padding: 12, textAlign: 'center'
          },
          animation: { type: 'none', duration: 1, delay: 0, loop: false },
          content: { type, settings: { url: asset.url } }
        };
        useEditorStore.getState().addWidget(newWidget);
      }
    } catch (err) {
      console.error('Drop parsing error:', err);
    }
  }, [zoom, widgets]);

  // ── Alignment guides during drag ──
  const computeGuides = useCallback((draggingId: string, dx: number, dy: number) => {
    if (!snapEnabled) { setGuides([]); return; }
    const dragging = widgets.find(w => w.id === draggingId);
    if (!dragging) return;
    const others = widgets.filter(w => w.id !== draggingId);
    const newGuides: Guide[] = [];

    const dCx = dragging.x + dx + (dragging.width ?? dragging.w ?? 100) / 2;
    const dCy = dragging.y + dy + (dragging.height ?? dragging.h ?? 100) / 2;

    others.forEach(o => {
      const oW = o.width ?? o.w ?? 100;
      const oH = o.height ?? o.h ?? 100;
      const oCx = o.x + oW / 2;
      const oCy = o.y + oH / 2;

      if (Math.abs(dCx - oCx) < 8) newGuides.push({ pos: oCx, orientation: 'vertical' });
      if (Math.abs(dCy - oCy) < 8) newGuides.push({ pos: oCy, orientation: 'horizontal' });
      if (Math.abs(dragging.x + dx - o.x) < 8) newGuides.push({ pos: o.x, orientation: 'vertical' });
      if (Math.abs(dragging.y + dy - o.y) < 8) newGuides.push({ pos: o.y, orientation: 'horizontal' });
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

  // Render rubber-band rectangle style
  const rubberBandStyle = selectionStart && selectionEnd ? {
    left: Math.min(selectionStart.x, selectionEnd.x),
    top: Math.min(selectionStart.y, selectionEnd.y),
    width: Math.abs(selectionStart.x - selectionEnd.x),
    height: Math.abs(selectionStart.y - selectionEnd.y),
  } : null;

  const selectedWidget = widgets.find(w => selectedIds.includes(w.id));

  return (
    <div
      ref={wrapperRef}
      className="canvas-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* 1920×1080 Stage */}
      <div
        ref={stageRef}
        className="canvas-stage"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Grid */}
        {showGrid && <div className="canvas-grid" style={{ backgroundSize: `${96}px ${54}px` }} />}

        {/* Rubber-band Selection Box */}
        {rubberBandStyle && (
          <div className="rubber-band" style={rubberBandStyle} />
        )}

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
        zIndex: 50,
      }}>
        {Math.round(zoom * 100)}%
      </div>

      {/* Developer Debug Overlay */}
      {debugMode && (
        <div style={{
          position: 'fixed', bottom: 16, left: 16,
          background: 'rgba(14,8,26,0.95)', border: '1px solid var(--color-danger)',
          borderRadius: 8, padding: 12, fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--color-text-2)', pointerEvents: 'none', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: 4, width: 260,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 10px rgba(239,68,68,0.2)',
        }}>
          <div style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: 11, marginBottom: 2 }}>🐞 DEV DEBUG MODE</div>
          <div>Mouse Screen: ({mousePos.sx}, {mousePos.sy})</div>
          <div>Mouse Canvas: ({mousePos.cx}, {mousePos.cy})</div>
          <div>Canvas Pan: ({pan.x}px, {pan.y}px)</div>
          <div>Canvas Zoom: {Math.round(zoom * 100)}%</div>
          <div>Selected ID: {selectedWidget ? selectedWidget.id : 'none'}</div>
          {selectedWidget && (
            <>
              <div style={{ color: 'var(--color-cyan)', marginTop: 4 }}>[Widget Bounding Box]</div>
              <div>X: {selectedWidget.x}px, Y: {selectedWidget.y}px</div>
              <div>W: {selectedWidget.width ?? selectedWidget.w}px, H: {selectedWidget.height ?? selectedWidget.h}px</div>
              <div>Angle: {selectedWidget.rotation}°</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
