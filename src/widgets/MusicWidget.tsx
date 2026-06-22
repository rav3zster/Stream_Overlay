import React from 'react';
import { useOverlayStore } from '../store/overlayStore';

interface MusicWidgetProps {
  compact?: boolean;
}

const EQ_BARS = [
  { height: '30%', delay: '0s', duration: '0.7s' },
  { height: '80%', delay: '0.1s', duration: '1.0s' },
  { height: '50%', delay: '0.05s', duration: '0.8s' },
  { height: '95%', delay: '0.15s', duration: '1.1s' },
  { height: '40%', delay: '0.2s', duration: '0.9s' },
];

export const MusicWidget: React.FC<MusicWidgetProps> = ({ compact = false }) => {
  const music = useOverlayStore(s => s.music);

  const pct = Math.min((music.progress / music.duration) * 100, 100);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (compact) {
    return (
      <div className="flex items-center gap-[0.6vw] h-full px-[0.8vw]">
        {/* Spinning disc */}
        <div className="relative w-[2.2vw] h-[2.2vw] rounded-full border-2 border-[var(--panel-border)] overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/40">
          <img
            src={music.albumArt}
            alt="album"
            className="w-[85%] h-[85%] rounded-full"
            style={{ animation: music.isPlaying ? 'spin 8s linear infinite' : 'none' }}
          />
          <div className="absolute w-[0.7vw] h-[0.7vw] bg-[var(--bg-color,#07050f)] border border-[var(--panel-border)] rounded-full" />
        </div>
        {/* Info */}
        <div className="flex-grow overflow-hidden min-w-0">
          <span className="block text-[0.55vw] text-[var(--text-secondary)] font-bold tracking-wider uppercase">
            ♪ NOW PLAYING
          </span>
          <span className="block text-[0.8vw] text-[var(--text-primary)] font-bold truncate leading-snug">
            {music.title}
          </span>
          <span className="block text-[0.65vw] text-[var(--accent-secondary)] truncate">
            {music.artist}
          </span>
        </div>
        {/* EQ Bars */}
        <div className="flex items-end gap-[2px] h-[1.8vw] px-[0.3vw] flex-shrink-0">
          {EQ_BARS.map((bar, i) => (
            <span
              key={i}
              className="w-[3px] rounded-sm bg-[var(--accent-primary)]"
              style={{
                height: bar.height,
                animation: music.isPlaying
                  ? `equalizerPulse ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
                  : 'none',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full p-[1vw] gap-[0.6vw]">
      <div className="flex items-center gap-[1vw]">
        {/* Album art */}
        <div className="relative w-[4.5vw] h-[4.5vw] rounded-full border-2 border-[var(--panel-border)] overflow-hidden flex-shrink-0 bg-black/50">
          <img
            src={music.albumArt}
            alt="album"
            className="w-full h-full object-cover rounded-full"
            style={{ animation: music.isPlaying ? 'spin 8s linear infinite' : 'none' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[1.2vw] h-[1.2vw] rounded-full bg-[var(--bg-color,#07050f)] border border-[var(--panel-border)]" />
          </div>
        </div>
        {/* Text info */}
        <div className="flex-grow overflow-hidden min-w-0">
          <span className="block text-[0.65vw] text-[var(--text-secondary)] font-bold tracking-widest uppercase mb-[0.2vw]">
            ♪ NOW PLAYING
          </span>
          <span
            className="block text-[1.1vw] font-black text-[var(--text-primary)] truncate leading-tight"
            style={{ textShadow: 'var(--glow-text)' }}
          >
            {music.title}
          </span>
          <span className="block text-[0.8vw] text-[var(--accent-secondary)] truncate">
            {music.artist}
          </span>
        </div>
        {/* EQ Bars */}
        <div className="flex items-end gap-[3px] h-[2.5vw] flex-shrink-0">
          {EQ_BARS.map((bar, i) => (
            <span
              key={i}
              className={`w-[4px] rounded-sm ${i % 2 === 0 ? 'bg-[var(--accent-primary)]' : 'bg-[var(--accent-secondary)]'}`}
              style={{
                height: bar.height,
                animation: music.isPlaying
                  ? `equalizerPulse ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
                  : 'none',
              }}
            />
          ))}
        </div>
      </div>
      {/* Progress bar */}
      <div className="flex items-center gap-[0.5vw] text-[0.55vw] text-[var(--text-secondary)]">
        <span className="flex-shrink-0 font-mono">{fmt(music.progress)}</span>
        <div className="flex-grow h-[3px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="flex-shrink-0 font-mono">{fmt(music.duration)}</span>
      </div>
    </div>
  );
};
