import React, { useEffect, useState } from 'react';
import { Radio, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { useLiveStore, startLiveTimerEngine } from '../../store/liveStore';
import { useEditorStore } from '../../store/editorStore';

const pad = (n: number) => String(n).padStart(2, '0');

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

export const LiveControlPanel: React.FC = () => {
  const { timer, liveSceneName, liveSceneId, addTime, pauseTimer, resumeTimer, resetTimer, syncToOBS } = useLiveStore();
  const { scenes, editingSceneId } = useEditorStore();
  const [customReset, setCustomReset] = useState(10);

  const editingScene = scenes.find(s => s.id === editingSceneId);
  const liveScene = scenes.find(s => s.id === liveSceneId);

  // Start timer engine on mount
  useEffect(() => {
    startLiveTimerEngine();
  }, []);

  const handleGoLive = async () => {
    if (!editingScene) return;
    await syncToOBS(editingScene.id, editingScene.name);
  };

  const isEditingLive = editingSceneId === liveSceneId;

  return (
    <div className="live-panel">
      {/* Header */}
      <div className="panel-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, height: 'auto', padding: '12px 12px' }}>
        <div className="live-badge">Live</div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Live Control</span>
      </div>

      <div className="panel-body" style={{ padding: '8px 12px' }}>
        {/* Live scene */}
        <div className="live-scene-card">
          <div className="live-scene-label">🔴 On Air</div>
          <div className="live-scene-name">{liveScene?.label ?? liveSceneName}</div>
        </div>

        {/* Editing scene */}
        {!isEditingLive && editingScene && (
          <div className="live-scene-card" style={{ borderColor: 'var(--color-accent)', marginBottom: 12 }}>
            <div className="live-scene-label" style={{ color: 'var(--color-accent)' }}>✏️ Editing</div>
            <div className="live-scene-name">{editingScene.label}</div>
          </div>
        )}

        {/* Go Live Button */}
        <button className="go-live-btn" onClick={handleGoLive} style={{ marginBottom: 16 }}>
          <Radio size={14} />
          {isEditingLive ? 'Scene is Live' : 'Switch to this Scene'}
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0 12px' }} />

        {/* ─── Timer ──────────────────────────── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Countdown Timer
          </div>

          {/* Big time display */}
          <div className="timer-display" style={{ marginBottom: 8 }}>
            {formatTime(timer.seconds)}
          </div>

          {/* Status badge */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 4,
              background: timer.isPaused ? 'rgba(251,191,36,0.15)' : timer.isRunning ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
              color: timer.isPaused ? '#fbbf24' : timer.isRunning ? 'var(--color-success)' : 'var(--color-text-muted)',
            }}>
              {timer.isPaused ? '⏸ PAUSED' : timer.isRunning ? '▶ RUNNING' : '⏹ STOPPED'}
            </span>
          </div>

          {/* ── Add time row ── */}
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={9} /> Add Time
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {[1, 5, 10, 30].map(m => (
              <button key={m} className="btn btn-secondary" style={{ flex: 1, fontSize: 10, padding: '4px 0' }}
                onClick={() => addTime(m * 60)}>
                +{m}m
              </button>
            ))}
          </div>

          {/* ── Subtract time row ── */}
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Minus size={9} /> Remove Time
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {[1, 5, 10, 30].map(m => (
              <button key={m} className="btn btn-secondary" style={{ flex: 1, fontSize: 10, padding: '4px 0' }}
                onClick={() => addTime(-m * 60)}>
                -{m}m
              </button>
            ))}
          </div>

          {/* ── Pause / Resume / Reset row ── */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {timer.isRunning && !timer.isPaused ? (
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={pauseTimer}>
                <Pause size={12} /> Pause
              </button>
            ) : (
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={resumeTimer}>
                <Play size={12} /> Resume
              </button>
            )}
            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '5px 8px' }}
              onClick={() => resetTimer(customReset * 60)} data-tooltip={`Reset to ${customReset} min`}>
              <RotateCcw size={12} />
            </button>
          </div>

          {/* ── Custom reset value ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 600, flexShrink: 0 }}>Reset to:</span>
            <input
              type="number"
              min={1} max={180}
              value={customReset}
              onChange={e => setCustomReset(Math.max(1, parseInt(e.target.value) || 10))}
              className="input input-mono"
              style={{ flex: 1, fontSize: 10, padding: '3px 6px', textAlign: 'center' }}
            />
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', flexShrink: 0 }}>min</span>
            <button className="btn btn-primary" style={{ fontSize: 9, padding: '3px 8px', flexShrink: 0 }}
              onClick={() => resetTimer(customReset * 60)}>
              Set
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0 8px' }} />

        {/* Quick Scene Switcher */}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
          Quick Switch
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {scenes.slice(0, 5).map(scene => {
            const isLive = scene.id === liveSceneId;
            return (
              <button
                key={scene.id}
                className="btn btn-secondary"
                style={{
                  fontSize: 11, justifyContent: 'flex-start', padding: '6px 8px',
                  borderColor: isLive ? '#ef4444' : 'var(--color-border)',
                  color: isLive ? '#ef4444' : 'var(--color-text-3)',
                }}
                onClick={() => syncToOBS(scene.id, scene.name)}
              >
                {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scene.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
