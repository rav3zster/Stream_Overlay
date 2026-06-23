import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { getThemeProfile } from '../lib/themes';

interface TimerWidgetProps {
  label?: string;
  size?: 'compact' | 'full';
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ label, size = 'full' }) => {
  const seconds = useOverlayStore(s => s.timer.seconds);
  const isPaused = useOverlayStore(s => s.timer.isPaused);
  const currentScene = useOverlayStore(s => s.currentScene);
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  const display = `${mins}:${secs}`;

  const sceneLabel = label ?? (
    currentScene === 'starting-soon' ? 'STREAM STARTING SOON' :
    currentScene === 'brb' ? 'BE RIGHT BACK' : 'TIMER'
  );

  // ──────────────────────────────────────────────────────────────
  // 1. PASTEL PLANETS THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'planets') {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-3 text-[#FFC6FF] leading-none relative overflow-hidden">
        {/* Rotating Saturn planet background illustration */}
        <div className="absolute top-2 right-2 w-[2.2vw] h-[2.2vw] opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full animate-[spin_20s_linear_infinite]">
            <circle cx="50" cy="50" r="22" fill="#FFD6A5" />
            <ellipse cx="50" cy="50" rx="38" ry="8" fill="none" stroke="#FFC6FF" strokeWidth="4" transform="rotate(-15 50 50)" />
          </svg>
        </div>
        <span className="text-[0.65vw] tracking-wider text-[#FFD6A5] font-black uppercase mb-1.5 flex items-center gap-1 font-display">
          🪐 {sceneLabel} 🪐
        </span>
        <div className="text-[3.2vw] font-black tracking-widest font-display text-white tabular-nums flex items-center justify-center gap-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
          <span>{mins}</span>
          <span className="animate-pulse text-[#E8AEFF]">:</span>
          <span>{secs}</span>
        </div>
        {isPaused && (
          <span className="text-[0.55vw] font-black text-[#CAFFBF] uppercase tracking-widest mt-1.5 animate-bounce">
            • orbit locked •
          </span>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. CYBER HUD THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cyberhud') {
    return (
      <div className="flex flex-col justify-center items-center h-full font-mono text-[#00F0FF] p-3 leading-none relative overflow-hidden bg-[#0a111a]/40">
        {/* Technical grid scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />
        
        <div className="w-full flex justify-between items-center text-[0.55vw] text-[#00F0FF]/60 font-mono tracking-widest uppercase border-b border-[#00F0FF]/20 pb-1 mb-1.5">
          <span>[CLK_SRC: SYS_DEC]</span>
          <span className="animate-pulse text-emerald-400">● SECURE</span>
        </div>
        
        <div className="text-[3.8vw] font-black tracking-[0.15em] tabular-nums text-[#00F0FF] filter drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
          {mins}<span className="text-[#00F0FF]/40">:</span>{secs}
        </div>
        
        <div className="w-full flex justify-between items-center text-[0.5vw] text-[#00F0FF]/40 font-mono uppercase mt-1">
          <span>STATUS: {isPaused ? 'LOCKED_PAUSED' : 'COUNTDOWN_RUNNING'}</span>
          <span>T-{seconds}S</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. ESPORTS TELEMETRY THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'esports') {
    return (
      <div className="flex items-center justify-between h-full w-full px-[1.5vw] py-[0.8vw] font-sans select-none leading-none bg-gradient-to-r from-[#03091e] to-[#0a1b40]">
        <div className="flex flex-col text-left justify-center">
          <span className="text-[0.5vw] text-[#2979FF] font-black uppercase tracking-[0.2em] mb-1">MATCH TIMER</span>
          <span className="text-[2.6vw] font-black text-white tracking-tighter tabular-nums skew-x-[-6deg]">
            {mins}:{secs}
          </span>
        </div>
        <div className="flex flex-col items-end justify-center border-l-2 border-[#2979FF]/40 pl-[1vw]">
          <span className="text-[0.5vw] text-slate-400 font-extrabold uppercase tracking-widest mb-1">EVENT STATUS</span>
          <span className="text-[1vw] font-black text-white uppercase bg-[#2979FF] px-2 py-0.5 rounded-sm skew-x-[-6deg]">
            {isPaused ? 'PAUSED' : 'LIVE'}
          </span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. RETRO CRT THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'retro') {
    return (
      <div className="flex flex-col justify-center items-center h-full font-mono text-[#33ff33] p-2 leading-none text-center">
        <div className="text-[0.7vw] mb-1.5 uppercase tracking-widest text-[#228822]">
          --- {sceneLabel} ---
        </div>
        <div className="text-[4.2vw] font-bold tabular-nums">
          [{mins}:{secs}]
        </div>
        {isPaused && (
          <div className="text-[0.6vw] text-amber-500 font-extrabold tracking-widest mt-1 blink">
            * SYSTEM_PAUSED *
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. MOTORSPORT RACING THEME DESIGN (McLaren / Ferrari / Red Bull)
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    if (size === 'full') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full font-mono text-center select-none leading-none relative py-1">
          {/* F1 telemetry HUD horizontal rule and speed ticks */}
          <div className="absolute inset-x-8 top-[10%] h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent pointer-events-none" />
          <span className="text-[0.6vw] text-[var(--accent-primary)] font-black uppercase tracking-[0.3em] mb-1.5 z-10">
            {sceneLabel}
          </span>
          <span 
            className="text-[4.2vw] font-black text-white tracking-widest tabular-nums z-10 filter drop-shadow-[0_0_12px_var(--accent-primary-shadow)]"
            style={{ 
              fontFamily: 'var(--font-display)',
            }}
          >
            {mins}:{secs}
          </span>
          <div className="absolute inset-x-8 bottom-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between h-full w-full px-[1.2vw] py-[0.5vw] font-mono select-none leading-none">
        <div className="flex flex-col text-left justify-center">
          <span className="text-[0.5vw] text-slate-500 font-black uppercase tracking-wider">TELEMETRY TIME</span>
          <span className="text-[1.8vw] font-bold text-white tracking-tight tabular-nums">
            {mins}<span className="text-[1.1vw] text-slate-400">m</span> {secs}<span className="text-[1.1vw] text-slate-400">s</span>
          </span>
          <span className="text-[0.45vw] text-[var(--accent-primary)] font-extrabold uppercase tracking-widest mt-0.5">{sceneLabel}</span>
        </div>
        <div className="flex flex-col items-end justify-center border-l border-white/10 pl-[0.8vw]">
          <span className="text-[0.5vw] text-slate-500 font-black uppercase tracking-wider">GEAR</span>
          <span className="text-[1.8vw] font-black text-[var(--accent-primary)] glow-text-theme">
            {isPaused ? 'N' : Math.max(1, Math.min(8, Math.floor(seconds / 75) + 1))}
          </span>
          <span className="text-[0.45vw] text-slate-400 font-bold tracking-wider mt-0.5">ACTIVE</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. PORSCHE GULF VINTAGE THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'gulf') {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center text-[#121e2c] p-2 leading-none">
        <div className="w-[3.5vw] h-[3.5vw] rounded-full border-2 border-[#ff5800] bg-white flex items-center justify-center shadow-md mb-1 relative overflow-hidden flex-shrink-0">
          {/* Vintage Chronograph clock dial indicator */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:4px_4px] opacity-25" />
          <div className="w-[1.5px] h-[1.3vw] bg-[#ff5800] rounded-full origin-bottom" style={{ transform: `rotate(${(seconds * 6) % 360}deg)` }} />
          <div className="absolute w-1.5 h-1.5 bg-[#709cb8] rounded-full" />
        </div>
        <span className="text-[0.6vw] font-bold text-[#709cb8] uppercase tracking-widest mb-1 font-display">
          {sceneLabel}
        </span>
        <span className="text-[2.2vw] font-black tracking-tight text-[#121e2c] tabular-nums font-serif">
          {mins}:{secs}
        </span>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. COZY CAFE / BEDROOM THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cozy') {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-3 text-amber-100 font-display">
        <span className="text-[0.65vw] tracking-wider text-amber-300/80 font-bold uppercase mb-1">
          ☕ {sceneLabel}
        </span>
        <div className="text-[2.8vw] font-black tracking-widest font-display text-white tabular-nums flex items-center gap-1">
          <span>{mins}</span>
          <span className="animate-pulse text-amber-400">:</span>
          <span>{secs}</span>
        </div>
        {isPaused && (
          <span className="text-[0.55vw] font-bold text-amber-500 uppercase tracking-widest mt-1">
            (break paused)
          </span>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 5. MINIMALIST APPLE STYLE DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'minimal') {
    return (
      <div className="flex flex-col justify-center h-full px-[1vw] leading-none text-left">
        <span className="text-[0.5vw] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">
          {sceneLabel}
        </span>
        <div className="text-[2.8vw] font-extrabold tracking-tighter text-[var(--text-primary)] tabular-nums">
          {display}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 6. GLASSMORPHIC SHINY DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'glass') {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-2 leading-none">
        <span className="text-[0.55vw] font-bold uppercase tracking-widest text-pink-300 mb-1.5 font-display">
          ✨ {sceneLabel}
        </span>
        <div className="text-[3.2vw] font-black text-white glow-text-theme tabular-nums font-display">
          {display}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 7. LUXURY ELEGANT GOLD DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'luxury') {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-3 leading-none font-serif">
        <span className="text-[0.55vw] uppercase tracking-widest text-[#d4af37] font-semibold mb-2">
          {sceneLabel}
        </span>
        <div className="text-[3vw] text-white tracking-widest font-serif tabular-nums border-b border-[#d4af37]/35 pb-1 mb-1">
          {mins}:{secs}
        </div>
        <span className="text-[0.45vw] text-slate-400 uppercase tracking-widest">CHRONOMETRE DE LUXE</span>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 8. STANDARD CYBERPUNK / FALLBACK DESIGN
  // ──────────────────────────────────────────────────────────────
  if (size === 'compact') {
    return (
      <div className="flex items-center justify-between h-full px-[1vw]">
        <span
          className="text-[0.8vw] font-display font-black tracking-widest uppercase truncate text-[var(--accent-secondary)]"
        >
          {sceneLabel}
        </span>
        <span
          className="text-[2vw] font-black font-display leading-none tabular-nums text-[var(--text-primary)]"
          style={{ textShadow: 'var(--glow-text)' }}
        >
          {display}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-full text-center p-4">
      <span
        className="uppercase tracking-widest font-display font-bold mb-2 text-[1vw] text-[var(--accent-secondary)]"
        style={{ textShadow: 'var(--glow-text)' }}
      >
        {sceneLabel}
      </span>
      <span
        className="font-black font-display leading-none tabular-nums text-[4vw]"
        style={{
          letterSpacing: '3px',
          color: 'var(--text-primary)',
          textShadow: 'var(--glow-text)',
        }}
      >
        {display}
      </span>
      {isPaused && (
        <span
          className="mt-2 font-bold uppercase tracking-widest text-amber-400 text-[0.65vw] animate-pulse"
        >
          ⏸ PAUSED
        </span>
      )}
    </div>
  );
};
