import React from 'react';
import { useOverlayStore } from '../store/overlayStore';

interface TimerWidgetProps {
  label?: string;
  size?: 'compact' | 'full';
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ label, size = 'full' }) => {
  // Subscribe to primitives individually — avoids "getSnapshot should be cached" loop
  const seconds = useOverlayStore(s => s.timer.seconds);
  const isPaused = useOverlayStore(s => s.timer.isPaused);
  const currentScene = useOverlayStore(s => s.currentScene);

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  const display = `${mins}:${secs}`;

  const sceneLabel = label ?? (
    currentScene === 'starting-soon' ? 'STREAM STARTING SOON' :
    currentScene === 'brb' ? 'BE RIGHT BACK' : 'TIMER'
  );

  if (size === 'compact') {
    return (
      <div className="flex items-center gap-2 h-full px-3">
        <span
          className="text-[1vw] font-display font-bold tracking-widest uppercase truncate"
          style={{ color: 'var(--accent-secondary)' }}
        >
          {sceneLabel}
        </span>
        <span
          className="text-[2.5vw] font-black font-display leading-none tabular-nums"
          style={{ color: 'var(--text-primary)', textShadow: 'var(--glow-text)' }}
        >
          {display}
        </span>
        {isPaused && (
          <span className="text-[0.6vw] text-amber-400 font-bold uppercase" style={{ animation: 'pulse 1s infinite' }}>
            PAUSED
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-full text-center p-4">
      <span
        className="uppercase tracking-widest font-display font-bold mb-3"
        style={{ fontSize: '1.2vw', color: 'var(--accent-secondary)', textShadow: 'var(--glow-text)' }}
      >
        {sceneLabel}
      </span>
      <span
        className="font-black font-display leading-none tabular-nums"
        style={{
          fontSize: '5vw',
          letterSpacing: '4px',
          color: 'var(--text-primary)',
          textShadow: 'var(--glow-text)',
        }}
      >
        {display}
      </span>
      {isPaused && (
        <span
          className="mt-2 font-bold uppercase tracking-widest text-amber-400"
          style={{ fontSize: '0.7vw', animation: 'pulse 1s infinite' }}
        >
          ⏸ PAUSED
        </span>
      )}
      {seconds === 0 && (
        <span
          className="mt-2 font-bold uppercase tracking-widest"
          style={{
            fontSize: '0.8vw',
            color: 'var(--accent-primary)',
            animation: 'pulse 1s infinite',
          }}
        >
          🎉 STARTING NOW!
        </span>
      )}
    </div>
  );
};
