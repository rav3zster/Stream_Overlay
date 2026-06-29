import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { getThemeProfile } from '../lib/themes';

interface GoalWidgetProps {
  type: 'sub' | 'donation' | 'follower';
  compact?: boolean;
}

const GOAL_CONFIG = {
  sub: { label: 'SUBSCRIBER GOAL', icon: '★', accentClass: 'from-purple-500 to-pink-500', color: '#ec4899' },
  donation: { label: 'DONATION GOAL', icon: '♥', accentClass: 'from-emerald-400 to-cyan-500', color: '#10b981' },
  follower: { label: 'FOLLOWER GOAL', icon: '♦', accentClass: 'from-indigo-400 to-purple-600', color: '#6366f1' },
};

export const GoalWidget: React.FC<GoalWidgetProps> = ({ type, compact = false }) => {
  const subGoal = useOverlayStore(s => s.subGoal);
  const donationGoal = useOverlayStore(s => s.donationGoal);
  const followerGoal = useOverlayStore(s => s.followerGoal);
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);
  const latestFollower = useOverlayStore(s => s.latestFollower);
  const latestSubscriber = useOverlayStore(s => s.latestSubscriber);
  const latestDonation = useOverlayStore(s => s.latestDonation);

  const goal = type === 'sub' ? subGoal : type === 'donation' ? donationGoal : followerGoal;
  const cfg = GOAL_CONFIG[type];
  const pct = Math.min((goal.current / goal.target) * 100, 100);

  const isDono = type === 'donation';
  const currentStr = isDono ? `$${goal.current}` : goal.current.toString();
  const targetStr = isDono ? `$${goal.target}` : goal.target.toString();

  // ──────────────────────────────────────────────────────────────
  // 1. PASTEL PLANETS THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'planets') {
    if (compact) {
      let title = 'LATEST FOLLOWER';
      let value = latestFollower || 'No one';
      let emoji = '🪐';
      if (type === 'sub') {
        title = 'LATEST SUBSCRIBER';
        value = latestSubscriber || 'No one';
        emoji = '★';
      } else if (type === 'donation') {
        title = 'TOP DONATION';
        value = latestDonation ? `${latestDonation.user} ${latestDonation.amount}` : 'None';
        emoji = '♥';
      }

      return (
        <div className="flex items-center h-full w-full px-3 py-1 font-display leading-none select-none text-white gap-2">
          <span className="text-[1.2vw] flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>{emoji}</span>
          <div className="flex flex-col text-left justify-center flex-grow min-w-0">
            <span className="text-[0.48vw] text-[#FFD6A5] font-black uppercase tracking-widest">{title}</span>
            <span className="text-[0.8vw] font-black text-white truncate mt-0.5">{value}</span>
          </div>
        </div>
      );
    }

    // Full goal bar
    return (
      <div className="flex flex-col justify-center h-full px-4 py-2 font-display leading-none text-white relative">
        <div className="flex justify-between items-center text-[0.6vw] font-black tracking-widest text-[#FFD6A5] mb-2">
          <span>🪐 {cfg.label}</span>
          <span className="text-[#FFC6FF] font-black">{currentStr} / {targetStr}</span>
        </div>
        <div className="w-full h-4 bg-[#4c3a75] border-2 border-[#BDB2FF]/40 rounded-full overflow-hidden p-0.5 relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#FFC6FF] to-[#BDB2FF] rounded-full transition-all duration-700 relative"
            style={{ width: `${pct}%` }}
          >
            {/* Star-shaped progress indicator floating at the edge of the progress bar */}
            <div 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 flex items-center justify-center text-[#FFD6A5] text-[1.1vw] filter drop-shadow-[0_0_4px_rgba(255,214,165,0.8)]"
              style={{ display: pct > 2 ? 'flex' : 'none' }}
            >
              ✦
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[0.55vw] text-[#BDB2FF]/85 font-black uppercase tracking-wider">
          <span>{pct >= 100 ? 'ORBIT REACHED!' : 'SPACE TRAVEL'}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. CYBER HUD THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cyberhud') {
    if (compact) {
      let title = 'NEW FOLLOWER';
      let value = latestFollower || 'OFFLINE_NODE';
      let statCode = 'F_REC_0';
      if (type === 'sub') {
        title = 'NEW SUBSCRIBER';
        value = latestSubscriber || 'OFFLINE_NODE';
        statCode = 'S_REC_0';
      } else if (type === 'donation') {
        title = 'NEW DONATION';
        value = latestDonation ? `${latestDonation.user} [${latestDonation.amount}]` : 'OFFLINE_VAL';
        statCode = 'D_REC_0';
      }

      return (
        <div className="flex items-center h-full w-full px-3 py-1 font-mono text-[#00F0FF] leading-none select-none relative bg-[#0b1016]/40">
          <div className="flex-shrink-0 mr-2.5 flex items-center justify-center bg-[#00F0FF]/5 w-6 h-6 border border-[#00F0FF]/30">
            <span className="text-[0.55vw] font-black">{statCode}</span>
          </div>
          <div className="flex-grow overflow-hidden min-w-0 flex flex-col justify-center">
            <span className="text-[0.45vw] text-[#00F0FF]/50 font-bold uppercase tracking-widest">{title}</span>
            <span className="text-[0.8vw] font-black truncate mt-1 text-[#00F0FF] filter drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]">
              &gt; {value}
            </span>
          </div>
          <div className="flex flex-col items-end flex-shrink-0 justify-center pl-2 border-l border-[#00F0FF]/15">
            <span className="text-[0.45vw] text-[#00F0FF]/40">STB_V</span>
            <span className="text-[0.55vw] font-bold text-emerald-400 mt-1">ONLINE</span>
          </div>
        </div>
      );
    }

    // Segmented neon blue loop scanner rev bar
    const ticksCount = 24;
    const filledTicks = Math.round((pct / 100) * ticksCount);

    return (
      <div className="flex flex-col justify-center h-full px-[1vw] py-[0.4vw] font-mono leading-none text-[#00F0FF] bg-[#0b1016]/40">
        <div className="flex justify-between items-center text-[0.48vw] font-extrabold text-[#00F0FF]/60 uppercase tracking-widest mb-1.5 border-b border-[#00F0FF]/10 pb-1">
          <span>[SYS_METRIC: {cfg.label}]</span>
          <span className="text-[#00F0FF] font-black filter drop-shadow-[0_0_4px_rgba(0,240,255,0.5)]">{currentStr} / {targetStr}</span>
        </div>
        
        {/* Segmented meter bar */}
        <div className="w-full h-[0.7vw] bg-[#0e1621]/80 border border-[#00F0FF]/25 p-[1px] flex gap-[2px] overflow-hidden">
          {Array.from({ length: ticksCount }).map((_, i) => {
            const filled = i < filledTicks;
            const tickBg = filled 
              ? 'bg-[#00F0FF] shadow-[0_0_4px_rgba(0,240,255,0.6)]' 
              : 'bg-[#00F0FF]/5';
            return (
              <div 
                key={i} 
                className={`flex-grow h-full transition-all duration-300 ${tickBg}`} 
              />
            );
          })}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-[0.45vw] text-[#00F0FF]/40 font-bold uppercase tracking-wider">
            {pct >= 100 ? 'LINK_ESTABLISHED' : 'SCANNER_ACTIVE'}
          </span>
          <span className="text-[0.55vw] text-[#00F0FF] font-black">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. ESPORTS TELEMETRY THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'esports') {
    if (compact) {
      let title = 'LAST FOLLOW';
      let value = latestFollower || 'NONE';
      if (type === 'sub') {
        title = 'LAST SUBSCRIBER';
        value = latestSubscriber || 'NONE';
      } else if (type === 'donation') {
        title = 'TOP DONATION';
        value = latestDonation ? `${latestDonation.amount} FROM ${latestDonation.user.toUpperCase()}` : 'NONE';
      }

      return (
        <div className="flex items-center justify-between h-full w-full px-[1vw] py-[0.2vw] font-sans leading-none select-none text-white">
          <div className="flex items-center gap-[0.5vw]">
            <span className="text-[0.5vw] text-[#2979FF] font-black uppercase tracking-[0.25em]">{title}:</span>
            <span className="text-[0.8vw] font-black text-white truncate uppercase tracking-tight skew-x-[-6deg] bg-[#2979FF]/10 px-2 py-0.5 border-l border-[#2979FF]">
              {value}
            </span>
          </div>
          <span className="text-[0.45vw] text-slate-500 font-bold uppercase tracking-wider">LIVE DATA</span>
        </div>
      );
    }

    // Bold slanted progress bar
    return (
      <div className="flex flex-col justify-center h-full px-[1vw] py-[0.4vw] font-sans leading-none text-white select-none">
        <div className="flex justify-between items-center text-[0.5vw] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          <span>⚔️ {cfg.label}</span>
          <span className="text-[#2979FF] font-black skew-x-[-6deg] bg-[#2979FF]/10 px-1.5 py-0.5 border-l border-[#2979FF]">{currentStr} / {targetStr}</span>
        </div>
        
        {/* Slanted progress container */}
        <div className="w-full h-[0.7vw] bg-[#0c142c] border border-[#2979FF]/30 skew-x-[-8deg] overflow-hidden relative p-[1px]">
          <div
            className="h-full bg-[#2979FF] transition-all duration-1000 shadow-[0_0_8px_rgba(41,121,255,0.6)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-1 text-[0.48vw]">
          <span className="text-slate-500 font-extrabold uppercase tracking-wider">ARENA_REV</span>
          <span className="text-[#2979FF] font-black">{Math.round(pct)}%</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. RETRO CRT MONOSPACE BAR METER
  // ──────────────────────────────────────────────────────────────
  if (profile === 'retro') {
    const barsNum = 12;
    const filledNum = Math.round((pct / 100) * barsNum);
    const meterStr = `[${'█'.repeat(filledNum)}${'.'.repeat(barsNum - filledNum)}]`;
    return (
      <div className="flex flex-col justify-center h-full px-2 font-mono text-[#33ff33] leading-none text-left">
        <div className="flex justify-between text-[0.6vw] font-bold text-[#228822]">
          <span>{cfg.label}</span>
          <span>{currentStr}/{targetStr}</span>
        </div>
        <div className="text-[1.1vw] font-bold mt-1 tracking-widest flex items-center gap-1.5">
          <span>{meterStr}</span>
          <span className="text-[0.8vw]">{Math.round(pct)}%</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. MOTORSPORT RPM SHIFT LIGHT INDICATORS / TELEMETRY LABELS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    if (compact) {
      // Telemetry Header Stat layout exactly matching the top widgets in the screenshot
      let title = 'LATEST FOLLOWER';
      let value = latestFollower || 'No one';
      let svgIcon = (
        <svg className="w-[1.2vw] h-[1.2vw] text-[var(--accent-primary)] filter drop-shadow-[0_0_4px_var(--accent-primary-shadow)]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );

      if (type === 'sub') {
        title = 'LATEST SUBSCRIBER';
        value = latestSubscriber || 'No one';
        svgIcon = (
          <svg className="w-[1.2vw] h-[1.2vw] text-[var(--accent-primary)] filter drop-shadow-[0_0_4px_var(--accent-primary-shadow)]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (type === 'donation') {
        title = 'TOP DONATION';
        value = latestDonation ? `${latestDonation.user} ${latestDonation.amount}` : 'None';
        svgIcon = (
          <svg className="w-[1.2vw] h-[1.2vw] text-[var(--accent-primary)] filter drop-shadow-[0_0_4px_var(--accent-primary-shadow)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        );
      }

      return (
        <div className="flex items-center h-full w-full px-[0.8vw] py-[0.3vw] font-mono leading-none select-none">
          <div className="flex-shrink-0 mr-[0.6vw] flex items-center justify-center bg-black/45 w-[2vw] h-[2vw] rounded-sm border border-white/5">
            {svgIcon}
          </div>
          <div className="flex flex-col text-left justify-center flex-grow min-w-0">
            <span className="text-[0.48vw] text-slate-500 font-extrabold uppercase tracking-widest">{title}</span>
            <span className="text-[0.85vw] font-black text-white truncate mt-0.5">{value}</span>
          </div>
        </div>
      );
    }

    // Goal Bar: Segmented LCD / HUD digital progress meter
    const ticksCount = 20;
    const filledTicks = Math.round((pct / 100) * ticksCount);

    return (
      <div className="flex flex-col justify-center h-full px-[1vw] py-[0.4vw] font-mono leading-none text-white select-none">
        <div className="flex justify-between items-center text-[0.48vw] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
          <span>{cfg.label}</span>
          <span className="text-[var(--accent-primary)] font-black">{currentStr} / {targetStr}</span>
        </div>
        
        {/* Segmented meter bar */}
        <div className="w-full h-[0.7vw] bg-black/60 border border-white/5 rounded-sm p-[1px] flex gap-[1px]">
          {Array.from({ length: ticksCount }).map((_, i) => {
            const filled = i < filledTicks;
            let tickBg = 'bg-white/5';
            if (filled) {
              if (i < ticksCount * 0.6) {
                tickBg = 'bg-[var(--accent-primary)] shadow-[0_0_4px_var(--accent-primary-shadow)]';
              } else if (i < ticksCount * 0.85) {
                tickBg = 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]';
              } else {
                tickBg = 'bg-rose-600 shadow-[0_0_6px_rgba(225,29,72,0.6)]';
              }
            }
            return (
              <div 
                key={i} 
                className={`flex-grow h-full rounded-[1px] transition-all duration-300 ${tickBg}`} 
              />
            );
          })}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-[0.45vw] text-slate-500 font-bold uppercase tracking-wider">
            {pct >= 100 ? 'GOAL MET' : 'REV METER'}
          </span>
          <span className="text-[0.55vw] text-[var(--accent-primary)] font-black">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. PORSCHE GULF CLASSIC RACING STRIPES
  // ──────────────────────────────────────────────────────────────
  if (profile === 'gulf') {
    return (
      <div className="flex flex-col justify-center h-full px-[1.2vw] text-[#121e2c] leading-none">
        <div className="flex justify-between items-center text-[0.6vw] font-black uppercase tracking-wider text-[#709cb8] mb-1.5">
          <span>{cfg.label}</span>
          <span>{currentStr} / {targetStr}</span>
        </div>
        <div className="w-full h-4 bg-white border border-[#709cb8]/30 rounded-full overflow-hidden p-0.5 shadow-sm">
          <div
            className="h-full rounded-full transition-all duration-1000 relative"
            style={{
              width: `${pct}%`,
              // Classic Gulf racing stripes gradient
              background: 'linear-gradient(90deg, #709cb8 0%, #709cb8 42%, #ff5800 42%, #ff5800 58%, #709cb8 58%)'
            }}
          />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. COZY CAFE / BEDROOM WOODEN MUG FILLER
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cozy') {
    return (
      <div className="flex items-center justify-between h-full px-[1vw] text-amber-100 font-display leading-none">
        <div className="flex flex-col text-left justify-center flex-grow min-w-0 pr-3">
          <span className="text-[0.6vw] text-amber-300 font-bold uppercase tracking-wider mb-1">
            ☕ {cfg.label}
          </span>
          <div className="w-full h-[6px] bg-amber-950/40 border border-amber-900/20 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 justify-center">
          <span className="text-[0.8vw] font-black text-white tabular-nums">{currentStr} / {targetStr}</span>
          <span className="text-[0.55vw] text-amber-400 font-medium tracking-wider mt-0.5">{Math.round(pct)}% filled</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 5. MINIMALIST APPLE CLEAN METER
  // ──────────────────────────────────────────────────────────────
  if (profile === 'minimal') {
    return (
      <div className="flex flex-col justify-center h-full px-[1vw] text-[var(--text-primary)] leading-none text-left">
        <div className="flex justify-between items-center text-[0.5vw] font-extrabold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
          <span>{cfg.label}</span>
          <span>{currentStr} / {targetStr}</span>
        </div>
        <div className="w-full h-[3px] bg-slate-500/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 6. GLASSMORPHIC LIQUID CYLINDER
  // ──────────────────────────────────────────────────────────────
  if (profile === 'glass') {
    return (
      <div className="flex flex-col justify-center h-full px-[1vw] text-white leading-none">
        <div className="flex justify-between items-center text-[0.55vw] font-bold tracking-wider text-pink-300 mb-1.5">
          <span>🔮 {cfg.label}</span>
          <span>{currentStr} / {targetStr}</span>
        </div>
        <div className="w-full h-[6px] bg-white/5 border border-white/10 rounded-full overflow-hidden p-[1px]">
          <div
            className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-pink-400 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 7. LUXURY ELEGANT GOLD LINE
  // ──────────────────────────────────────────────────────────────
  if (profile === 'luxury') {
    return (
      <div className="flex flex-col justify-center h-full px-[1.2vw] text-white font-serif leading-none">
        <div className="flex justify-between items-center text-[0.55vw] tracking-widest text-[#d4af37] font-semibold mb-1.5">
          <span>{cfg.label}</span>
          <span>{currentStr} / {targetStr}</span>
        </div>
        <div className="w-full h-[1px] bg-white/10 relative">
          <div
            className="absolute left-0 top-0 h-[2px] -translate-y-[0.5px] bg-[#d4af37] transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 8. STANDARD CYBERPUNK / FALLBACK SLIDER
  // ──────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex flex-col justify-center h-full px-[1vw] gap-[0.3vw]">
        <div className="flex justify-between items-center text-[0.6vw]">
          <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {cfg.icon} {cfg.label}
          </span>
          <span className="font-display font-black text-[var(--accent-secondary)]">
            {currentStr} / {targetStr}
          </span>
        </div>
        <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className={`h-full bg-gradient-to-r ${cfg.accentClass} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%`, boxShadow: '0 0 6px var(--accent-primary-shadow)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full px-[1.2vw] gap-[0.5vw]">
      <div className="flex justify-between items-center text-[0.65vw]">
        <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {cfg.icon} {cfg.label}
        </span>
        <span className="font-display font-black text-[var(--accent-secondary)] text-[0.8vw]">
          {currentStr} / {targetStr}
        </span>
      </div>
      <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div
          className={`h-full bg-gradient-to-r ${cfg.accentClass} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, boxShadow: '0 0 8px var(--accent-primary-shadow)' }}
        />
      </div>
      {pct >= 100 && (
        <span className="text-center font-bold text-[var(--accent-secondary)] animate-pulse text-[0.6vw]">
          🎉 GOAL REACHED!
        </span>
      )}
    </div>
  );
};

export const SubscriberGoalWidget: React.FC<{ compact?: boolean }> = (p) => <GoalWidget type="sub" {...p} />;
export const DonationGoalWidget: React.FC<{ compact?: boolean }> = (p) => <GoalWidget type="donation" {...p} />;
export const FollowerGoalWidget: React.FC<{ compact?: boolean }> = (p) => <GoalWidget type="follower" {...p} />;
