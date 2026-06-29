import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WidgetType =
  // Layout
  | 'header' | 'footer' | 'sidebar' | 'container' | 'background' | 'glass-panel' | 'divider' | 'spacer'
  // Text
  | 'text' | 'animated-text' | 'scrolling-text' | 'typing-text' | 'now-playing-text'
  | 'latest-follower' | 'latest-subscriber' | 'latest-donation' | 'viewer-count'
  | 'countdown-timer' | 'clock' | 'goal-counter' | 'social-links'
  // Media
  | 'image' | 'gif' | 'video' | 'lottie' | 'svg' | 'icon' | 'logo'
  | 'avatar-frame' | 'camera-frame' | 'game-capture' | 'vtuber' | '3d-model'
  // Stream
  | 'chat-box' | 'donation-feed' | 'follower-feed' | 'subscriber-feed'
  | 'event-list' | 'spotify' | 'alerts' | 'poll' | 'goals' | 'schedule' | 'weather'
  // Decorative
  | 'shape' | 'neon-card' | 'glass-card' | 'glow-effect' | 'particles' | 'line' | 'badge'
  | 'corner-decoration' | 'light-rays';

export type AnimationType = 'none' | 'fade' | 'scale' | 'slide-up' | 'slide-left' | 'bounce' | 'glow' | 'pulse' | 'float' | 'shake' | 'spin';

export type ShapeType = 'rectangle' | 'rounded' | 'pill' | 'circle' | 'ellipse' | 'hexagon' | 'octagon' | 'diamond' | 'ticket' | 'speech-bubble';

export interface WidgetStyle {
  // Background
  background?: string;
  gradient?: string;
  // Border
  borderRadius?: number;
  borderSize?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  // Shadow
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
  // Glow
  glowColor?: string;
  glowBlur?: number;
  // Spacing
  padding?: number;
  margin?: number;
  // Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  gradientText?: string;
  textStrokeColor?: string;
  textStrokeSize?: number;
  // Effects
  opacity?: number;
  blur?: number;
  glassEffect?: boolean;
  blendMode?: string;
  // Shape
  shape?: ShapeType;
  clipPath?: string;
}

export interface WidgetAnimation {
  type: AnimationType;
  duration: number;
  delay: number;
  loop: boolean;
  easing?: string;
}

export interface DraftWidget {
  id: string;
  type: WidgetType;
  label: string;
  // Position & size in px on 1920×1080 canvas
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  scale: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  groupId?: string;
  // Style, animation, content
  style: WidgetStyle;
  animation: WidgetAnimation;
  content: {
    type: string;
    settings: Record<string, any>;
  };
}

export interface Scene {
  id: string;
  name: string;
  label: string;
  thumbnail?: string;
  widgets: DraftWidget[];
}

// ─── Store State ──────────────────────────────────────────────────────────────

interface EditorState {
  // Active scene being edited
  editingSceneId: string | null;
  scenes: Scene[];

  // Canvas state
  zoom: number;
  pan: { x: number; y: number };
  snapEnabled: boolean;
  showGrid: boolean;
  showGuides: boolean;
  snapThreshold: number;

  // Selection
  selectedIds: string[];
  hoveredId: string | null;
  clipboard: DraftWidget[];

  // History (per scene)
  history: Record<string, DraftWidget[][]>;
  historyIndex: Record<string, number>;

  // UI panels
  showAddWidgetPanel: boolean;
  addWidgetPanelCategory: string;
  showLayersPanel: boolean;
  isDragging: boolean;
  isResizing: boolean;

  // ─── Actions ──────────────────────────────────────────────────────────────

  // Scene management
  setScenes: (scenes: Scene[]) => void;
  setEditingScene: (sceneId: string) => void;
  updateScene: (sceneId: string, updates: Partial<Omit<Scene, 'id' | 'widgets'>>) => void;

  // Widget CRUD (on draft only)
  addWidget: (widget: DraftWidget) => void;
  removeWidget: (widgetId: string) => void;
  removeSelectedWidgets: () => void;
  updateWidget: (widgetId: string, updates: Partial<DraftWidget>) => void;
  updateWidgets: (updates: Record<string, Partial<DraftWidget>>) => void;
  duplicateWidget: (widgetId: string) => void;
  bringForward: (widgetId: string) => void;
  sendBackward: (widgetId: string) => void;
  bringToFront: (widgetId: string) => void;
  sendToBack: (widgetId: string) => void;
  groupSelected: () => void;
  ungroupSelected: () => void;

