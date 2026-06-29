import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2, Grid, Magnet, Eye, Save, Radio,
  ChevronDown, Play, Pause, RotateCcw as ResetIcon, ArrowRight
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useSessionStore } from '../../store/sessionStore';
import { useLiveStore, startLiveTimerEngine } from '../../store/liveStore';

interface TopToolbarProps {
  // Add Widget panel modal no longer needed since it's in the left sidebar tab
}

const pad = (n: number) => String(n).padStart(2, '0');

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

export const TopToolbar: React.FC<TopToolbarProps> = () => {
  const {
    zoom, snapEnabled, showGrid, showGuides, editingSceneId, scenes,
    undo, redo, canUndo, canRedo, toggleSnap, toggleGrid, toggleGuides,
    setZoom, zoomIn, zoomOut, resetView,
  } = useEditorStore();

  const { saveScene, project } = useSessionStore();
  const { timer, liveSceneName, liveSceneId, addTime, pauseTimer, resumeTimer, resetTimer, syncToOBS } = useLiveStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showLiveDropdown, setShowLiveDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scene = scenes.find(s => s.id === editingSceneId);
  const liveScene = scenes.find(s => s.id === liveSceneId);

  // Initialize timer engine on boot
  useEffect(() => {
    startLiveTimerEngine();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLiveDropdown(false);
      }
    };
    if (showLiveDropdown) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showLiveDropdown]);

  const handleSave = useCallback(async () => {
    if (!editingSceneId) return;
    setIsSaving(true);
    await saveScene(editingSceneId);
    setTimeout(() => setIsSaving(false), 1000);
  }, [editingSceneId, saveScene]);

  const handleZoomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'fit') {
      resetView();
    } else {
      const z = parseFloat(val);
      if (!isNaN(z)) setZoom(z);
    }
  };

  const handleGoLive = async () => {
    if (!scene) return;
    await syncToOBS(scene.id, scene.name);
  };

  const isEditingLive = editingSceneId === liveSceneId;

  return (
    <div className="top-toolbar" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--color-surface)', height: 56, borderBottom: '1px solid var(--color-border)', padding: '0 16px', gap: 12, zIndex: 10 }}>
      {/* 1. Left Section: Logo & Project/Scene details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            {project?.name ?? 'My Stream Overlay'}
          </span>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            Active scene: {scene?.label ?? 'No Scene'}
          </span>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* 2. Center-Left: Undo / Redo */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn-icon" onClick={undo} disabled={!canUndo()} data-tooltip="Undo (Ctrl+Z)">
          <RotateCcw size={14} />
        </button>
        <button className="btn-icon" onClick={redo} disabled={!canRedo()} data-tooltip="Redo (Ctrl+Y)">
          <RotateCw size={14} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* 3. Center: Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className="btn-icon" onClick={zoomOut} data-tooltip="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <select
          className="select"
          value={zoom.toFixed(2)}
          onChange={handleZoomSelect}
          style={{ width: 80, fontSize: 11, padding: '4px 8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: 4, height: 28 }}
        >
          <option value="0.25">25%</option>
          <option value="0.50">50%</option>
          <option value="1.00">100%</option>
          <option value="2.00">200%</option>
          <option value="4.00">400%</option>
          <option value="fit">Fit (50%)</option>
        </select>
        <button className="btn-icon" onClick={zoomIn} data-tooltip="Zoom In">
          <ZoomIn size={14} />
        </button>
        <button className="btn-icon" onClick={resetView} data-tooltip="Fit Canvas">
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* 4. Center-Right: Canvas helpers */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button className={`btn-icon${showGrid ? ' active' : ''}`} onClick={toggleGrid} data-tooltip="Toggle Grid">
          <Grid size={14} />
        </button>
        <button className={`btn-icon${snapEnabled ? ' active' : ''}`} onClick={toggleSnap} data-tooltip="Toggle Snap">
          <Magnet size={14} />
        </button>
        <button className={`btn-icon${showGuides ? ' active' : ''}`} onClick={toggleGuides} data-tooltip="Toggle Guides">
          <Eye size={14} />
        </button>
      </div>

      <div className="toolbar-spacer" />

      {/* 5. Right: Actions & Live controller popover */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Save */}
        <button className="btn btn-secondary" onClick={handleSave} disabled={isSaving} style={{ height: 32, fontSize: 12, padding: '0 12px' }}>
          <Save size={13} />
          {isSaving ? 'Saved!' : 'Save Layout'}
        </button>

        {/* Go Live / Live Status button */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="go-live-btn"
            style={{
              width: 'auto', height: 32, padding: '0 12px', fontSize: 12, gap: 6,
              background: isEditingLive ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
              borderColor: isEditingLive ? 'var(--color-success)' : 'transparent',
              color: isEditingLive ? 'var(--color-success)' : '#fff',
              border: isEditingLive ? '1px solid var(--color-success)' : 'none',
              boxShadow: isEditingLive ? 'none' : '0 2px 8px rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center'
            }}
            onClick={(e) => { e.stopPropagation(); setShowLiveDropdown(prev => !prev); }}
          >
            <Radio size={13} className={isEditingLive ? '' : 'animate-pulse'} />
            {isEditingLive ? 'Live On Air' : 'Publish / Go Live'}
            <ChevronDown size={12} style={{ opacity: 0.8 }} />
          </button>

          {/* Floating Live Controls Dropdown Dropdown */}
          {showLiveDropdown && (
            <div style={{
              position: 'absolute', top: 38, right: 0, width: 280,
              background: 'rgba(14,8,26,0.98)', border: '1px solid var(--color-border-hover)',
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)', borderRadius: 12,
              padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
              zIndex: 100
            }}>
              {/* Broadcast status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status</span>
                <span style={{
                  background: isEditingLive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isEditingLive ? 'var(--color-success)' : '#ef4444',
                  fontSize: 8, fontWeight: 900, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase'
                }}>
                  {isEditingLive ? 'Synchronized' : 'Draft Modified'}
                </span>
              </div>

              {/* On air scene info */}
              <div style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 8, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>🔴 On Air Broadcast</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{liveScene?.label ?? liveSceneName}</span>
              </div>

              {/* Editing scene indicator */}
              {!isEditingLive && (
                <div style={{ padding: 8, background: 'rgba(168,85,247,0.05)', borderRadius: 8, border: '1px solid rgba(168,85,247,0.2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 8, color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase' }}>✏️ Editing Draft</span>
                  <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{scene?.label ?? 'No Scene'}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                className="go-live-btn"
                style={{ width: '100%', height: 32, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                onClick={() => { handleGoLive(); setShowLiveDropdown(false); }}
              >
                <ArrowRight size={12} />
                {isEditingLive ? 'Push Updates to Stream' : 'Switch OBS to This Scene'}
              </button>

              <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 0' }} />

              {/* Live stream timer controls */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Countdown Clock</span>
                <div className="timer-display" style={{ fontSize: 26, margin: '4px 0', textShadow: '0 0 10px rgba(92,255,226,0.3)' }}>{formatTime(timer.seconds)}</div>

                {/* + Time increments */}
                <div style={{ display: 'flex', gap: 4, width: '100%', marginBottom: 6 }}>
                  {[1, 5, 10].map(m => (
                    <button key={m} className="btn btn-secondary" style={{ flex: 1, fontSize: 9, height: 22, padding: 0 }}
                      onClick={() => addTime(m * 60)}>
                      +{m}m
                    </button>
                  ))}
                </div>

                {/* Play / pause */}
                <div style={{ display: 'flex', gap: 4, width: '100%' }}>
                  {timer.isRunning && !timer.isPaused ? (
                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: 9, height: 22, padding: 0, gap: 4 }} onClick={pauseTimer}>
                      <Pause size={10} /> Pause
                    </button>
                  ) : (
                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: 9, height: 22, padding: 0, gap: 4 }} onClick={resumeTimer}>
                      <Play size={10} /> Resume
                    </button>
                  )}
                  <button className="btn btn-secondary" style={{ height: 22, width: 26, padding: 0 }}
                    onClick={() => resetTimer(600)} data-tooltip="Reset to 10m">
                    <ResetIcon size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
