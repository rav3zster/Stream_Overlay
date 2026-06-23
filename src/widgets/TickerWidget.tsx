import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { getThemeProfile } from '../lib/themes';

export const TickerWidget: React.FC = () => {
  const settings = useOverlayStore(s => s.settings);
  const showTicker = useOverlayStore(s => s.showTicker);
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);

  if (!showTicker) return null;

  const speedMap = { slow: '40s', normal: '25s', fast: '14s' };
  const duration = speedMap[settings.tickerSpeed] ?? '25s';

  // ──────────────────────────────────────────────────────────────
  // 1. RETRO CRT MONOSPACE LED TAPE
  // ──────────────────────────────────────────────────────────────
  if (profile === 'retro') {
    return (
      <div
        className="absolute bottom-0 left-0 w-full flex items-stretch z-30 font-mono text-[#33ff33] bg-[#051405] border-t border-[#33ff33]/50"
        style={{ height: '32px' }}
      >
        <div className="flex items-center gap-1.5 px-3 flex-shrink-0 bg-[#0c300c] text-[0.65vw] font-black uppercase border-r border-[#33ff33]/40">
          [LED_TAPE] &gt;
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center">
          <div
            className="absolute whitespace-nowrap px-4 font-bold text-[0.7vw]"
            style={{ animation: `scrollTicker ${duration} linear infinite` }}
          >
            {settings.tickerText}
            &nbsp;&nbsp;&nbsp;***&nbsp;&nbsp;&nbsp;
            {settings.tickerText}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. MOTORSPORT RACING SCORESBOARD
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    return (
      <div
        className="absolute bottom-0 left-0 w-full flex items-stretch z-30 font-mono text-white bg-black border-t-2 border-[var(--accent-primary)]"
        style={{ height: '32px' }}
      >
        <div className="flex items-center gap-1.5 px-4 flex-shrink-0 bg-[var(--accent-primary)] text-black text-[0.55vw] font-black uppercase tracking-widest">
          📊 F1 SCOREBOARD
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center bg-[#090909]">
          <div
            className="absolute whitespace-nowrap px-4 font-black text-[0.65vw] text-slate-200 tracking-wider uppercase"
            style={{ animation: `scrollTicker ${duration} linear infinite` }}
          >
            {settings.tickerText.toUpperCase()}
            &nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;&nbsp;
            {settings.tickerText.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-4 px-4 flex-shrink-0 border-l border-white/10 text-[0.55vw] font-extrabold bg-[#0d0d0d] text-slate-400">
          <span>TWITCH // {settings.socials.twitch.toUpperCase()}</span>
          <span>TWITTER // {settings.socials.twitter.toUpperCase()}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. PORSCHE GULF CLASSIC BAND
  // ──────────────────────────────────────────────────────────────
  if (profile === 'gulf') {
    return (
      <div
        className="absolute bottom-0 left-0 w-full flex items-stretch z-30 text-[#121e2c] border-t-4 border-[#ff5800]"
        style={{ height: '32px', background: '#e8f1f5' }}
      >
        <div className="flex items-center gap-1.5 px-4 flex-shrink-0 bg-[#709cb8] text-white text-[0.6vw] font-black uppercase tracking-widest">
          🏁 CLASSIC RALLY
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center">
          <div
            className="absolute whitespace-nowrap px-4 font-bold text-[0.7vw]"
            style={{ animation: `scrollTicker ${duration} linear infinite` }}
          >
            {settings.tickerText}
            &nbsp;&nbsp;&nbsp;★&nbsp;&nbsp;&nbsp;
            {settings.tickerText}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. COZY LOFI GARLAND PAPER TAPE
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cozy') {
    return (
      <div
        className="absolute bottom-0 left-0 w-full flex items-stretch z-30 text-amber-100 font-display border-t border-amber-900/15"
        style={{ height: '32px', background: 'rgba(26, 18, 33, 0.95)' }}
      >
        <div className="flex items-center gap-1.5 px-3 flex-shrink-0 bg-amber-900/20 text-[0.6vw] font-bold text-amber-300 uppercase tracking-widest border-r border-amber-900/10">
          📝 CAFE NOTE
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center">
          <div
            className="absolute whitespace-nowrap px-4 text-amber-100 font-display text-[0.7vw] font-medium"
            style={{ animation: `scrollTicker ${duration} linear infinite` }}
          >
            {settings.tickerText}
            &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
            {settings.tickerText}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 5. MINIMALIST APPLE FOOTER BAR
  // ──────────────────────────────────────────────────────────────
  if (profile === 'minimal') {
    const isDark = theme.includes('dark') || theme.includes('black') || theme.includes('purple');
    return (
      <div
        className={`absolute bottom-0 left-0 w-full flex items-stretch z-30 font-sans border-t ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
        style={{ height: '32px' }}
      >
        <div className="flex items-center gap-1.5 px-4 flex-shrink-0 text-[0.55vw] font-extrabold uppercase tracking-widest border-r border-slate-500/10 text-slate-400">
          FEED
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center">
          <div
            className="absolute whitespace-nowrap px-4 font-medium text-[0.7vw] tracking-tight"
            style={{ animation: `scrollTicker ${duration} linear infinite` }}
          >
            {settings.tickerText}
            &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
            {settings.tickerText}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 6. GLASSMORPHIC BLUR FOOTER
  // ──────────────────────────────────────────────────────────────
  if (profile === 'glass') {
    return (
      <div
        className="absolute bottom-0 left-0 w-full flex items-stretch z-30 text-white border-t border-white/10 backdrop-blur-md"
        style={{ height: '32px', background: 'rgba(255, 255, 255, 0.05)' }}
      >
        <div className="flex items-center gap-1.5 px-4 flex-shrink-0 bg-white/10 text-[0.6vw] font-bold uppercase tracking-wider text-pink-300 border-r border-white/5">
          🔮 INFO TAPE
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center">
          <div
            className="absolute whitespace-nowrap px-4 font-bold text-[0.7vw] glow-text-theme"
            style={{ animation: `scrollTicker ${duration} linear infinite` }}
          >
            {settings.tickerText}
            &nbsp;&nbsp;&nbsp;✧&nbsp;&nbsp;&nbsp;
            {settings.tickerText}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 7. LUXURY GOLD ACCENTS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'luxury') {
    return (
      <div
        className="absolute bottom-0 left-0 w-full flex items-stretch z-30 font-serif text-white bg-black border-t border-[#d4af37]"
        style={{ height: '32px' }}
      >
        <div className="flex items-center gap-1.5 px-4 flex-shrink-0 bg-[#111] text-[#d4af37] text-[0.65vw] font-bold tracking-widest border-r border-[#d4af37]/20">
          BULLETIN
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center bg-[#090909]">
          <div
            className="absolute whitespace-nowrap px-4 font-serif text-[0.7vw] tracking-widest"
            style={{ animation: `scrollTicker ${duration} linear infinite` }}
          >
            {settings.tickerText.toUpperCase()}
            &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
            {settings.tickerText.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 8. STANDARD CYBERPUNK / FALLBACK TICKER BAR
  // ──────────────────────────────────────────────────────────────
  return (
    <div
      className="absolute bottom-0 left-0 w-full flex items-stretch z-30"
      style={{
        height: '32px',
        background: 'var(--panel-bg)',
        borderTop: '1px solid var(--panel-border)',
      }}
    >
      <div
        className="flex items-center gap-1 px-3 flex-shrink-0 font-display font-extrabold uppercase tracking-widest text-white z-10"
        style={{
          fontSize: '0.65vw',
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: '4px 0 12px var(--accent-primary-shadow, rgba(168,85,247,0.4))',
        }}
      >
        📢 INFO
      </div>

      <div className="flex-grow overflow-hidden relative flex items-center">
        <div
          className="absolute whitespace-nowrap font-semibold text-[var(--text-primary)] px-4"
          style={{
            fontSize: '0.7vw',
            animation: `scrollTicker ${duration} linear infinite`,
          }}
        >
          {settings.tickerText}
          &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
          {settings.tickerText}
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-3 flex-shrink-0 border-l font-bold"
        style={{ borderColor: 'var(--panel-border)', fontSize: '0.65vw' }}
      >
        <span style={{ color: '#9146FF' }}>Twitch</span>
        <span style={{ color: 'var(--text-secondary)' }}>{settings.socials.twitch}</span>
        <span className="opacity-30 mx-1">|</span>
        <span style={{ color: '#1DA1F2' }}>Twitter</span>
        <span style={{ color: 'var(--text-secondary)' }}>{settings.socials.twitter}</span>
      </div>
    </div>
  );
};