  // Selection
  selectWidget: (id: string, additive?: boolean) => void;
  selectWidgets: (ids: string[]) => void;
  deselectAll: () => void;
  setHovered: (id: string | null) => void;

  // Clipboard
  copySelected: () => void;
  pasteClipboard: () => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Canvas
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleSnap: () => void;
  toggleGrid: () => void;
  toggleGuides: () => void;

  // Panels
  openAddWidgetPanel: (category?: string) => void;
  closeAddWidgetPanel: () => void;
  setIsDragging: (v: boolean) => void;
  setIsResizing: (v: boolean) => void;

  // Computed helpers
  getDraftWidgets: () => DraftWidget[];
  getSelectedWidgets: () => DraftWidget[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

const pushHistory = (
  history: Record<string, DraftWidget[][]>,
  historyIndex: Record<string, number>,
  sceneId: string,
  widgets: DraftWidget[]
): { history: Record<string, DraftWidget[][]>; historyIndex: Record<string, number> } => {
  const currentIdx = historyIndex[sceneId] ?? 0;
  const sceneHistory = history[sceneId] ?? [[]];
  // Slice off any redo states
  const newHistory = sceneHistory.slice(0, currentIdx + 1);
  newHistory.push(widgets.map(w => ({ ...w, style: { ...w.style } })));
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return {
    history: { ...history, [sceneId]: newHistory },
    historyIndex: { ...historyIndex, [sceneId]: newHistory.length - 1 },
  };
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set, get) => ({
  editingSceneId: null,
  scenes: [],
  zoom: 0.5,
  pan: { x: 0, y: 0 },
  snapEnabled: true,
  showGrid: true,
  showGuides: true,
  snapThreshold: 8,
  selectedIds: [],
  hoveredId: null,
  clipboard: [],
  history: {},
  historyIndex: {},
  showAddWidgetPanel: false,
  addWidgetPanelCategory: 'Layout',
  showLayersPanel: true,
  isDragging: false,
  isResizing: false,

  // ─── Scene management ────────────────────────────────────────────────────

  setScenes: (scenes) => set({ scenes }),

  setEditingScene: (sceneId) => {
    set({ editingSceneId: sceneId, selectedIds: [] });
  },

  updateScene: (sceneId, updates) => set(s => ({
    scenes: s.scenes.map(sc => sc.id === sceneId ? { ...sc, ...updates } : sc),
  })),

  // ─── Widget CRUD ─────────────────────────────────────────────────────────

  getDraftWidgets: () => {
    const { editingSceneId, scenes } = get();
    if (!editingSceneId) return [];
    return scenes.find(s => s.id === editingSceneId)?.widgets ?? [];
  },

  addWidget: (widget) => {
    const { editingSceneId } = get();
    if (!editingSceneId) return;
    get().pushHistory();
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId
          ? { ...sc, widgets: [...sc.widgets, widget] }
          : sc
      ),
      selectedIds: [widget.id],
    }));
  },

  removeWidget: (widgetId) => {
    const { editingSceneId } = get();
    if (!editingSceneId) return;
    get().pushHistory();
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId
          ? { ...sc, widgets: sc.widgets.filter(w => w.id !== widgetId) }
          : sc
      ),
      selectedIds: s.selectedIds.filter(id => id !== widgetId),
    }));
  },

  removeSelectedWidgets: () => {
    const { editingSceneId, selectedIds } = get();
    if (!editingSceneId || selectedIds.length === 0) return;
    get().pushHistory();
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId
          ? { ...sc, widgets: sc.widgets.filter(w => !selectedIds.includes(w.id)) }
          : sc
      ),
      selectedIds: [],
    }));
  },

  updateWidget: (widgetId, updates) => {
    const { editingSceneId } = get();
    if (!editingSceneId) return;
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId
          ? {
              ...sc,
              widgets: sc.widgets.map(w =>
                w.id === widgetId
                  ? { ...w, ...updates, style: updates.style ? { ...w.style, ...updates.style } : w.style }
                  : w
              ),
            }
          : sc
      ),
    }));
  },

  updateWidgets: (updates) => {
    const { editingSceneId } = get();
    if (!editingSceneId) return;
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId
          ? {
              ...sc,
              widgets: sc.widgets.map(w => {
                const u = updates[w.id];
                if (!u) return w;
                return { ...w, ...u, style: u.style ? { ...w.style, ...u.style } : w.style };
              }),
            }
          : sc
      ),
    }));
  },

  duplicateWidget: (widgetId) => {
    const { editingSceneId, scenes } = get();
    if (!editingSceneId) return;
    const scene = scenes.find(s => s.id === editingSceneId);
    const original = scene?.widgets.find(w => w.id === widgetId);
    if (!original) return;
    get().pushHistory();
    const newId = `widget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const clone: DraftWidget = {
      ...original,
      id: newId,
      x: original.x + 20,
      y: original.y + 20,
      zIndex: (scene?.widgets.reduce((mx, w) => Math.max(mx, w.zIndex), 0) ?? 0) + 1,
      style: { ...original.style },
      animation: { ...original.animation },
      content: { ...original.content, settings: { ...original.content.settings } },
    };
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId ? { ...sc, widgets: [...sc.widgets, clone] } : sc
      ),
      selectedIds: [newId],
    }));
  },

  bringForward: (widgetId) => {
    const { editingSceneId, scenes } = get();
    if (!editingSceneId) return;
    const scene = scenes.find(s => s.id === editingSceneId);
    if (!scene) return;
    const widget = scene.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    const above = scene.widgets.filter(w => w.zIndex === widget.zIndex + 1);
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId
          ? {
              ...sc,
              widgets: sc.widgets.map(w => {
                if (w.id === widgetId) return { ...w, zIndex: w.zIndex + 1 };
                if (above.some(a => a.id === w.id)) return { ...w, zIndex: w.zIndex - 1 };
                return w;
              }),
            }
          : sc
      ),
    }));
  },

  sendBackward: (widgetId) => {
    const { editingSceneId, scenes } = get();
    if (!editingSceneId) return;
    const scene = scenes.find(s => s.id === editingSceneId);
    if (!scene) return;
    const widget = scene.widgets.find(w => w.id === widgetId);
    if (!widget || widget.zIndex <= 1) return;
    const below = scene.widgets.filter(w => w.zIndex === widget.zIndex - 1);
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId
          ? {
              ...sc,
              widgets: sc.widgets.map(w => {
                if (w.id === widgetId) return { ...w, zIndex: w.zIndex - 1 };
                if (below.some(b => b.id === w.id)) return { ...w, zIndex: w.zIndex + 1 };
                return w;
              }),
            }
          : sc
      ),
    }));
  },

  bringToFront: (widgetId) => {
    const { editingSceneId, scenes } = get();
    if (!editingSceneId) return;
    const scene = scenes.find(s => s.id === editingSceneId);
    if (!scene) return;
    const maxZ = scene.widgets.reduce((mx, w) => Math.max(mx, w.zIndex), 0);
    get().updateWidget(widgetId, { zIndex: maxZ + 1 });
  },

  sendToBack: (widgetId) => {
    get().updateWidget(widgetId, { zIndex: 0 });
  },

  groupSelected: () => {
    const { selectedIds } = get();
    if (selectedIds.length < 2) return;
    const groupId = `group-${Date.now()}`;
    get().updateWidgets(Object.fromEntries(selectedIds.map(id => [id, { groupId }])));
  },

  ungroupSelected: () => {
    const { selectedIds } = get();
    get().updateWidgets(Object.fromEntries(selectedIds.map(id => [id, { groupId: undefined }])));
  },

  // ─── Selection ────────────────────────────────────────────────────────────

  selectWidget: (id, additive = false) => {
    set(s => ({
      selectedIds: additive
        ? s.selectedIds.includes(id) ? s.selectedIds.filter(x => x !== id) : [...s.selectedIds, id]
        : [id],
    }));
  },

  selectWidgets: (ids) => set({ selectedIds: ids }),
  deselectAll: () => set({ selectedIds: [] }),
  setHovered: (id) => set({ hoveredId: id }),

  getSelectedWidgets: () => {
    const { editingSceneId, scenes, selectedIds } = get();
    const scene = scenes.find(s => s.id === editingSceneId);
    if (!scene) return [];
    return scene.widgets.filter(w => selectedIds.includes(w.id));
  },

  // ─── Clipboard ────────────────────────────────────────────────────────────

  copySelected: () => {
    const selected = get().getSelectedWidgets();
    set({ clipboard: selected.map(w => ({ ...w, style: { ...w.style } })) });
  },

  pasteClipboard: () => {
    const { clipboard, editingSceneId, scenes } = get();
    if (clipboard.length === 0 || !editingSceneId) return;
    get().pushHistory();
    const scene = scenes.find(s => s.id === editingSceneId);
    let maxZ = scene?.widgets.reduce((mx, w) => Math.max(mx, w.zIndex), 0) ?? 0;
    const newWidgets = clipboard.map(w => ({
      ...w,
      id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      x: w.x + 20,
      y: w.y + 20,
      zIndex: ++maxZ,
      style: { ...w.style },
    }));
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId ? { ...sc, widgets: [...sc.widgets, ...newWidgets] } : sc
      ),
      selectedIds: newWidgets.map(w => w.id),
    }));
  },

  // ─── History ──────────────────────────────────────────────────────────────

  pushHistory: () => {
    const { editingSceneId, scenes, history, historyIndex } = get();
    if (!editingSceneId) return;
    const scene = scenes.find(s => s.id === editingSceneId);
    if (!scene) return;
    const result = pushHistory(history, historyIndex, editingSceneId, scene.widgets);
    set(result);
  },

  undo: () => {
    const { editingSceneId, history, historyIndex } = get();
    if (!editingSceneId) return;
    const idx = historyIndex[editingSceneId] ?? 0;
    if (idx <= 0) return;
    const newIdx = idx - 1;
    const widgets = history[editingSceneId]?.[newIdx] ?? [];
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId ? { ...sc, widgets: widgets.map(w => ({ ...w })) } : sc
      ),
      historyIndex: { ...s.historyIndex, [editingSceneId]: newIdx },
      selectedIds: [],
    }));
  },

  redo: () => {
    const { editingSceneId, history, historyIndex } = get();
    if (!editingSceneId) return;
    const idx = historyIndex[editingSceneId] ?? 0;
    const sceneHistory = history[editingSceneId] ?? [];
    if (idx >= sceneHistory.length - 1) return;
    const newIdx = idx + 1;
    const widgets = sceneHistory[newIdx];
    set(s => ({
      scenes: s.scenes.map(sc =>
        sc.id === editingSceneId ? { ...sc, widgets: widgets.map(w => ({ ...w })) } : sc
      ),
      historyIndex: { ...s.historyIndex, [editingSceneId]: newIdx },
      selectedIds: [],
    }));
  },

  canUndo: () => {
    const { editingSceneId, historyIndex } = get();
    if (!editingSceneId) return false;
    return (historyIndex[editingSceneId] ?? 0) > 0;
  },

  canRedo: () => {
    const { editingSceneId, history, historyIndex } = get();
    if (!editingSceneId) return false;
    const idx = historyIndex[editingSceneId] ?? 0;
    return idx < (history[editingSceneId]?.length ?? 1) - 1;
  },

  // ─── Canvas ───────────────────────────────────────────────────────────────

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(4, zoom)) }),
  setPan: (pan) => set({ pan }),
  zoomIn: () => set(s => ({ zoom: Math.min(4, s.zoom + 0.1) })),
  zoomOut: () => set(s => ({ zoom: Math.max(0.1, s.zoom - 0.1) })),
  resetView: () => set({ zoom: 0.5, pan: { x: 0, y: 0 } }),
  toggleSnap: () => set(s => ({ snapEnabled: !s.snapEnabled })),
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  toggleGuides: () => set(s => ({ showGuides: !s.showGuides })),

  // ─── Panels ───────────────────────────────────────────────────────────────

  openAddWidgetPanel: (category = 'Layout') => set({ showAddWidgetPanel: true, addWidgetPanelCategory: category }),
  closeAddWidgetPanel: () => set({ showAddWidgetPanel: false }),
  setIsDragging: (v) => set({ isDragging: v }),
  setIsResizing: (v) => set({ isResizing: v }),
}));
