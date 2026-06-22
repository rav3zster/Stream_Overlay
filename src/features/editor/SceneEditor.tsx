import React, { useRef, useState, useEffect } from 'react';
import { useStreamStore, type Widget } from '../../store/useStreamStore';
import { Move, Maximize2, Lock, Unlock, Trash2, Copy, Eye, EyeOff, RotateCcw, RotateCw, Grid, HelpCircle } from 'lucide-react';

export const SceneEditor: React.FC = () => {
  const {
    activeScene,
    activeTheme,
    sceneWidgets,
    selectedWidgetId,
    updateWidget,
    removeWidget,
    duplicateWidget,
    selectWidget,
    pushHistoryState,
    undo,
    redo
  } = useStreamStore();

  const canvasRef = useRef<HTMLDivElement | null>(null);
  
  // Grid snapping state
  const [snapToGrid, setSnapToGrid] = useState(true);
  const GRID_SIZE = 2; // snap to 2% intervals

  // Drag and resize operation tracking
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  
  // Cache resize base sizes
  const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0, clientX: 0, clientY: 0 });

  const widgets = sceneWidgets[activeScene] || [];

  // Click outside to deselect widget
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-grid')) {
      selectWidget(null);
    }
  };

  // Start dragging a widget
  const handleDragStart = (e: React.MouseEvent, widget: Widget) => {
    if (widget.isLocked || isResizing) return;
    e.stopPropagation();
    selectWidget(widget.id);
    setIsDragging(true);
    setDraggedWidgetId(widget.id);

    const rect = canvasRef.current!.getBoundingClientRect();
    const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
    const cursorY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDragOffset({
      x: cursorX - widget.x,
      y: cursorY - widget.y
    });
  };

  // Start resizing a widget
  const handleResizeStart = (e: React.MouseEvent, widget: Widget) => {
    if (widget.isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    selectWidget(widget.id);
    setIsResizing(true);
    setDraggedWidgetId(widget.id);
    setResizeStart({
      w: widget.w,
      h: widget.h,
      x: widget.x,
      y: widget.y,
      clientX: e.clientX,
      clientY: e.clientY
    });
  };

  // Move / Resize track processing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!draggedWidgetId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const targetWidget = widgets.find(w => w.id === draggedWidgetId);
      if (!targetWidget) return;

      if (isDragging) {
        // Calculate coordinates in percentages
        const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
        const cursorY = ((e.clientY - rect.top) / rect.height) * 100;
        
        let newX = cursorX - dragOffset.x;
        let newY = cursorY - dragOffset.y;

        // Snapping rules
        if (snapToGrid) {
          newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        }

        // Clamp inside boundary limits (0 to 100 - width)
        newX = Math.max(0, Math.min(newX, 100 - targetWidget.w));
        newY = Math.max(0, Math.min(newY, 96 - targetWidget.h)); // Keep bottom ticker clear

        updateWidget(draggedWidgetId, { x: newX, y: newY });
      } 
      else if (isResizing) {
        const deltaX = e.clientX - resizeStart.clientX;
        const deltaY = e.clientY - resizeStart.clientY;

        // Convert delta pixels to percentage offsets
        const deltaXPct = (deltaX / rect.width) * 100;
        const deltaYPct = (deltaY / rect.height) * 100;

        let newW = resizeStart.w + deltaXPct;
        let newH = resizeStart.h + deltaYPct;

        if (snapToGrid) {
          newW = Math.round(newW / GRID_SIZE) * GRID_SIZE;
          newH = Math.round(newH / GRID_SIZE) * GRID_SIZE;
        }

        // Clamp minimum size limits
        newW = Math.max(4, Math.min(newW, 100 - resizeStart.x));
        newH = Math.max(4, Math.min(newH, 96 - resizeStart.y));

        updateWidget(draggedWidgetId, { w: newW, h: newH });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setDraggedWidgetId(null);
        // Save layout state step in Undo history stack on release
        pushHistoryState();
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, draggedWidgetId, dragOffset, resizeStart, widgets, snapToGrid, updateWidget, pushHistoryState]);

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/5 rounded-xl p-4">
      {/* Editor toolbar */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold text-vibeSecondary font-display tracking-widest bg-vibeSecondary/15 px-3 py-1 rounded">
            Scene: {activeScene.replace('-', ' ')}
          </span>
          <span className="text-[10px] text-white/40 flex items-center gap-1">
            <HelpCircle size={12} /> Canvas aspect ratio is locked to 16:9
          </span>
        </div>
        
        {/* Undo/Redo & Snap toggles */}
        <div className="flex items-center gap-2 bg-[#120e24] border border-purple-900/30 rounded-lg p-1">
          <button 
            onClick={undo}
            className="p-1.5 hover:bg-white/5 rounded text-white/70 hover:text-white transition"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={redo}
            className="p-1.5 hover:bg-white/5 rounded text-white/70 hover:text-white transition"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={14} />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
          <button 
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-bold transition ${snapToGrid ? 'bg-vibePrimary text-white shadow-glow' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            title="Toggle Snap Grid (2% steps)"
          >
            <Grid size={13} /> {snapToGrid ? 'Snap ON' : 'Snap OFF'}
          </button>
        </div>
      </div>

      {/* 16:9 Aspect Ratio Editor Canvas Box */}
      <div className="flex-grow flex items-center justify-center overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`theme-${activeTheme} w-full aspect-ratio-16-9 relative border-2 border-dashed border-purple-900/50 bg-[#07050f]/80 select-none overflow-hidden`}
          style={{ 
            aspectRatio: '16 / 9',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
          }}
        >
          {/* Snap Grid visual background layout dots */}
          {snapToGrid && (
            <div className="absolute inset-0 canvas-grid bg-[radial-gradient(rgba(168,85,247,0.15)_1.5px,transparent_1.5px)] bg-[size:4%_4%] pointer-events-none opacity-40 z-0"></div>
          )}

          {/* Canvas Bottom Ticker mockup block */}
          <div className="absolute bottom-0 left-0 w-full h-[6%] bg-purple-950/20 border-t border-purple-500/20 flex items-center px-4 text-[1.2vw] font-bold text-white/45 pointer-events-none z-10">
            📢 BOTTOM SCROLLING INFORMATION FOOTER TICKER
          </div>

          {/* Render scene element boxes */}
          {widgets.map(widget => {
            const isSelected = widget.id === selectedWidgetId;
            return (
              <div
                key={widget.id}
                onMouseDown={(e) => handleDragStart(e, widget)}
                className={`absolute rounded-lg border flex flex-col group transition-shadow ${
                  widget.isHidden ? 'opacity-30 border-dashed border-red-500/40 bg-red-950/5' : 
                  isSelected ? 'border-vibeAccent shadow-cyber ring-1 ring-vibeAccent/40 z-30' : 'border-purple-500/20 hover:border-purple-500/50 bg-purple-950/10'
                }`}
                style={{
                  left: `${widget.x}%`,
                  top: `${widget.y}%`,
                  width: `${widget.w}%`,
                  height: `${widget.h}%`,
                  cursor: widget.isLocked ? 'not-allowed' : 'move'
                }}
              >
                {/* Visual Label header of widget */}
                <div className="flex justify-between items-center bg-black/50 px-2 py-1 text-[1vw] text-white/70 font-semibold border-b border-white/5 truncate pointer-events-none">
                  <span className="flex items-center gap-1 truncate">
                    {widget.isLocked && <Lock size={9} className="text-amber-500 flex-shrink-0" />}
                    {widget.label}
                  </span>
                  <span className="text-[0.8vw] text-purple-400 flex-shrink-0">{widget.type}</span>
                </div>

                {/* Simulated center placeholder inside editor */}
                <div className="flex-grow flex flex-col items-center justify-center p-2 text-center pointer-events-none text-white/50 text-[1.2vw] select-none uppercase font-display font-medium">
                  {widget.isHidden ? (
                    <span className="text-red-400 flex items-center gap-1 text-[1vw] font-bold tracking-widest"><EyeOff size={12}/> HIDDEN</span>
                  ) : (
                    <span>{widget.type} widget</span>
                  )}
                  <span className="text-[0.9vw] text-white/30 lowercase font-body mt-1">
                    {Math.round(widget.w)}% x {Math.round(widget.h)}%
                  </span>
                </div>

                {/* Resize Handle handle (bottom right) */}
                {isSelected && !widget.isLocked && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, widget)}
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center bg-vibeAccent text-black rounded-tl-md rounded-br-md shadow"
                  >
                    <Maximize2 size={9} />
                  </div>
                )}

                {/* Widget Quick action floating buttons list */}
                {isSelected && (
                  <div className="absolute top-[-30px] right-0 bg-black/90 border border-purple-500/30 rounded-md p-1 flex items-center gap-1.5 shadow-lg z-50">
                    <button
                      onClick={() => updateWidget(widget.id, { isLocked: !widget.isLocked })}
                      className="p-1 hover:bg-white/10 rounded text-amber-500 hover:text-amber-400"
                      title={widget.isLocked ? "Unlock Widget" : "Lock Widget"}
                    >
                      {widget.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    <button
                      onClick={() => updateWidget(widget.id, { isHidden: !widget.isHidden })}
                      className="p-1 hover:bg-white/10 rounded text-blue-400 hover:text-blue-300"
                      title={widget.isHidden ? "Reveal Widget" : "Hide Widget"}
                    >
                      {widget.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      onClick={() => duplicateWidget(widget.id)}
                      className="p-1 hover:bg-white/10 rounded text-green-400 hover:text-green-300"
                      title="Duplicate Widget"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 hover:bg-white/10 rounded text-red-500 hover:text-red-400"
                      title="Delete Widget"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
