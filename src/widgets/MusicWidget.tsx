import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { getThemeProfile } from '../lib/themes';

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
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);

  const pct = Math.min((music.progress / music.duration) * 100, 100);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ──────────────────────────────────────────────────────────────
  // 1. PASTEL PLANETS THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'planets') {
    return (
      <div className="flex items-center gap-[1vw] h-full px-[1.2vw] text-white leading-none relative overflow-hidden">
        {/* Rotating planet record disk */}
        <div className="w-[3.5vw] h-[3.5vw] rounded-full border-2 border-[#FFC6FF] bg-[#4c3a75] overflow-hidden flex-shrink-0 flex items-center justify-center relative">
          <img
            src={music.albumArt}
            alt="record"
            className="w-[85%] h-[85%] rounded-full object-cover"
            style={{ animation: music.isPlaying ? 'spin 12s linear infinite' : 'none' }}
          />
          <div className="absolute w-[0.8vw] h-[0.8vw] bg-[#BDB2FF] rounded-full border border-white" />
        </div>
        
        <div className="flex-grow overflow-hidden min-w-0 flex flex-col justify-center">
          <span className="text-[0.55vw] text-[#FFD6A5] font-black tracking-widest uppercase mb-1 font-display">SPACE RADIO</span>
          <span className="text-[0.95vw] text-white font-black font-display truncate leading-tight">{music.title}</span>
          <span className="text-[0.7vw] text-[#FFC6FF] truncate font-display mt-0.5">{music.artist}</span>
        </div>
        
        {/* Sparkle decorative element */}
        <div className="text-[#FFD6A5] text-[1vw] animate-pulse pr-1 select-none pointer-events-none">✦</div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. CYBER HUD THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cyberhud') {
    return (
      <div className="flex flex-col justify-between h-full w-full p-[0.8vw] gap-[0.4vw] font-mono text-[#00F0FF] leading-none select-none relative bg-[#0b1016]/40">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />
        
        <div className="flex justify-between items-center text-[0.45vw] font-bold tracking-widest border-b border-[#00F0FF]/25 pb-1 flex-shrink-0">
          <span>[AUDIO_UPLINK_DECODE]</span>
          <span className="text-emerald-400 animate-pulse">LOCK_ON</span>
        </div>

        <div className="flex items-center gap-[0.8vw] flex-grow my-0.5 overflow-hidden">
          <div className="w-[3vw] h-[3vw] border border-[#00F0FF]/35 flex-shrink-0 flex items-center justify-center bg-black/50">
            <img src={music.albumArt} alt="art" className="w-[85%] h-[85%] object-cover opacity-85" />
          </div>
          <div className="flex-grow overflow-hidden min-w-0 flex flex-col justify-center">
            <span className="text-[0.8vw] font-bold truncate text-[#00F0FF] tracking-tight">{music.title.toUpperCase()}</span>
            <span className="text-[0.6vw] text-[#00F0FF]/60 truncate mt-0.5">{music.artist.toUpperCase()}</span>
          </div>
          
          {/* Vertical Decibel Radar Bars */}
          <div className="flex items-end gap-[2px] h-[1.8vw] pr-1 flex-shrink-0">
            {EQ_BARS.map((bar, i) => (
              <span
                key={i}
                className="w-[2px] bg-[#00F0FF]"
                style={{
                  height: bar.height,
                  animation: music.isPlaying
                    ? `equalizerPulse ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
                    : '2px',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-[0.4vw] text-[0.5vw] text-[#00F0FF]/40 border-t border-[#00F0FF]/10 pt-1 flex-shrink-0">
          <span>{fmt(music.progress)}</span>
          <div className="flex-grow h-[2.5px] bg-[#00F0FF]/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00F0FF] shadow-[0_0_4px_rgba(0,240,255,0.6)] transition-all duration-1000" 
              style={{ width: `${pct}%` }} 
            />
          </div>
          <span>{fmt(music.duration)}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. ESPORTS TELEMETRY THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'esports') {
    return (
      <div className="flex items-center gap-[1vw] h-full px-[1.2vw] py-[0.5vw] text-white leading-none relative bg-gradient-to-r from-[#050c20] to-[#010512]">
        <div className="w-[3.2vw] h-[3.2vw] skew-x-[-6deg] overflow-hidden flex-shrink-0 border border-[#2979FF] bg-black/60">
          <img
            src={music.albumArt}
            alt="art"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        
        <div className="flex-grow overflow-hidden min-w-0 flex flex-col justify-center">
          <span className="text-[0.5vw] text-[#2979FF] font-black uppercase tracking-[0.2em] mb-1">ARENA NOW PLAYING</span>
          <span className="text-[0.9vw] text-white font-black truncate leading-tight skew-x-[-4deg]">{music.title}</span>
          <span className="text-[0.7vw] text-slate-300 truncate mt-0.5">{music.artist}</span>
        </div>

        {/* Slanted decibel indicator */}
        <div className="flex items-end gap-[2px] h-[1.8vw] pl-2 border-l border-[#2979FF]/30 flex-shrink-0">
          {EQ_BARS.map((bar, i) => (
            <span
              key={i}
              className="w-[2.5px] bg-[#2979FF] skew-x-[-6deg] rounded-sm"
              style={{
                height: bar.height,
                animation: music.isPlaying
                  ? `equalizerPulse ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
                  : '3px',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. RETRO CRT CASSETTE COMMAND LOG
  // ──────────────────────────────────────────────────────────────
  if (profile === 'retro') {
    return (
      <div className="flex flex-col justify-center h-full p-2 font-mono text-[#33ff33] leading-snug">
        <span className="text-[0.6vw] text-[#228822] uppercase tracking-widest font-bold">
          [AUDIO_RECORDER] ON_AIR
        </span>
        <div className="text-[0.85vw] font-bold truncate mt-1">
          TRACK: {music.title}
        </div>
        <div className="text-[0.7vw] truncate text-[#11aa11] mb-1">
          ARTIST: {music.artist}
        </div>
        <div className="flex items-center gap-1.5 text-[0.6vw] mt-1">
          <span>{fmt(music.progress)}</span>
          <span className="text-[#228822]">
            [{Array.from({ length: 15 }).map((_, idx) => (idx / 15 * 100 < pct ? '■' : '-')).join('')}]
          </span>
          <span>{fmt(music.duration)}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. MOTORSPORT RACING INTERFACE (McLaren, Ferrari, Red Bull, AMG)
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    return (
      <div className="flex flex-col justify-between h-full w-full p-[0.8vw] gap-[0.4vw] font-mono text-white leading-none select-none">
        {/* Header */}
        <div className="flex justify-between items-center text-[0.45vw] font-extrabold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1 flex-shrink-0">
          <span>NOW PLAYING</span>
          <span className="text-[var(--accent-primary)] animate-pulse">LIVE_FEED</span>
        </div>

        {/* Content row */}
        <div className="flex items-center gap-[0.8vw] flex-grow my-0.5 overflow-hidden">
          <div className="w-[3.2vw] h-[3.2vw] border border-white/10 flex-shrink-0 flex items-center justify-center relative bg-black/85">
            <img src={music.albumArt} alt="cover" className="w-[90%] h-[90%] object-cover" />
            <div className="absolute inset-0 border-[1.5px] border-[var(--accent-primary)] opacity-40 animate-pulse pointer-events-none" />
          </div>
          <div className="flex-grow overflow-hidden min-w-0 flex flex-col justify-center">
            <span className="text-[0.85vw] font-black text-white truncate uppercase tracking-tight">{music.title}</span>
            <span className="text-[0.6vw] text-[var(--accent-primary)] truncate font-semibold mt-0.5">{music.artist}</span>
          </div>
        </div>

        {/* Progress & Waveform */}
        <div className="flex flex-col gap-[0.4vw] flex-shrink-0">
          <div className="flex items-center gap-[0.4vw] text-[0.5vw] text-slate-400">
            <span className="font-mono">{fmt(music.progress)}</span>
            <div className="flex-grow h-[2px] bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-1000" 
                style={{ width: `${pct}%` }} 
              />
            </div>
            <span className="font-mono">{fmt(music.duration)}</span>
          </div>
          {/* Small EQ Wave at the bottom */}
          <div className="flex items-end justify-center gap-[2px] h-[1.2vw] pt-0.5">
            {EQ_BARS.map((bar, i) => (
              <span
                key={i}
                className="w-[2.5px] bg-[var(--accent-primary)] rounded-t-sm"
                style={{
                  height: bar.height,
                  animation: music.isPlaying
                    ? `equalizerPulse ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
                    : '3px',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. PORSCHE GULF CLASSIC CAR STEREO
  // ──────────────────────────────────────────────────────────────
  if (profile === 'gulf') {
    return (
      <div className="flex items-center gap-[1vw] h-full px-[1.2vw] text-[#121e2c] leading-none">
        <div className="w-[3.2vw] h-[3.2vw] rounded-full border border-[#709cb8] bg-[#709cb8]/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
          <img
            src={music.albumArt}
            alt="vinyl"
            className="w-[80%] h-[80%] rounded-full"
            style={{ animation: music.isPlaying ? 'spin 12s linear infinite' : 'none' }}
          />
          <div className="absolute w-2 h-2 bg-[#ff5800] rounded-full" />
        </div>
        <div className="flex-grow overflow-hidden min-w-0 flex flex-col justify-center">
          <span className="text-[0.55vw] text-[#ff5800] font-black tracking-widest uppercase mb-0.5">RADIO PLAYER</span>
          <span className="text-[0.9vw] text-[#121e2c] font-black font-serif truncate leading-tight">{music.title}</span>
          <span className="text-[0.7vw] text-[#709cb8] truncate tracking-wide mt-0.5">{music.artist}</span>
        </div>
        <div className="flex items-center text-[0.6vw] text-[#709cb8] gap-1 font-semibold">
          <span>{fmt(music.progress)}</span>
          <span className="text-[#ff5800]">•</span>
          <span>{fmt(music.duration)}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. COZY LO-FI CASSETTE TAPE PLAYBACK
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cozy') {
    return (
      <div className="flex flex-col justify-center h-full p-[0.8vw] gap-[0.4vw] text-amber-100 font-display">
        {/* Cassette Tape Chassis */}
        <div className="relative w-full h-[3.8vw] rounded-xl border-2 border-amber-900/60 bg-[#160f21] p-1.5 flex items-center gap-3 overflow-hidden shadow-inner flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/15 to-transparent pointer-events-none" />
          
          {/* Label background */}
          <div className="flex-grow h-full bg-[#fcf8f0] border border-amber-950/30 rounded px-2.5 py-1 text-slate-800 flex flex-col justify-center min-w-0 select-none">
            <span className="text-[0.5vw] text-slate-400 font-bold uppercase tracking-wider">A-SIDE stereo</span>
            <span className="text-[0.8vw] font-black text-slate-800 truncate font-display leading-tight">{music.title}</span>
            <span className="text-[0.6vw] text-amber-800 truncate font-display leading-none mt-0.5">{music.artist}</span>
          </div>

          {/* Cassette Gear Spindles */}
          <div className="flex items-center gap-2 pr-1.5 flex-shrink-0">
            <div className="w-[1.6vw] h-[1.6vw] rounded-full border border-amber-950/40 bg-amber-900/10 flex items-center justify-center">
              <div 
                className="w-2.5 h-2.5 border-2 border-dashed border-amber-800 rounded-full" 
                style={{ animation: music.isPlaying ? 'spin 4s linear infinite' : 'none' }}
              />
            </div>
            <div className="w-[1.6vw] h-[1.6vw] rounded-full border border-amber-950/40 bg-amber-900/10 flex items-center justify-center">
              <div 
                className="w-2.5 h-2.5 border-2 border-dashed border-amber-800 rounded-full" 
                style={{ animation: music.isPlaying ? 'spin 4s linear infinite' : 'none' }}
              />
            </div>
          </div>
        </div>
        
        {/* Cassette progress indicator */}
        <div className="flex items-center gap-2 text-[0.55vw] text-amber-200/70 font-semibold px-1">
          <span>{fmt(music.progress)}</span>
          <div className="flex-grow h-[3px] bg-amber-950/50 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
          <span>{fmt(music.duration)}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 5. MINIMALIST APPLE PLAYER DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'minimal') {
    return (
      <div className="flex items-center gap-[0.8vw] h-full px-[1vw] py-[0.4vw] leading-none text-left">
        <img src={music.albumArt} alt="cover" className="w-[3.2vw] h-[3.2vw] rounded-lg object-cover flex-shrink-0 border border-slate-200/5 shadow-sm" />
        <div className="flex-grow overflow-hidden min-w-0 flex flex-col justify-center">
          <span className="text-[0.8vw] font-bold text-[var(--text-primary)] truncate leading-snug">{music.title}</span>
          <span className="text-[0.65vw] text-[var(--text-secondary)] truncate mt-1">{music.artist}</span>
        </div>
        <div className="text-[0.6vw] font-mono text-[var(--text-secondary)] flex-shrink-0 bg-slate-500/5 px-2 py-1 rounded-full">
          {fmt(music.progress)} / {fmt(music.duration)}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 6. GLASSMORPHIC SHINY ROTATOR
  // ──────────────────────────────────────────────────────────────
  if (profile === 'glass') {
    return (
      <div className="flex items-center gap-[1vw] h-full px-[1vw] leading-none">
        <div className="relative w-[3vw] h-[3vw] rounded-full border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white/5">
          <img
            src={music.albumArt}
            alt="disc"
            className="w-[85%] h-[85%] rounded-full object-cover"
            style={{ animation: music.isPlaying ? 'spin 10s linear infinite' : 'none' }}
          />
        </div>
        <div className="flex-grow overflow-hidden min-w-0">
          <span className="block text-[0.8vw] font-bold text-white truncate">{music.title}</span>
          <span className="block text-[0.65vw] text-slate-300 truncate mt-0.5">{music.artist}</span>
        </div>
        <div className="flex items-end gap-0.5 h-[1.5vw] flex-shrink-0">
          {EQ_BARS.map((bar, i) => (
            <span
              key={i}
              className="w-[2.5px] bg-pink-400 rounded-sm"
              style={{
                height: bar.height,
                animation: music.isPlaying
                  ? `equalizerPulse ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
                  : '3px',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 7. LUXURY ELEGANT GOLDEN DIAL
  // ──────────────────────────────────────────────────────────────
  if (profile === 'luxury') {
    return (
      <div className="flex flex-col justify-center h-full p-[0.8vw] gap-[0.4vw] text-white font-serif leading-none">
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-1.5 mb-0.5">
          <div className="overflow-hidden min-w-0 text-left">
            <span className="text-[0.85vw] text-white tracking-widest font-serif block truncate">{music.title.toUpperCase()}</span>
            <span className="text-[0.6vw] text-[#d4af37] tracking-wider block truncate mt-1">{music.artist.toUpperCase()}</span>
          </div>
          <span className="text-[0.55vw] text-[#d4af37] tracking-widest font-bold font-serif">ON AIR</span>
        </div>
        <div className="flex items-center gap-[0.5vw] text-[0.5vw] text-slate-400">
          <span className="font-mono">{fmt(music.progress)}</span>
          <div className="flex-grow h-[1px] bg-white/10">
            <div className="h-full bg-[#d4af37] transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-mono">{fmt(music.duration)}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 8. STANDARD CYBERPUNK / FALLBACK ROTATOR
  // ──────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-[0.6vw] h-full px-[0.8vw]">
        <div className="relative w-[2.2vw] h-[2.2vw] rounded-full border border-[var(--panel-border)] overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/40">
          <img
            src={music.albumArt}
            alt="album"
            className="w-[85%] h-[85%] rounded-full"
            style={{ animation: music.isPlaying ? 'spin 8s linear infinite' : 'none' }}
          />
          <div className="absolute w-[0.7vw] h-[0.7vw] bg-[var(--bg-color,#07050f)] border border-[var(--panel-border)] rounded-full" />
        </div>
        <div className="flex-grow overflow-hidden min-w-0">
          <span className="block text-[0.55vw] text-[var(--text-secondary)] font-bold tracking-wider uppercase">♪ NOW PLAYING</span>
          <span className="block text-[0.8vw] text-[var(--text-primary)] font-bold truncate leading-snug">{music.title}</span>
          <span className="block text-[0.65vw] text-[var(--accent-secondary)] truncate">{music.artist}</span>
        </div>
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
        <div className="relative w-[4.5vw] h-[4.5vw] rounded-full border border-[var(--panel-border)] overflow-hidden flex-shrink-0 bg-black/50">
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
        <div className="flex-grow overflow-hidden min-w-0 text-left">
          <span className="block text-[0.65vw] text-[var(--text-secondary)] font-bold tracking-widest uppercase mb-[0.2vw]">♪ NOW PLAYING</span>
          <span className="block text-[1.1vw] font-black text-[var(--text-primary)] truncate leading-tight" style={{ textShadow: 'var(--glow-text)' }}>
            {music.title}
          </span>
          <span className="block text-[0.8vw] text-[var(--accent-secondary)] truncate">{music.artist}</span>
        </div>
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
