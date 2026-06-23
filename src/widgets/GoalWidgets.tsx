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

  const goal = type === 'sub' ? subGoal : type === 'donation' ? donationGoal : followerGoal;
  const cfg = GOAL_CONFIG[type];
  const pct = Math.min((goal.current / goal.target) * 100, 100);

  const isDono = type === 'donation';
  const currentStr = isDono ? `$${goal.current}` : goal.current.toString();
  const targetStr = isDono ? `$${goal.target}` : goal.target.toString();

  // ──────────────────────────────────────────────────────────────
  // 1. RETRO CRT MONOSPACE BAR METER
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
  // 2. MOTORSPORT RPM SHIFT LIGHT INDICATORS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    const ledCount = 10;
    const activeLeds = Math.round((pct / 100) * ledCount);
    return (
      <div className="flex flex-col justify-center h-full px-[1vw] py-[0.3vw] font-mono leading-none text-white">
        <div className="flex justify-between text-[0.45vw] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
          <span>{cfg.label} TELEMETRY</span>
          <span className="text-[var(--accent-primary)] font-black">{currentStr} / {targetStr} ({Math.round(pct)}%)</span>
        </div>
        {/* Steering Wheel Shift Lights (RPM Bar) */}
        <div className="flex items-center justify-between bg-black/60 p-[0.3vw] border border-white/5 rounded-sm">
          <div className="flex gap-[0.4vw]">
            {Array.from({ length: ledCount }).map((_, i) => {
              const active = i < activeLeds;
              // RPM Light Color Gradient logic
              let ledColor = 'bg-[#121212]';
              if (active) {
                if (i < 4) ledColor = 'bg-emerald-500 shadow-[0_0_8px_#10b981]'; // Green
                else if (i < 8) ledColor = 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'; // Yellow
                else ledColor = 'bg-rose-600 shadow-[0_0_10px_#e11d48]'; // Red limit line
              }
              return (
                <span 
                  key={i} 
                  className={`w-[1.2vw] h-[0.5vw] rounded-full transition-all duration-300 ${ledColor}`} 
                />
              );
            })}
          </div>
          <span className="text-[0.55vw] font-black text-rose-500 animate-pulse tracking-tighter pl-1">
            {pct >= 100 ? 'RPM LIMIT' : 'REV_LIMIT'}
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
