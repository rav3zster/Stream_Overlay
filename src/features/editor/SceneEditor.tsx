import React, { useRef, useState, useEffect } from 'react';
import { useOverlayStore, type Widget } from '../../store/overlayStore';
import { WidgetRenderer } from '../../widgets/WidgetRenderer';
import { 
  Lock, Unlock, Eye, EyeOff, Copy, Trash2, RotateCcw, RotateCw, 
  Grid, HelpCircle, ZoomIn, ZoomOut, Maximize, Save, RefreshCw
} from 'lucide-react';

export const SceneEditor: React.FC = () => {
  const activeScene = useOverlayStore(s => s.currentScene);
  const activeTheme = useOverlayStore(s => s.theme);
  
  // Selection
  const selectedWidgetIds = useOverlayStore(s => s.selectedWidgetIds);
  const selectedWidgetId = useOverlayStore(s => s.selectedWidgetId); // backwards compat
  const selectWidget = useOverlayStore(s => s.selectWidget);
  const selectWidgets = useOverlayStore(s => s.selectWidgets);
  
  // Canvas scale/pan
  const canvasZoom = useOverlayStore(s => s.canvasZoom);
  const canvasPan = useOverlayStore(s => s.canvasPan);
  const setCanvasZoom = useOverlayStore(s => s.setCanvasZoom);
  const setCanvasPan = useOverlayStore(s => s.setCanvasPan);

  // Widget Actions
  const updateWidget = useOverlayStore(s => s.updateWidget);
  const updateWidgets = useOverlayStore(s => s.updateWidgets);
  const removeWidget = useOverlayStore(s => s.removeWidget);
  const duplicateWidget = useOverlayStore(s => s.duplicateWidget);
  const pushHistoryState = useOverlayStore(s => s.pushHistoryState);
  const undo = useOverlayStore(s => s.undo);
  const redo = useOverlayStore(s => s.redo);
  const copyWidgetStyle = useOverlayStore(s => s.copyWidgetStyle);
  const pasteWidgetStyle = useOverlayStore(s => s.pasteWidgetStyle);
  const copyWidget = useOverlayStore(s => s.copyWidget);
  const pasteWidget = useOverlayStore(s => s.pasteWidget);
  const alignSelected = useOverlayStore(s => s.alignSelected);
  const distributeSelected = useOverlayStore(s => s.distributeSelected);
  const saveTemplate = useOverlayStore(s => s.saveTemplate);
  const loadTemplate = useOverlayStore(s => s.loadTemplate);
  const templates = useOverlayStore(s => s.templates);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  
  // Snapping & Guides
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [snapLines, setSnapLines] = useState<Array<{ type: 'v' | 'h'; pos: number; edge?: string }>>([]);
  
  // Grid snapping step
  const GRID_SIZE = 2; // snap to 2% steps if grid is on
  const SNAP_THRESHOLD = 1.5; // snap edge matches within 1.5% distance

  // Pan / Zoom States
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Drag & Resize tracking
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOffsets, setDragOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0, clientX: 0, clientY: 0 });
  const [rotateStart, setRotateStart] = useState({ rotation: 0, centerX: 0, centerY: 0, startAngle: 0 });

  // Double Click Rename state
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  // Template Form State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Marquee Selection Box
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

  const widgets = useOverlayStore(s => s.sceneWidgets[activeScene] || []);

  // Calculate bounding box bounds for multiple selections
  const getSelectedBoundingBox = () => {
    if (selectedWidgetIds.length <= 1) return null;
    const selectedWidgets = widgets.filter(w => selectedWidgetIds.includes(w.id));
    if (selectedWidgets.length === 0) return null;

    const minX = Math.min(...selectedWidgets.map(w => w.x));
    const maxX = Math.max(...selectedWidgets.map(w => w.x + w.w));
    const minY = Math.min(...selectedWidgets.map(w => w.y));
    const maxY = Math.max(...selectedWidgets.map(w => w.y + w.h));

    return {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY
    };
  };

  const selectionBounds = getSelectedBoundingBox();

  // Handle canvas clicks (marquee select or pan or deselect)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.shiftKey)) {
      // Middle click, right click, or shift-left click on canvas = Pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
      e.preventDefault();
      return;
    }

    const isCanvasClick = 
      e.target === canvasRef.current || 
      (e.target as HTMLElement).classList.contains('canvas-grid') || 
      (e.target as HTMLElement).classList.contains('safe-zone');

    if (isCanvasClick && e.button === 0) {
      // Start marquee drag-select
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMarqueeStart({ x, y });
      setMarqueeEnd({ x, y });
      selectWidgets([]); // Clear select
      setEditingWidgetId(null);
    }
  };

  // Start dragging a widget
  const handleDragStart = (e: React.MouseEvent, widget: Widget) => {
    if (widget.locked || isResizing || isRotating || editingWidgetId === widget.id) return;
    e.stopPropagation();

    // Setup selection
    let nextSelection = [...selectedWidgetIds];
    const siblings = widget.parentId 
      ? widgets.filter(w => w.parentId === widget.parentId).map(w => w.id) 
      : [widget.id];

    if (e.shiftKey || e.ctrlKey) {
      const hasAnySelected = siblings.some(id => nextSelection.includes(id));
      if (hasAnySelected) {
        nextSelection = nextSelection.filter(id => !siblings.includes(id));
      } else {
        nextSelection = [...nextSelection, ...siblings];
      }
    } else {
      if (!selectedWidgetIds.includes(widget.id)) {
        nextSelection = siblings;
      }
    }
    selectWidgets(nextSelection);

    setIsDragging(true);
    setDraggedWidgetId(widget.id);

    // Calculate offsets for joint dragging
    const rect = canvasRef.current!.getBoundingClientRect();
    const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
    const cursorY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const offsets: Record<string, { x: number; y: number }> = {};
    nextSelection.forEach(id => {
      const wObj = widgets.find(w => w.id === id);
      if (wObj && !wObj.locked) {
        offsets[id] = {
          x: cursorX - wObj.x,
          y: cursorY - wObj.y
        };
      }
    });
    setDragOffsets(offsets);
  };

  // Start resizing a widget from one of 8 handles
  const handleResizeStart = (e: React.MouseEvent, widget: Widget, handle: string) => {
    if (widget.locked) return;
    e.stopPropagation();
    e.preventDefault();
    
    selectWidget(widget.id);
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      w: widget.w,
      h: widget.h,
      x: widget.x,
      y: widget.y,
      clientX: e.clientX,
      clientY: e.clientY
    });
  };

  // Start rotating a widget
  const handleRotateStart = (e: React.MouseEvent, widget: Widget) => {
    if (widget.locked) return;
    e.stopPropagation();
    e.preventDefault();

    selectWidget(widget.id);
    setIsRotating(true);
    
    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    setRotateStart({
      rotation: widget.rotation || 0,
      centerX,
      centerY,
      startAngle
    });
  };

  // Mouse move and mouse up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Canvas Panning
      if (isPanning) {
        setCanvasPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
        return;
      }

      // 2. Marquee Bounding Box Selection
      if (marqueeStart && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const curX = ((e.clientX - rect.left) / rect.width) * 100;
        const curY = ((e.clientY - rect.top) / rect.height) * 100;
        setMarqueeEnd({ x: curX, y: curY });

        // Calculate overlapping widgets
        const xMin = Math.min(marqueeStart.x, curX);
        const xMax = Math.max(marqueeStart.x, curX);
        const yMin = Math.min(marqueeStart.y, curY);
        const yMax = Math.max(marqueeStart.y, curY);

        const overlapping = widgets.filter(w => {
          const wLeft = w.x;
          const wRight = w.x + w.w;
          const wTop = w.y;
          const wBottom = w.y + w.h;
          return (
            wRight >= xMin && wLeft <= xMax &&
            wBottom >= yMin && wTop <= yMax
          );
        }).map(w => w.id);

        selectWidgets(overlapping);
        return;
      }

      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      // 3. Widget Rotating
      if (isRotating && selectedWidgetId) {
        const angle = Math.atan2(e.clientY - rotateStart.centerY, e.clientX - rotateStart.centerX) * (180 / Math.PI);
        let rotationDiff = angle - rotateStart.startAngle;
        let newRotation = Math.round(rotateStart.rotation + rotationDiff);
        
        // Hold shift to snap to 15 degrees
        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }

        // Clamp to [0, 360)
        newRotation = (newRotation % 360 + 360) % 360;
        updateWidget(selectedWidgetId, { rotation: newRotation });
        return;
      }

      // 4. Joint Dragging (including Snapping Guidelines)
      if (isDragging && draggedWidgetId) {
        const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
        const cursorY = ((e.clientY - rect.top) / rect.height) * 100;

        const mainWidgetOffset = dragOffsets[draggedWidgetId];
        if (!mainWidgetOffset) return;

        let targetX = cursorX - mainWidgetOffset.x;
        let targetY = cursorY - mainWidgetOffset.y;

        // Snapping calculations (only apply to primary dragged widget)
        const targetWidget = widgets.find(w => w.id === draggedWidgetId);
        if (!targetWidget) return;

        const wWidth = targetWidget.w;
        const wHeight = targetWidget.h;
        
        let snappedX = targetX;
        let snappedY = targetY;
        let verticalGuide: number | null = null;
        let horizontalGuide: number | null = null;
        let verticalEdgeLabel = '';
        let horizontalEdgeLabel = '';

        // Snapping boundaries
        const dragLeft = targetX;
        const dragRight = targetX + wWidth;
        const dragTop = targetY;
        const dragBottom = targetY + wHeight;
        const dragCenterX = targetX + wWidth / 2;
        const dragCenterY = targetY + wHeight / 2;

        if (snapToGrid) {
          // Canvas Center snaps
          if (Math.abs(dragCenterX - 50) < SNAP_THRESHOLD) {
            snappedX = 50 - wWidth / 2;
            verticalGuide = 50;
            verticalEdgeLabel = 'Center X';
          }
          if (Math.abs(dragCenterY - 50) < SNAP_THRESHOLD) {
            snappedY = 50 - wHeight / 2;
            horizontalGuide = 50;
            horizontalEdgeLabel = 'Center Y';
          }

          // Align with other widgets
          widgets.forEach(w => {
            if (w.id === draggedWidgetId || selectedWidgetIds.includes(w.id)) return;

            const otherLeft = w.x;
            const otherRight = w.x + w.w;
            const otherTop = w.y;
            const otherBottom = w.y + w.h;
            const otherCenterX = w.x + w.w / 2;
            const otherCenterY = w.y + w.h / 2;

            // X-alignment (Left to Left, Right to Right, Left to Right, Center X)
            if (Math.abs(dragLeft - otherLeft) < SNAP_THRESHOLD) {
              snappedX = otherLeft;
              verticalGuide = otherLeft;
              verticalEdgeLabel = 'Left Edge';
            } else if (Math.abs(dragRight - otherRight) < SNAP_THRESHOLD) {
              snappedX = otherRight - wWidth;
              verticalGuide = otherRight;
              verticalEdgeLabel = 'Right Edge';
            } else if (Math.abs(dragLeft - otherRight) < SNAP_THRESHOLD) {
              snappedX = otherRight;
              verticalGuide = otherRight;
              verticalEdgeLabel = 'Edge Snap';
            } else if (Math.abs(dragRight - otherLeft) < SNAP_THRESHOLD) {
              snappedX = otherLeft - wWidth;
              verticalGuide = otherLeft;
              verticalEdgeLabel = 'Edge Snap';
            } else if (Math.abs(dragCenterX - otherCenterX) < SNAP_THRESHOLD) {
              snappedX = otherCenterX - wWidth / 2;
              verticalGuide = otherCenterX;
              verticalEdgeLabel = 'Center X';
            }

            // Y-alignment (Top to Top, Bottom to Bottom, Top to Bottom, Center Y)
            if (Math.abs(dragTop - otherTop) < SNAP_THRESHOLD) {
              snappedY = otherTop;
              horizontalGuide = otherTop;
              horizontalEdgeLabel = 'Top Edge';
            } else if (Math.abs(dragBottom - otherBottom) < SNAP_THRESHOLD) {
              snappedY = otherBottom - wHeight;
              horizontalGuide = otherBottom;
              horizontalEdgeLabel = 'Bottom Edge';
            } else if (Math.abs(dragTop - otherBottom) < SNAP_THRESHOLD) {
              snappedY = otherBottom;
              horizontalGuide = otherBottom;
              horizontalEdgeLabel = 'Edge Snap';
            } else if (Math.abs(dragBottom - otherTop) < SNAP_THRESHOLD) {
              snappedY = otherTop - wHeight;
              horizontalGuide = otherTop;
              horizontalEdgeLabel = 'Edge Snap';
            } else if (Math.abs(dragCenterY - otherCenterY) < SNAP_THRESHOLD) {
              snappedY = otherCenterY - wHeight / 2;
              horizontalGuide = otherCenterY;
              horizontalEdgeLabel = 'Center Y';
            }
          });
        }

        // Apply grid division if no line snaps
        if (snapToGrid && !verticalGuide) {
          snappedX = Math.round(snappedX / GRID_SIZE) * GRID_SIZE;
        }
        if (snapToGrid && !horizontalGuide) {
          snappedY = Math.round(snappedY / GRID_SIZE) * GRID_SIZE;
        }

        // Boundaries limits
        snappedX = Math.max(0, Math.min(snappedX, 100 - wWidth));
        snappedY = Math.max(0, Math.min(snappedY, 96 - wHeight)); // Leave Ticker space

        // Setup snap helper lines
        const lines: Array<{ type: 'v' | 'h'; pos: number; edge?: string }> = [];
        if (verticalGuide !== null) lines.push({ type: 'v', pos: verticalGuide, edge: verticalEdgeLabel });
        if (horizontalGuide !== null) lines.push({ type: 'h', pos: horizontalGuide, edge: horizontalEdgeLabel });
        setSnapLines(lines);

        // Apply position shifts to all non-locked selected widgets
        const deltaX = snappedX - targetWidget.x;
        const deltaY = snappedY - targetWidget.y;

        const batchUpdates: Record<string, Partial<Widget>> = {};
        selectedWidgetIds.forEach(id => {
          const wObj = widgets.find(w => w.id === id);
          if (wObj && !wObj.locked) {
            batchUpdates[id] = {
              x: Math.max(0, Math.min(wObj.x + deltaX, 100 - wObj.w)),
              y: Math.max(0, Math.min(wObj.y + deltaY, 96 - wObj.h))
            };
          }
        });
        updateWidgets(batchUpdates);
        return;
      }

      // 5. Advanced 8-Handle Resizing
      if (isResizing && selectedWidgetId && resizeHandle) {
        const deltaX = e.clientX - resizeStart.clientX;
        const deltaY = e.clientY - resizeStart.clientY;

        const deltaXPct = (deltaX / rect.width) * 100;
        const deltaYPct = (deltaY / rect.height) * 100;

        let newX = resizeStart.x;
        let newY = resizeStart.y;
        let newW = resizeStart.w;
        let newH = resizeStart.h;

        // Apply resizing transformations depending on handle
        if (resizeHandle.includes('e')) {
          newW = resizeStart.w + deltaXPct;
        }
        if (resizeHandle.includes('w')) {
          newW = resizeStart.w - deltaXPct;
          newX = resizeStart.x + deltaXPct;
        }
        if (resizeHandle.includes('s')) {
          newH = resizeStart.h + deltaYPct;
        }
        if (resizeHandle.includes('n')) {
          newH = resizeStart.h - deltaYPct;
          newY = resizeStart.y + deltaYPct;
        }

        // Apply grid snapping to width/height
        if (snapToGrid) {
          newW = Math.round(newW / GRID_SIZE) * GRID_SIZE;
          newH = Math.round(newH / GRID_SIZE) * GRID_SIZE;
          newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        }

        // Enforce Min sizes
        const MIN_SIZE = 4;
        if (newW < MIN_SIZE) {
          if (resizeHandle.includes('w')) newX = resizeStart.x + resizeStart.w - MIN_SIZE;
          newW = MIN_SIZE;
        }
        if (newH < MIN_SIZE) {
          if (resizeHandle.includes('n')) newY = resizeStart.y + resizeStart.h - MIN_SIZE;
          newH = MIN_SIZE;
        }

        updateWidget(selectedWidgetId, {
          x: Math.max(0, Math.min(newX, 100 - MIN_SIZE)),
          y: Math.max(0, Math.min(newY, 96 - MIN_SIZE)),
          w: Math.min(newW, 100 - newX),
          h: Math.min(newH, 96 - newY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
      setSnapLines([]);

      if (isDragging || isResizing || isRotating) {
        setIsDragging(false);
        setIsResizing(false);
        setIsRotating(false);
        setDraggedWidgetId(null);
        setResizeHandle(null);
        pushHistoryState();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isPanning, marqueeStart, isDragging, isResizing, isRotating,
    draggedWidgetId, dragOffsets, resizeHandle, resizeStart, rotateStart,
    widgets, snapToGrid, selectedWidgetId, selectedWidgetIds, updateWidget, updateWidgets, pushHistoryState
  ]);

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setCanvasZoom(canvasZoom * zoomFactor);
    }
  };

  // Keyboard events: arrow keys to nudge, duplicate/delete shortcuts, undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      const nudgeStep = e.shiftKey ? 5 : 1;

      // nudging
      if (selectedWidgetIds.length > 0) {
        if (e.key === 'ArrowLeft') {
          selectedWidgetIds.forEach(id => {
            const w = widgets.find(x => x.id === id);
            if (w && !w.locked) updateWidget(id, { x: Math.max(0, w.x - nudgeStep) });
          });
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          selectedWidgetIds.forEach(id => {
            const w = widgets.find(x => x.id === id);
            if (w && !w.locked) updateWidget(id, { x: Math.min(100 - w.w, w.x + nudgeStep) });
          });
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          selectedWidgetIds.forEach(id => {
            const w = widgets.find(x => x.id === id);
            if (w && !w.locked) updateWidget(id, { y: Math.max(0, w.y - nudgeStep) });
          });
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          selectedWidgetIds.forEach(id => {
            const w = widgets.find(x => x.id === id);
            if (w && !w.locked) updateWidget(id, { y: Math.min(96 - w.h, w.y + nudgeStep) });
          });
          e.preventDefault();
        }
      }

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedWidgetIds.forEach(id => removeWidget(id));
        e.preventDefault();
      }

      // Undo/Redo (Ctrl+Z / Ctrl+Y)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        undo();
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
        e.preventDefault();
      }

      // Copy/Paste (Ctrl+C / Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedWidgetId) {
        copyWidget(selectedWidgetId);
        copyWidgetStyle(selectedWidgetId);
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        pasteWidget();
        e.preventDefault();
      }

      // Duplicate (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedWidgetId) {
        duplicateWidget(selectedWidgetId);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedWidgetIds, selectedWidgetId, widgets, updateWidget, removeWidget, 
    duplicateWidget, undo, redo, copyWidgetStyle, pasteWidgetStyle, copyWidget, pasteWidget
  ]);

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTemplateName.trim()) {
      saveTemplate(newTemplateName.trim());
      setNewTemplateName('');
      setShowTemplateModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/5 rounded-xl p-4 overflow-hidden relative select-none">
      
      {/* Editor toolbar */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold text-vibeSecondary font-display tracking-widest bg-vibeSecondary/15 px-3 py-1 rounded">
            Scene: {activeScene.replace('-', ' ')}
          </span>
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#120e24] border border-purple-900/30 rounded-lg p-0.5 ml-2">
            <button onClick={() => setCanvasZoom(canvasZoom - 0.1)} className="p-1 hover:bg-white/5 rounded text-white/70" title="Zoom Out (Ctrl+-)">
              <ZoomOut size={12} />
            </button>
            <span className="text-[10px] text-white/50 w-10 text-center font-bold">{Math.round(canvasZoom * 100)}%</span>
            <button onClick={() => setCanvasZoom(canvasZoom + 0.1)} className="p-1 hover:bg-white/5 rounded text-white/70" title="Zoom In (Ctrl++)">
              <ZoomIn size={12} />
            </button>
            <button onClick={() => { setCanvasZoom(1.0); setCanvasPan({ x: 0, y: 0 }); }} className="p-1 hover:bg-white/5 rounded text-purple-400 font-bold text-[9px]">
              Reset
            </button>
          </div>
        </div>

        {/* Alignment distribution & safe-zones */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedWidgetIds.length > 1 && (
            <div className="flex items-center gap-1 bg-[#120e24] border border-purple-900/30 rounded-lg p-1.5 shadow-lg">
              {/* Align Left */}
              <button 
                onClick={() => alignSelected('left')} 
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" 
                title="Align Left"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="10" y="10" width="8" height="80" />
                  <rect x="28" y="25" width="55" height="15" />
                  <rect x="28" y="55" width="35" height="15" />
                </svg>
              </button>

              {/* Align Center Horizontal */}
              <button 
                onClick={() => alignSelected('center')} 
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" 
                title="Align Horizontally Centered"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="46" y="10" width="8" height="80" />
                  <rect x="20" y="25" width="60" height="15" />
                  <rect x="30" y="55" width="40" height="15" />
                </svg>
              </button>

              {/* Align Right */}
              <button 
                onClick={() => alignSelected('right')} 
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" 
                title="Align Right"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="82" y="10" width="8" height="80" />
                  <rect x="17" y="25" width="55" height="15" />
                  <rect x="37" y="55" width="35" height="15" />
                </svg>
              </button>

              <div className="w-[1px] h-4 bg-purple-950 mx-0.5" />

              {/* Align Top */}
              <button 
                onClick={() => alignSelected('top')} 
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" 
                title="Align Top"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="10" y="10" width="80" height="8" />
                  <rect x="25" y="28" width="15" height="55" />
                  <rect x="55" y="28" width="15" height="35" />
                </svg>
              </button>

              {/* Align Center Vertical */}
              <button 
                onClick={() => alignSelected('middle')} 
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" 
                title="Align Vertically Centered"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="10" y="46" width="80" height="8" />
                  <rect x="25" y="20" width="15" height="60" />
                  <rect x="55" y="30" width="15" height="40" />
                </svg>
              </button>

              {/* Align Bottom */}
              <button 
                onClick={() => alignSelected('bottom')} 
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" 
                title="Align Bottom"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="10" y="82" width="80" height="8" />
                  <rect x="25" y="17" width="15" height="55" />
                  <rect x="55" y="37" width="15" height="35" />
                </svg>
              </button>

              <div className="w-[1px] h-4 bg-purple-950 mx-0.5" />

              {/* Distribute Horizontally */}
              <button 
                onClick={() => distributeSelected('horizontal')} 
                className="p-1 rounded hover:bg-white/10 text-vibeCyan hover:text-vibeCyan/80 transition" 
                title="Distribute Horizontally"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="10" y="15" width="8" height="70" />
                  <rect x="82" y="15" width="8" height="70" />
                  <rect x="46" y="25" width="8" height="50" />
                </svg>
              </button>

              {/* Distribute Vertically */}
              <button 
                onClick={() => distributeSelected('vertical')} 
                className="p-1 rounded hover:bg-white/10 text-vibeCyan hover:text-vibeCyan/80 transition" 
                title="Distribute Vertically"
              >
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-current">
                  <rect x="15" y="10" width="70" height="8" />
                  <rect x="15" y="82" width="70" height="8" />
                  <rect x="25" y="46" width="50" height="8" />
                </svg>
              </button>
            </div>
          )}

          {/* Templates & Guides toggles */}
          <div className="flex items-center gap-1.5 bg-[#120e24] border border-purple-900/30 rounded-lg p-1">
            <button 
              onClick={() => setShowTemplateModal(true)} 
              className="p-1 hover:bg-white/5 rounded text-[10px] font-bold text-vibeSecondary flex items-center gap-1"
              title="Save layout template"
            >
              <Save size={11} /> Save Template
            </button>
            
            {Object.keys(templates).length > 0 && (
              <select 
                onChange={(e) => e.target.value && loadTemplate(e.target.value)} 
                defaultValue="" 
                className="bg-black/55 border border-purple-950 text-[10px] text-slate-300 rounded max-w-[100px]"
              >
                <option value="">Presets...</option>
                {Object.keys(templates).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
            
            <div className="w-[1px] h-4 bg-white/10 mx-0.5"></div>
            
            <button 
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`p-1 text-[9px] font-bold rounded transition ${showSafeZones ? 'bg-indigo-900/30 text-indigo-400' : 'text-slate-500'}`}
              title="Toggle Safe Zones"
            >
              Safe Zones
            </button>
          </div>
          
          {/* Undo/Redo & Snap toggles */}
          <div className="flex items-center gap-1.5 bg-[#120e24] border border-purple-900/30 rounded-lg p-1">
            <button onClick={undo} className="p-1.5 hover:bg-white/5 rounded text-white/70 hover:text-white" title="Undo (Ctrl+Z)">
              <RotateCcw size={13} />
            </button>
            <button onClick={redo} className="p-1.5 hover:bg-white/5 rounded text-white/70 hover:text-white" title="Redo (Ctrl+Y)">
              <RotateCw size={13} />
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-0.5"></div>
            <button 
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition ${snapToGrid ? 'bg-vibePrimary text-white shadow-glow' : 'text-white/60'}`}
              title="Toggle Alignment Grid (2% steps)"
            >
              <Grid size={12} /> {snapToGrid ? 'Snap ON' : 'Snap OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* aspect ratio editor workspace box */}
      <div 
        ref={canvasContainerRef}
        onWheel={handleWheel}
        className="flex-grow flex items-center justify-center overflow-hidden relative bg-[#07050f] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        style={{
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.9)'
        }}
      >
        <div 
          ref={canvasRef}
          className={`theme-${activeTheme} absolute origin-center select-none overflow-hidden aspect-ratio-16-9`}
          style={{ 
            width: '100%',
            aspectRatio: '16 / 9',
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 20px rgba(168,85,247,0.15)',
            backgroundColor: 'var(--bg-color, #05020a)',
            border: '2px solid rgba(168,85,247,0.4)',
          }}
        >
          {/* Snap Grid visual background dots */}
          {snapToGrid && (
            <div className="absolute inset-0 canvas-grid bg-[radial-gradient(rgba(168,85,247,0.15)_1.2px,transparent_1.2px)] bg-[size:4%_4%] pointer-events-none opacity-30 z-0"></div>
          )}

          {/* Safe Zones display */}
          {showSafeZones && (
            <>
              {/* 90% Action Safe */}
              <div className="absolute inset-[5%] border border-dashed border-white/10 pointer-events-none z-0 safe-zone">
                <span className="absolute top-1 left-2 text-[8px] text-white/20 select-none uppercase font-bold tracking-widest font-display">90% Action Safe</span>
              </div>
              {/* 95% Title Safe */}
              <div className="absolute inset-[2.5%] border border-dashed border-white/5 pointer-events-none z-0 safe-zone" />
            </>
          )}

          {/* Canvas Bottom Ticker mockup block */}
          <div className="absolute bottom-0 left-0 w-full h-[6%] bg-purple-950/20 border-t border-purple-500/20 flex items-center px-4 text-[1vw] font-bold text-white/35 pointer-events-none z-10">
            📢 BOTTOM SCROLLING INFORMATION FOOTER TICKER
          </div>

          {/* Render scene element boxes */}
          {widgets.map(widget => {
            const isSelected = selectedWidgetIds.includes(widget.id);
            const isEditing = editingWidgetId === widget.id;

            return (
              <div
                key={widget.id}
                onMouseDown={(e) => handleDragStart(e, widget)}
                className={`absolute flex flex-col group transition-shadow ${
                  widget.locked ? 'pointer-events-none border-dashed border-amber-500/30' : ''
                } ${
                  isSelected ? 'border-vibeAccent shadow-cyber ring-1 ring-vibeAccent/40 z-30' : 'hover:border-purple-500/35 border-transparent'
                }`}
                style={{
                  left: `${widget.x}%`,
                  top: `${widget.y}%`,
                  width: `${widget.w}%`,
                  height: `${widget.h}%`,
                  transform: `rotate(${widget.rotation || 0}deg) scale(${widget.scale || 1.0})`,
                  transformOrigin: 'center center',
                  zIndex: widget.zIndex || 1,
                  cursor: widget.locked ? 'not-allowed' : 'move'
                }}
              >
                {/* Visual Label header of widget */}
                <div 
                  className="flex justify-between items-center bg-black/75 px-2 py-0.5 text-[0.85vw] text-white/80 font-semibold border-b border-white/5 truncate cursor-text"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!widget.locked) setEditingWidgetId(widget.id);
                  }}
                >
                  {isEditing ? (
                    <input 
                      type="text" 
                      defaultValue={widget.label} 
                      onBlur={(e) => {
                        updateWidget(widget.id, { label: e.target.value.trim() || widget.label });
                        setEditingWidgetId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateWidget(widget.id, { label: (e.target as HTMLInputElement).value.trim() || widget.label });
                          setEditingWidgetId(null);
                        }
                      }}
                      className="bg-black/90 text-white text-[0.8vw] font-bold border border-vibeAccent rounded px-1 w-28 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="flex items-center gap-1 truncate pointer-events-none">
                      {widget.locked && <Lock size={9} className="text-amber-500 flex-shrink-0" />}
                      {widget.label}
                    </span>
                  )}
                  <span className="text-[0.7vw] text-purple-400 flex-shrink-0 pointer-events-none">{widget.type}</span>
                </div>

                {/* Inner component demo view */}
                <div className="flex-grow relative overflow-hidden pointer-events-none rounded-b-lg">
                  <WidgetRenderer widget={widget} isEditor={true} />
                </div>

                {/* Snapping rotation handle */}
                {isSelected && !widget.locked && (
                  <div 
                    onMouseDown={(e) => handleRotateStart(e, widget)}
                    className="absolute top-[-26px] left-1/2 transform -translate-x-1/2 w-4 h-4 cursor-grab active:cursor-grabbing flex items-center justify-center bg-purple-500 text-white rounded-full shadow border border-purple-400"
                    title="Rotate Widget (Hold Shift to snap)"
                  >
                    <RefreshCw size={8} className="animate-pulse" />
                  </div>
                )}

                {/* Resize Handles (8 handle points nw, n, ne, e, se, s, sw, w) */}
                {isSelected && !widget.locked && (
                  <>
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 'nw')} className="absolute top-[-3px] left-[-3px] w-2.5 h-2.5 bg-vibeAccent border border-black cursor-nwse-resize z-50 rounded-sm" />
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 'n')} className="absolute top-[-3px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-vibeAccent border border-black cursor-ns-resize z-50 rounded-sm" />
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 'ne')} className="absolute top-[-3px] right-[-3px] w-2.5 h-2.5 bg-vibeAccent border border-black cursor-nesw-resize z-50 rounded-sm" />
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 'e')} className="absolute top-1/2 right-[-3px] transform -translate-y-1/2 w-2 h-2 bg-vibeAccent border border-black cursor-ew-resize z-50 rounded-sm" />
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 'se')} className="absolute bottom-[-3px] right-[-3px] w-2.5 h-2.5 bg-vibeAccent border border-black cursor-nwse-resize z-50 rounded-sm" />
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 's')} className="absolute bottom-[-3px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-vibeAccent border border-black cursor-ns-resize z-50 rounded-sm" />
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 'sw')} className="absolute bottom-[-3px] left-[-3px] w-2.5 h-2.5 bg-vibeAccent border border-black cursor-nesw-resize z-50 rounded-sm" />
                    <div onMouseDown={(e) => handleResizeStart(e, widget, 'w')} className="absolute top-1/2 left-[-3px] transform -translate-y-1/2 w-2 h-2 bg-vibeAccent border border-black cursor-ew-resize z-50 rounded-sm" />
                  </>
                )}

                {/* Widget Quick action floating buttons list */}
                {isSelected && (
                  <div className="absolute top-[-34px] right-0 bg-black/95 border border-purple-500/40 rounded-lg p-1.5 flex items-center gap-1.5 shadow-2xl z-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { locked: !widget.locked }); }}
                      className="p-1 hover:bg-white/10 rounded text-amber-500 hover:text-amber-400"
                      title={widget.locked ? "Unlock Widget" : "Lock Widget"}
                    >
                      {widget.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { visible: !widget.visible }); }}
                      className="p-1 hover:bg-white/10 rounded text-blue-400 hover:text-blue-300"
                      title={widget.visible ? "Hide Widget" : "Show Widget"}
                    >
                      {widget.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateWidget(widget.id); }}
                      className="p-1 hover:bg-white/10 rounded text-green-400 hover:text-green-300"
                      title="Duplicate Widget"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
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

          {/* Aggregate multi-selection bounding box visual border */}
          {selectionBounds && (
            <div 
              className="absolute border-2 border-dashed border-vibeSecondary pointer-events-none z-20 shadow-[0_0_12px_rgba(255,77,255,0.25)]"
              style={{
                left: `${selectionBounds.x}%`,
                top: `${selectionBounds.y}%`,
                width: `${selectionBounds.w}%`,
                height: `${selectionBounds.h}%`
              }}
            />
          )}

          {/* Snapping purple guidelines */}
          {snapLines.map((line, i) => (
            <div
              key={i}
              className="absolute pointer-events-none z-50 flex items-center justify-center"
              style={{
                background: '#FF4DFF',
                boxShadow: '0 0 6px #FF4DFF',
                left: line.type === 'v' ? `${line.pos}%` : 0,
                top: line.type === 'h' ? `${line.pos}%` : 0,
                width: line.type === 'v' ? '1.5px' : '100%',
                height: line.type === 'h' ? '1.5px' : '100%',
              }}
            >
              {line.edge && (
                <div 
                  className="bg-purple-900 border border-purple-500 text-white font-mono text-[7px] px-1 rounded absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    left: line.type === 'v' ? '50%' : '20px',
                    top: line.type === 'h' ? '50%' : '10px'
                  }}
                >
                  {line.edge}
                </div>
              )}
            </div>
          ))}

          {/* Marquee select visual drag box */}
          {marqueeStart && marqueeEnd && (
            <div
              className="absolute border border-dashed border-vibeAccent bg-vibeAccent/10 pointer-events-none z-50"
              style={{
                left: `${Math.min(marqueeStart.x, marqueeEnd.x)}%`,
                top: `${Math.min(marqueeStart.y, marqueeEnd.y)}%`,
                width: `${Math.abs(marqueeStart.x - marqueeEnd.x)}%`,
                height: `${Math.abs(marqueeStart.y - marqueeEnd.y)}%`,
              }}
            />
          )}

        </div>
      </div>

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveTemplateSubmit}
            className="bg-[#0b0918] border border-purple-500/30 p-5 rounded-2xl max-w-sm w-full flex flex-col gap-3.5 shadow-2xl"
          >
            <h4 className="font-display font-black text-white uppercase text-xs tracking-wider">Save Current Layout as Template</h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400">Template Name</label>
              <input 
                type="text"
                placeholder="e.g. Valorant Layout"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="bg-black/55 border border-purple-950 rounded p-2 text-xs text-white focus:border-vibePrimary focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button 
                type="button" 
                onClick={() => setShowTemplateModal(false)}
                className="px-3.5 py-1.5 rounded text-[10px] font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-vibePrimary hover:bg-vibePrimary/80 px-4 py-1.5 rounded text-[10px] font-bold text-white shadow-glow"
              >
                Save Preset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls Tips */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-purple-900/10 pt-2.5 mt-2 select-none">
        <span className="flex items-center gap-1"><Maximize size={11} className="text-vibeAccent" /> Space+Drag to Pan / Zoom (Ctrl+Wheel)</span>
        <span className="flex items-center gap-1"><HelpCircle size={11} className="text-vibeSecondary" /> Drag background to Multi-Select</span>
      </div>

    </div>
  );
};
