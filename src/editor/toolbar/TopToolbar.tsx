import React, { useState, useCallback } from 'react';
import {
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2, Grid, Magnet, Eye, Save, Radio,
  Layers, Plus
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useSessionStore } from '../../store/sessionStore';

interface TopToolbarProps {
  onOpenAddWidget: () => void;
  onOpenLivePanel: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onOpenAddWidget, onOpenLivePanel }) => {
  const {
    zoom, snapEnabled, showGrid, showGuides, editingSceneId, scenes,
    undo, redo, canUndo, canRedo, toggleSnap, toggleGrid, toggleGuides,
    setZoom, zoomIn, zoomOut, resetView,
  } = useEditorStore();

  const { saveScene } = useSessionStore();
  const [isSaving, setIsSaving] = useState(false);

  const scene = scenes.find(s => s.id === editingSceneId);

  const handleSave = useCallback(async () => {
    if (!editingSceneId) return;
    setIsSaving(true);
    await saveScene(editingSceneId);
    setTimeout(() => setIsSaving(false), 1000);
  }, [editingSceneId, saveScene]);

  const handleZoomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v)) setZoom(v / 100);
  };

  return (
    <div className="top-toolbar">
      {/* Scene name */}
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', minWidth: 120, truncate: 'true', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {scene?.label ?? 'No Scene'}
      </span>

      <div className="toolbar-divider" />

      {/* Undo / Redo */}
      <button className="btn-icon" onClick={undo} disabled={!canUndo()} data-tooltip="Undo (Ctrl+Z)">
        <RotateCcw size={14} />
      </button>
      <button className="btn-icon" onClick={redo} disabled={!canRedo()} data-tooltip="Redo (Ctrl+Y)">
        <RotateCw size={14} />
      </button>

      <div className="toolbar-divider" />

      {/* Zoom */}
      <button className="btn-icon" onClick={zoomOut} data-tooltip="Zoom Out">
        <ZoomOut size={14} />
      </button>
      <input
        type="number"
        className="input input-mono"
        value={Math.round(zoom * 100)}
        onChange={handleZoomInput}
        style={{ width: 56, textAlign: 'center', padding: '4px 6px' }}
        min={10} max={400} step={10}
      />
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>%</span>
      <button className="btn-icon" onClick={zoomIn} data-tooltip="Zoom In">
        <ZoomIn size={14} />
      </button>
      <button className="btn-icon" onClick={resetView} data-tooltip="Fit to Screen">
        <Maximize2 size={14} />
      </button>

      <div className="toolbar-divider" />

      {/* Canvas helpers */}
      <button className={`btn-icon${showGrid ? ' active' : ''}`} onClick={toggleGrid} data-tooltip="Toggle Grid">
        <Grid size={14} />
      </button>
      <button className={`btn-icon${snapEnabled ? ' active' : ''}`} onClick={toggleSnap} data-tooltip="Toggle Snap">
        <Magnet size={14} />
      </button>
      <button className={`btn-icon${showGuides ? ' active' : ''}`} onClick={toggleGuides} data-tooltip="Toggle Guides">
        <Eye size={14} />
      </button>

      <div className="toolbar-divider" />

      {/* Add Widget */}
      <button className="btn btn-secondary" onClick={onOpenAddWidget} style={{ gap: 6 }}>
        <Plus size={13} /> Add Element
      </button>

      <div className="toolbar-spacer" />

      {/* Save */}
      <button className="btn btn-secondary" onClick={handleSave} disabled={isSaving}>
        <Save size={13} />
        {isSaving ? 'Saved!' : 'Save'}
      </button>

      {/* Go Live */}
      <button className="go-live-btn" style={{ width: 'auto', padding: '7px 16px' }} onClick={onOpenLivePanel}>
        <Radio size={13} /> Go Live
      </button>
    </div>
  );
};
