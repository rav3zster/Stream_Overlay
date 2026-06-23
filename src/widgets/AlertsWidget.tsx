import React, { useEffect } from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { getThemeProfile } from '../lib/themes';

const CHIME_NOTES: Record<string, number[]> = {
  follow: [587.33, 880],
  subscribe: [523.25, 659.25, 783.99, 1046.50],
  donation: [987.77, 1318.51],
  raid: [392.00, 587.33, 783.99],
  host: [392.00, 587.33, 783.99],
};

const playChime = (type: string) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = CHIME_NOTES[type] ?? [440];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type === 'raid' ? 'sawtooth' : type === 'donation' ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
    });
  } catch { /* AudioContext may be blocked */ }
};

const TYPE_ICONS: Record<string, string> = {
  follow: '💜', subscribe: '⭐', donation: '💰', raid: '🔥', host: '🎉',
};
const TYPE_LABELS: Record<string, string> = {
  follow: 'NEW FOLLOWER', subscribe: 'NEW SUBSCRIBER', donation: 'NEW DONATION',
  raid: 'INCOMING RAID', host: 'HOSTED BY',
};

export const AlertsWidget: React.FC = () => {
  const activeAlert = useOverlayStore(s => s.activeAlert);
  const dismissAlert = useOverlayStore(s => s.dismissAlert);
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);

  useEffect(() => {
    if (!activeAlert) return;
    playChime(activeAlert.type);
    const t = setTimeout(() => dismissAlert(), 5000);
    return () => clearTimeout(t);
  }, [activeAlert, dismissAlert]);

  if (!activeAlert) return null;

  // ──────────────────────────────────────────────────────────────
  // 1. RETRO CRT POPUP BOX
  // ──────────────────────────────────────────────────────────────
  if (profile === 'retro') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(380px,38vw)]"
        style={{ animation: 'alertPop 0.3s steps(4) forwards' }}
      >
        <div className="border-[3px] border-[#33ff33] bg-[#051405] text-[#33ff33] p-4 font-mono leading-normal shadow-[0_0_15px_rgba(51,255,51,0.4)]">
          <div className="text-center font-bold border-b border-[#33ff33] pb-1.5 mb-2.5">
            !!! [ALERT_EVENT] !!!
          </div>
          <div className="text-[0.65vw] text-[#228822] uppercase tracking-widest font-extrabold">
            SIGNAL: {TYPE_LABELS[activeAlert.type] || activeAlert.type.toUpperCase()}
          </div>
          <div className="text-[1.5vw] font-black tracking-widest text-[#33ff33] truncate mt-1">
            &gt; {activeAlert.username.toUpperCase()}
          </div>
          {activeAlert.amount && (
            <div className="text-[0.8vw] text-emerald-400 font-extrabold mt-1.5">
              VALUE: {activeAlert.amount}
            </div>
          )}
          {activeAlert.message && (
            <div className="text-[0.65vw] italic text-[#aaffaa] mt-2 border-t border-[#33ff33]/25 pt-2">
              "{activeAlert.message}"
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. MOTORSPORT RACING YELLOW FLAG BANNER
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(480px,48vw)]"
        style={{ animation: 'alertPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="relative bg-amber-400 text-black p-[1vw] border-[3px] border-black flex items-center gap-[1vw] overflow-hidden select-none font-mono">
          {/* Checkered flag strip side bar */}
          <div className="w-[1.8vw] h-full flex flex-col absolute left-0 top-0 bottom-0 bg-black text-white text-[5px] justify-center leading-none select-none overflow-hidden font-black">
            {Array.from({ length: 12 }).map((_, idx) => (
              <span key={idx} className="block text-center">{idx % 2 === 0 ? '■ □' : '□ ■'}</span>
            ))}
          </div>

          <div className="pl-[1.5vw] flex-grow leading-none">
            <span className="block text-[0.55vw] font-black uppercase tracking-widest text-slate-900">
              ⚠️ FLAG ALERT: {TYPE_LABELS[activeAlert.type] || activeAlert.type.toUpperCase()}
            </span>
            <span className="block text-[1.6vw] font-black tracking-tighter truncate uppercase mt-1">
              {activeAlert.username}
            </span>
            {activeAlert.amount && (
              <span className="inline-block mt-1 bg-black text-amber-400 font-black px-[0.6vw] py-[0.1vw] text-[0.75vw] rounded-sm">
                SPONSOR: {activeAlert.amount}
              </span>
            )}
            {activeAlert.message && (
              <span className="block text-[0.65vw] font-bold text-slate-800 tracking-tight truncate mt-1">
                COMM: "{activeAlert.message.toUpperCase()}"
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. PORSCHE GULF CLASSIC BADGE
  // ──────────────────────────────────────────────────────────────
  if (profile === 'gulf') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(380px,38vw)]"
        style={{ animation: 'alertPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
      >
        <div className="relative rounded-[24px] bg-[#e8f1f5] border-[4px] border-[#ff5800] p-4 shadow-xl flex flex-col items-center justify-center text-center text-[#121e2c]">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#709cb8] flex items-center justify-center text-lg mb-1 shadow-sm flex-shrink-0">
            {TYPE_ICONS[activeAlert.type] || '🏆'}
          </div>
          <span className="text-[0.6vw] font-black uppercase tracking-wider text-[#709cb8] mb-1">
            {TYPE_LABELS[activeAlert.type] || activeAlert.type}
          </span>
          <span className="text-[1.6vw] font-serif font-black text-[#121e2c] tracking-tight">
            {activeAlert.username}
          </span>
          {activeAlert.amount && (
            <span className="mt-1 font-serif font-bold text-[#ff5800] text-[0.9vw]">
              {activeAlert.amount}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. COZY LO-FI POLAROID PHOTO SLIDE
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cozy') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(320px,32vw)]"
        style={{
          animation: 'alertPop 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards'
        }}
      >
        {/* Polaroid frame */}
        <div className="bg-[#fcf8f0] border-2 border-amber-950/20 rounded shadow-[0_15px_30px_rgba(26,18,33,0.3)] p-3 text-slate-800 flex flex-col select-none">
          {/* Photo area */}
          <div className="w-full aspect-video rounded bg-[#e8e2d5] flex items-center justify-center text-5xl border border-amber-950/5 relative overflow-hidden shadow-inner flex-shrink-0">
            <span className="animate-bounce">{TYPE_ICONS[activeAlert.type] ?? '📸'}</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/10 to-transparent pointer-events-none" />
          </div>

          {/* Pen note writing area */}
          <div className="mt-4 flex flex-col text-center font-display text-slate-700">
            <span className="text-[0.6vw] font-bold text-amber-800/60 uppercase tracking-widest">
              {TYPE_LABELS[activeAlert.type] || activeAlert.type.toUpperCase()}
            </span>
            <span className="text-[1.4vw] font-black text-slate-800 leading-tight font-display mt-0.5">
              {activeAlert.username}
            </span>
            {activeAlert.amount && (
              <span className="text-[0.85vw] font-bold text-amber-600 mt-1 font-display">
                {activeAlert.amount}
              </span>
            )}
            {activeAlert.message && (
              <span className="text-[0.7vw] font-medium text-slate-500 italic mt-1.5 font-display leading-tight">
                "{activeAlert.message}"
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 5. MINIMALIST APPLE BANNER
  // ──────────────────────────────────────────────────────────────
  if (profile === 'minimal') {
    const isDark = theme.includes('dark') || theme.includes('black') || theme.includes('purple');
    return (
      <div
        className="absolute top-[3%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(360px,36vw)]"
        style={{ animation: 'alertPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className={`rounded-2xl border p-3.5 shadow-lg flex items-center gap-3.5 ${isDark ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'}`}>
          <div className="w-9 h-9 rounded-full bg-slate-500/10 flex items-center justify-center text-lg flex-shrink-0">
            {TYPE_ICONS[activeAlert.type] ?? '🔔'}
          </div>
          <div className="flex-grow overflow-hidden leading-tight text-left">
            <span className="block text-[0.55vw] font-extrabold uppercase tracking-widest text-slate-400">
              {TYPE_LABELS[activeAlert.type] || activeAlert.type}
            </span>
            <span className="block text-[1vw] font-bold mt-0.5 truncate">
              {activeAlert.username}
            </span>
            {activeAlert.amount && (
              <span className="block text-[0.75vw] text-emerald-500 font-bold mt-0.5">
                {activeAlert.amount}
              </span>
            )}
            {activeAlert.message && !activeAlert.amount && (
              <span className="block text-[0.65vw] text-slate-400 italic truncate mt-0.5">
                "{activeAlert.message}"
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 6. GLASSMORPHIC FLOATING PANEL
  // ──────────────────────────────────────────────────────────────
  if (profile === 'glass') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(380px,38vw)]"
        style={{ animation: 'alertPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
      >
        <div className="relative rounded-2xl p-4 flex items-center gap-4 overflow-hidden border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl">
          <div className="w-[3vw] h-[3vw] rounded-full flex items-center justify-center text-[1.4vw] flex-shrink-0 bg-gradient-to-tr from-pink-400 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]">
            {TYPE_ICONS[activeAlert.type] ?? '🔮'}
          </div>
          <div className="flex-grow overflow-hidden text-left leading-tight">
            <span className="block text-[0.55vw] font-bold uppercase tracking-wider text-pink-300">
              {TYPE_LABELS[activeAlert.type] || activeAlert.type.toUpperCase()}
            </span>
            <span className="block text-[1.2vw] font-black text-white glow-text-theme truncate mt-1">
              {activeAlert.username}
            </span>
            {activeAlert.amount && (
              <span className="inline-block mt-1.5 rounded px-2.5 py-0.5 text-[0.7vw] font-bold text-white bg-pink-500/20 border border-pink-500/30">
                {activeAlert.amount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 7. LUXURY ROYAL WAX SEAL
  // ──────────────────────────────────────────────────────────────
  if (profile === 'luxury') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(360px,36vw)]"
        style={{ animation: 'alertPop 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
      >
        <div className="relative border border-[#d4af37] bg-[#111] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-center flex flex-col items-center justify-center font-serif">
          {/* Wax seal graphic badge */}
          <div className="w-[3.2vw] h-[3.2vw] rounded-full border-2 border-[#d4af37] bg-gradient-to-tr from-[#997300] to-[#ffd700] flex items-center justify-center text-white text-[1.3vw] shadow-md mb-2 flex-shrink-0 relative">
            <div className="absolute inset-0.5 border border-dashed border-white/20 rounded-full" />
            <span>⚜</span>
          </div>
          <span className="text-[0.5vw] uppercase tracking-widest text-[#d4af37] font-bold mb-1.5">
            {TYPE_LABELS[activeAlert.type] || activeAlert.type}
          </span>
          <span className="text-[1.5vw] text-white tracking-widest font-serif leading-none truncate uppercase w-full">
            {activeAlert.username}
          </span>
          {activeAlert.amount && (
            <span className="mt-2 text-[0.85vw] font-bold text-[#d4af37] border-t border-[#d4af37]/20 pt-1.5 w-1/2">
              {activeAlert.amount}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 8. PASTEL PLANETS BADGE
  // ──────────────────────────────────────────────────────────────
  if (profile === 'planets') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(380px,38vw)]"
        style={{ animation: 'alertPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
      >
        <div className="relative rounded-[24px] bg-[#3a2b5e] border-[4px] border-[#BDB2FF] p-4 shadow-[0_8px_24px_rgba(28,20,44,0.45)] flex flex-col items-center justify-center text-center text-[#E8AEFF] overflow-hidden">
          <div className="absolute -top-1 -left-1 text-xs text-[#FFD6A5] select-none pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>✦</div>
          <div className="absolute -bottom-1 -right-1 text-xs text-[#FFD6A5] select-none pointer-events-none">✦</div>
          <div className="w-10 h-10 rounded-full bg-[#BDB2FF] flex items-center justify-center text-lg mb-1 shadow-sm flex-shrink-0 animate-spin" style={{ animationDuration: '10s' }}>
            🛸
          </div>
          <span className="text-[0.65vw] font-black uppercase tracking-wider text-[#FFD6A5] mb-1">
            {TYPE_LABELS[activeAlert.type] || activeAlert.type}
          </span>
          <span className="text-[1.6vw] font-black text-white tracking-tight">
            {activeAlert.username}
          </span>
          {activeAlert.amount && (
            <span className="mt-1 font-bold text-[#FFD6A5] text-[0.9vw]">
              {activeAlert.amount}
            </span>
          )}
          {activeAlert.message && (
            <div className="text-[0.75vw] italic text-[#E8AEFF]/80 mt-2 border-t border-[#BDB2FF]/20 pt-2 w-full">
              "{activeAlert.message}"
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 9. HIGH TECH CYBER HUD SYSTEM INTERRUPT
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cyberhud') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(380px,38vw)]"
        style={{ animation: 'alertPop 0.3s ease-out forwards' }}
      >
        <div className="relative bg-[#0e1621]/95 border border-[#00F0FF] p-4 text-[#00F0FF] font-mono leading-normal shadow-[0_0_20px_rgba(0,240,255,0.35)] overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00F0FF]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00F0FF]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00F0FF]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00F0FF]" />
          
          <div className="text-[0.55vw] text-[#00F0FF]/60 uppercase tracking-widest font-mono flex justify-between border-b border-[#00F0FF]/25 pb-1 mb-2">
            <span>SYS_SIGNAL_INCOMING</span>
            <span>SEC_LVL_0</span>
          </div>
          
          <div className="text-[0.65vw] text-slate-400 uppercase tracking-widest font-bold">
            EVENT: {TYPE_LABELS[activeAlert.type] || activeAlert.type.toUpperCase()}
          </div>
          <div className="text-[1.5vw] font-black tracking-widest text-white truncate mt-1 animate-pulse">
            &gt;&gt; {activeAlert.username.toUpperCase()}
          </div>
          {activeAlert.amount && (
            <div className="text-[0.8vw] text-cyan-300 font-extrabold mt-1.5 font-mono">
              VAL: {activeAlert.amount}
            </div>
          )}
          {activeAlert.message && (
            <div className="text-[0.65vw] italic text-slate-300 mt-2 border-t border-[#00F0FF]/20 pt-2 font-mono">
              "{activeAlert.message}"
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 10. ARENA ESPORTS TELEMETRY NOTIFICATION
  // ──────────────────────────────────────────────────────────────
  if (profile === 'esports') {
    return (
      <div
        className="absolute top-[5%] left-1/2 z-50 pointer-events-none -translate-x-1/2 w-[min(440px,44vw)]"
        style={{ animation: 'alertPop 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <div className="relative bg-[#050c20]/95 text-white border-2 border-[#2979FF] p-4 shadow-[0_8px_24px_rgba(2,4,12,0.8)] overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-full bg-[#2979FF]/10 skew-x-12 translate-x-4 pointer-events-none" />
          <div className="text-[0.6vw] font-black uppercase tracking-wider text-[#2979FF] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#2979FF] rotate-45" />
            {TYPE_LABELS[activeAlert.type] || activeAlert.type.toUpperCase()}
          </div>
          <div className="text-[1.6vw] font-black tracking-tight text-white uppercase mt-1 truncate">
            {activeAlert.username}
          </div>
          {activeAlert.amount && (
            <span className="inline-block mt-1 bg-[#2979FF] text-white font-black px-2.5 py-0.5 text-[0.75vw]">
              CREDIT: {activeAlert.amount}
            </span>
          )}
          {activeAlert.message && (
            <div className="text-[0.7vw] font-medium text-slate-300 italic mt-2 border-l-2 border-[#2979FF] pl-2">
              "{activeAlert.message}"
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 11. STANDARD CYBERPUNK / FALLBACK ALERT BOX
  // ──────────────────────────────────────────────────────────────
  return (
    <div
      className="absolute top-[5%] left-1/2 z-50 pointer-events-none"
      style={{
        transform: 'translateX(-50%)',
        animation: 'alertPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        width: 'min(380px, 38vw)',
      }}
    >
      <div
        className="relative rounded-[12px] p-[1vw] flex items-center gap-[1vw] overflow-hidden backdrop-blur-md"
        style={{
          background: 'var(--panel-bg)',
          border: '2px solid var(--accent-primary)',
          boxShadow: '0 0 30px var(--accent-primary-shadow, rgba(168,85,247,0.4))',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, var(--accent-primary) 0%, transparent 50%)', opacity: 0.08 }}
        />

        <div
          className="w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center text-[1.5vw] flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: '0 0 15px var(--accent-primary-shadow, rgba(168,85,247,0.5))',
          }}
        >
          {TYPE_ICONS[activeAlert.type] ?? '✨'}
        </div>

        <div className="flex-grow overflow-hidden text-left">
          <span
            className="block font-display font-black tracking-widest uppercase"
            style={{ fontSize: '0.6vw', color: 'var(--accent-primary)' }}
          >
            {TYPE_LABELS[activeAlert.type] ?? activeAlert.type.toUpperCase()}
          </span>
          <span
            className="block font-black leading-tight"
            style={{ fontSize: '1.4vw', color: 'var(--text-primary)', textShadow: 'var(--glow-text)' }}
          >
            {activeAlert.username}
          </span>
          {activeAlert.amount && (
            <span
              className="inline-block mt-[0.2vw] rounded px-[0.5vw] py-[0.1vw] font-extrabold"
              style={{
                fontSize: '0.8vw',
                color: 'var(--accent-secondary)',
                background: 'rgba(92,255,226,0.1)',
                border: '1px solid rgba(92,255,226,0.3)',
              }}
            >
              {activeAlert.amount}
            </span>
          )}
          {activeAlert.message && !activeAlert.amount && (
            <span
              className="block italic leading-tight mt-[0.2vw]"
              style={{ fontSize: '0.65vw', color: 'var(--text-secondary)' }}
            >
              "{activeAlert.message}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
