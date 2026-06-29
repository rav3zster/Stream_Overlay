import React, { useEffect } from 'react';
import { Radio, Play, Pause, RotateCcw, Plus, ChevronRight, Zap } from 'lucide-react';
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

        {/* Timer */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Stream Timer
          </div>
          <div className="timer-display">{formatTime(timer.seconds)}</div>

          {/* Timer add buttons */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[1, 5, 10].map(m => (
              <button key={m} className="btn btn-secondary" style={{ flex: 1, fontSize: 11, padding: '5px 0' }}
                onClick={() => addTime(m * 60)}>
                +{m}m
              </button>
            ))}
          </div>

          {/* Pause / Resume / Reset */}
          <div style={{ display: 'flex', gap: 4 }}>
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
              onClick={() => resetTimer(600)} data-tooltip="Reset to 10 min">
              <RotateCcw size={12} />
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
